import secrets
from typing import Dict, Any
from fastapi import APIRouter, Depends, Response, Request
from sqlalchemy.orm import Session
from server.app.db.database import get_db
from server.app.core.security import get_current_user, log_audit_action
from server.app.schemas.user import UserResponse

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.get("/me", response_model=UserResponse)
async def get_my_profile(
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    """
    Returns current authenticated user details, assigned role, and permissions claims.
    Used for profile loading & UI permission gating.
    """
    user_db = current_user["db_user"]
    return UserResponse(
        id=user_db.id,
        auth0_id=user_db.auth0_id,
        email=user_db.email,
        name=user_db.name,
        avatar=user_db.avatar,
        role=user_db.role,
        account_status=user_db.account_status,
        email_verified=user_db.email_verified,
        last_login=user_db.last_login,
        created_at=user_db.created_at,
        updated_at=user_db.updated_at,
        permissions=current_user["permissions"]
    )

@router.post("/sync")
async def sync_auth0_user(
    request: Request,
    current_user: Dict[str, Any] = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Synchronizes Auth0 identity payload with backend database upon successful authentication.
    """
    log_audit_action(
        db, request, current_user["db_user"],
        "AUTH0_USER_SYNC", "/api/v1/auth/sync", "SUCCESS",
        f"User synchronized with role: '{current_user['role']}'"
    )
    return {
        "message": "User synchronized successfully",
        "user": current_user["db_user"],
        "permissions": current_user["permissions"]
    }

@router.post("/logout")
async def logout_user(
    request: Request,
    response: Response,
    current_user: Dict[str, Any] = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Handles user logout: records audit trail and clears session cookies.
    """
    log_audit_action(
        db, request, current_user["db_user"],
        "USER_LOGOUT", "/api/v1/auth/logout", "SUCCESS", "User session terminated"
    )
    response.delete_cookie("sg_csrf_token")
    response.delete_cookie("sg_session")
    return {"message": "Logged out successfully"}

@router.get("/csrf-token")
async def get_csrf_token(response: Response):
    """
    Generates anti-CSRF token and sets HttpOnly cookie for browser clients.
    """
    token = secrets.token_hex(32)
    response.set_cookie(
        key="sg_csrf_token",
        value=token,
        httponly=True,
        secure=True,
        samesite="strict"
    )
    return {"csrf_token": token}
