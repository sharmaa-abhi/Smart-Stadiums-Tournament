import datetime
from typing import List, Callable, Optional, Dict, Any
from fastapi import Depends, HTTPException, status, Request
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session

from server.app.db.database import get_db
from server.app.db.models import UserModel, AuditLogModel
from server.app.core.auth0 import auth0_validator, ROLE_PERMISSIONS_MAP

security_scheme = HTTPBearer(auto_error=False)

def log_audit_action(
    db: Session,
    request: Request,
    user: Optional[UserModel],
    action: str,
    resource: str,
    status_code: str = "SUCCESS",
    details: Optional[str] = None
):
    """Writes audit event to audit_logs table."""
    try:
        user_id = user.auth0_id if user else "anonymous"
        user_email = user.email if user else "anonymous"
        role = user.role if user else "none"
        
        client_ip = request.client.host if request.client else "127.0.0.1"
        user_agent = request.headers.get("user-agent", "unknown")

        audit_entry = AuditLogModel(
            user_id=user_id,
            user_email=user_email,
            role=role,
            action=action,
            resource=resource,
            ip_address=client_ip,
            user_agent=user_agent,
            status=status_code,
            details=details,
            created_at=datetime.datetime.utcnow()
        )
        db.add(audit_entry)
        db.commit()
    except Exception as e:
        db.rollback()
        print(f"Error logging audit action: {e}")

async def get_current_user(
    request: Request,
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security_scheme),
    db: Session = Depends(get_db)
) -> Dict[str, Any]:
    """
    Validates JWT token, extracts claims, syncs user into SQLite/PostgreSQL database,
    and returns current active user context.
    """
    if not credentials or not credentials.credentials:
        log_audit_action(db, request, None, "AUTHENTICATION_FAILED", request.url.path, "UNAUTHORIZED", "Missing Bearer token")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication token required. Bearer token missing.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    token = credentials.credentials
    payload = auth0_validator.verify_token(token)

    auth0_id = payload.get("sub")
    email = payload.get("email") or f"{auth0_id.replace('|', '_')}@stadiumgenius.io"
    name = payload.get("name") or email.split("@")[0]
    avatar = payload.get("picture")
    role = payload.get("role", "operator")
    permissions = payload.get("permissions", [])
    email_verified = payload.get("email_verified", True)

    if not auth0_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid JWT structure: missing 'sub' claim.",
        )

    # Sync with database
    user = db.query(UserModel).filter(UserModel.auth0_id == auth0_id).first()
    if not user:
        user = UserModel(
            auth0_id=auth0_id,
            email=email,
            name=name,
            avatar=avatar,
            role=role,
            account_status="active",
            email_verified=email_verified,
            last_login=datetime.datetime.utcnow()
        )
        db.add(user)
        db.commit()
        db.refresh(user)
    else:
        # Update login timestamp & profile attributes if changed
        user.last_login = datetime.datetime.utcnow()
        if avatar and user.avatar != avatar:
            user.avatar = avatar
        db.commit()

    if user.account_status != "active":
        log_audit_action(db, request, user, "LOGIN_BLOCKED", request.url.path, "FORBIDDEN", "Account suspended")
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Account is suspended. Please contact administrator.",
        )

    return {
        "db_user": user,
        "auth0_id": user.auth0_id,
        "email": user.email,
        "name": user.name,
        "role": user.role,
        "permissions": permissions,
        "avatar": user.avatar,
        "account_status": user.account_status,
        "email_verified": user.email_verified,
        "last_login": user.last_login
    }

def require_permission(required_permission: str):
    """
    RBAC Permission Enforcement Dependency.
    Ensures that the JWT claims container contains the specified permission.
    """
    async def permission_checker(
        request: Request,
        current_user: Dict[str, Any] = Depends(get_current_user),
        db: Session = Depends(get_db)
    ):
        user_permissions = current_user.get("permissions", [])
        user_role = current_user.get("role", "")
        
        # If permissions list is missing, resolve from role map
        if not user_permissions and user_role in ROLE_PERMISSIONS_MAP:
            user_permissions = ROLE_PERMISSIONS_MAP[user_role]

        if required_permission not in user_permissions:
            log_audit_action(
                db, request, current_user["db_user"],
                "PERMISSION_DENIED", request.url.path, "FORBIDDEN",
                f"Missing required permission: '{required_permission}'"
            )
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Forbidden: You do not have the required permission '{required_permission}'.",
            )
        return current_user

    return permission_checker

def require_role(required_role: str):
    """
    Role Authorization Guard.
    """
    async def role_checker(
        request: Request,
        current_user: Dict[str, Any] = Depends(get_current_user),
        db: Session = Depends(get_db)
    ):
        user_role = current_user.get("role", "")
        if user_role.lower() != required_role.lower() and user_role.lower() != "admin":
            log_audit_action(
                db, request, current_user["db_user"],
                "ROLE_ACCESS_DENIED", request.url.path, "FORBIDDEN",
                f"Required role '{required_role}', user had '{user_role}'"
            )
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Forbidden: Access requires '{required_role}' role.",
            )
        return current_user

    return role_checker
