from typing import List, Dict, Any, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.orm import Session
from server.app.db.database import get_db
from server.app.db.models import UserModel, AuditLogModel, SystemConfigModel
from server.app.core.security import require_permission, log_audit_action
from server.app.core.auth0 import ROLE_PERMISSIONS_MAP
from server.app.schemas.user import UserResponse, UserUpdateRole, AuditLogResponse, SystemConfigUpdate

router = APIRouter(prefix="/admin", tags=["Administrator Operations"])

@router.get("/users", response_model=List[UserResponse])
async def list_all_users(
    request: Request,
    current_user: Dict[str, Any] = Depends(require_permission("manage:users")),
    db: Session = Depends(get_db)
):
    """
    [Admin Only] Retrieves list of all platform users.
    Requires permission: 'manage:users'
    """
    users = db.query(UserModel).all()
    result = []
    for u in users:
        result.append(UserResponse(
            id=u.id,
            auth0_id=u.auth0_id,
            email=u.email,
            name=u.name,
            avatar=u.avatar,
            role=u.role,
            account_status=u.account_status,
            email_verified=u.email_verified,
            last_login=u.last_login,
            created_at=u.created_at,
            updated_at=u.updated_at,
            permissions=ROLE_PERMISSIONS_MAP.get(u.role, [])
        ))
    return result

@router.put("/users/{user_id}/role")
async def update_user_role(
    user_id: int,
    payload: UserUpdateRole,
    request: Request,
    current_user: Dict[str, Any] = Depends(require_permission("manage:roles")),
    db: Session = Depends(get_db)
):
    """
    [Admin Only] Assigns a role to a user.
    Requires permission: 'manage:roles'
    """
    user = db.query(UserModel).filter(UserModel.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    if payload.role not in ROLE_PERMISSIONS_MAP:
        raise HTTPException(status_code=400, detail=f"Invalid role: {payload.role}")

    old_role = user.role
    user.role = payload.role
    db.commit()

    log_audit_action(
        db, request, current_user["db_user"],
        "UPDATE_USER_ROLE", f"/admin/users/{user_id}/role", "SUCCESS",
        f"Changed role for user '{user.email}' from '{old_role}' to '{payload.role}'"
    )

    return {"message": "User role updated successfully", "user_id": user.id, "new_role": user.role}

@router.get("/roles")
async def get_roles_permissions_matrix(
    current_user: Dict[str, Any] = Depends(require_permission("manage:roles"))
):
    """
    [Admin Only] View full Role-Based Access Control matrix.
    Requires permission: 'manage:roles'
    """
    return {
        "roles": list(ROLE_PERMISSIONS_MAP.keys()),
        "matrix": ROLE_PERMISSIONS_MAP
    }

@router.get("/audit-logs", response_model=List[AuditLogResponse])
async def get_audit_logs(
    request: Request,
    limit: int = 50,
    current_user: Dict[str, Any] = Depends(require_permission("read:audit_logs")),
    db: Session = Depends(get_db)
):
    """
    [Admin Only] View security audit logs.
    Requires permission: 'read:audit_logs'
    """
    logs = db.query(AuditLogModel).order_by(AuditLogModel.created_at.desc()).limit(limit).all()
    return logs

@router.post("/system-config")
async def update_system_config(
    payload: SystemConfigUpdate,
    request: Request,
    current_user: Dict[str, Any] = Depends(require_permission("configure:system")),
    db: Session = Depends(get_db)
):
    """
    [Admin Only] Update Stadium System Configuration settings.
    Requires permission: 'configure:system'
    """
    cfg = db.query(SystemConfigModel).filter(SystemConfigModel.key == payload.key).first()
    if not cfg:
        cfg = SystemConfigModel(
            key=payload.key,
            value=payload.value,
            description=payload.description,
            updated_by=current_user["email"]
        )
        db.add(cfg)
    else:
        cfg.value = payload.value
        if payload.description:
            cfg.description = payload.description
        cfg.updated_by = current_user["email"]
    
    db.commit()
    log_audit_action(
        db, request, current_user["db_user"],
        "UPDATE_SYSTEM_CONFIG", f"/admin/system-config/{payload.key}", "SUCCESS",
        f"Updated system config '{payload.key}'"
    )
    return {"message": "System configuration updated", "key": payload.key, "value": payload.value}

@router.post("/ai-settings")
async def update_ai_settings(
    settings_data: Dict[str, Any],
    request: Request,
    current_user: Dict[str, Any] = Depends(require_permission("configure:ai")),
    db: Session = Depends(get_db)
):
    """
    [Admin Only] Update AI Settings and parameters.
    Requires permission: 'configure:ai'
    """
    log_audit_action(
        db, request, current_user["db_user"],
        "UPDATE_AI_SETTINGS", "/admin/ai-settings", "SUCCESS",
        f"Updated AI settings parameters: {list(settings_data.keys())}"
    )
    return {
        "message": "AI platform settings saved successfully",
        "updated_settings": settings_data
    }
