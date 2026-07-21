from typing import Dict, Any, List
from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session
from server.app.db.database import get_db
from server.app.core.security import require_permission, log_audit_action

router = APIRouter(prefix="/security", tags=["Security Personnel Operations"])

@router.get("/dashboard")
async def get_security_dashboard(
    current_user: Dict[str, Any] = Depends(require_permission("read:security_dashboard"))
):
    """
    [Security / Admin] View security monitoring dashboard metrics.
    Requires permission: 'read:security_dashboard'
    """
    return {
        "security_threat_level": "LOW",
        "active_cctv_feeds": "128 / 128 Online",
        "security_patrols_active": 18,
        "perimeter_breaches": 0,
        "active_alerts_count": 1,
        "emergency_status": "NORMAL_OPERATIONS"
    }

@router.get("/cctv-status")
async def get_cctv_status(
    current_user: Dict[str, Any] = Depends(require_permission("read:cctv"))
):
    """
    [Security / Admin] View CCTV status and stream diagnostics.
    Requires permission: 'read:cctv'
    """
    return {
        "total_cameras": 128,
        "online": 128,
        "offline": 0,
        "high_priority_zones": [
            {"camera_id": "CAM-NORTH-01", "zone": "North Entrance Turnstiles", "fps": 30, "status": "ONLINE"},
            {"camera_id": "CAM-VIP-04", "zone": "VIP Escalator Lobby", "fps": 30, "status": "ONLINE"},
            {"camera_id": "CAM-FIELD-02", "zone": "South Pitch Perimeter", "fps": 60, "status": "ONLINE"}
        ]
    }

@router.post("/verify-alert")
async def verify_security_alert(
    payload: Dict[str, Any],
    request: Request,
    current_user: Dict[str, Any] = Depends(require_permission("verify:alerts")),
    db: Session = Depends(get_db)
):
    """
    [Security / Admin] Verify or resolve security alerts.
    Requires permission: 'verify:alerts'
    """
    alert_id = payload.get("alert_id", "ALT-9041")
    verification_result = payload.get("status", "FALSE_POSITIVE")

    log_audit_action(
        db, request, current_user["db_user"],
        "VERIFY_ALERT", f"/security/verify-alert/{alert_id}", "SUCCESS",
        f"Alert #{alert_id} verified as: '{verification_result}'"
    )
    return {"message": "Alert status verified", "alert_id": alert_id, "status": verification_result}

@router.post("/respond-incident")
async def respond_to_security_incident(
    payload: Dict[str, Any],
    request: Request,
    current_user: Dict[str, Any] = Depends(require_permission("respond:incidents")),
    db: Session = Depends(get_db)
):
    """
    [Security / Admin] Dispatch rapid response security units.
    Requires permission: 'respond:incidents'
    """
    incident_id = payload.get("incident_id", 101)
    team_name = payload.get("team", "Alpha Rapid Response Squad")

    log_audit_action(
        db, request, current_user["db_user"],
        "DISPATCH_SECURITY_RESPONSE", f"/security/respond-incident/{incident_id}", "SUCCESS",
        f"Dispatched '{team_name}' to incident #{incident_id}"
    )
    return {
        "status": "DISPATCHED",
        "incident_id": incident_id,
        "dispatched_team": team_name,
        "eta": "2 minutes"
    }

@router.post("/emergency-status")
async def update_emergency_status(
    payload: Dict[str, Any],
    request: Request,
    current_user: Dict[str, Any] = Depends(require_permission("update:emergency")),
    db: Session = Depends(get_db)
):
    """
    [Security / Admin] Update emergency protocol level.
    Requires permission: 'update:emergency'
    """
    level = payload.get("emergency_level", "NORMAL")
    reason = payload.get("reason", "Routine matchday monitoring")

    log_audit_action(
        db, request, current_user["db_user"],
        "UPDATE_EMERGENCY_STATUS", "/security/emergency-status", "SUCCESS",
        f"Changed emergency level to: '{level}' (Reason: {reason})"
    )
    return {
        "message": "Emergency status updated",
        "emergency_level": level,
        "updated_by": current_user["email"]
    }
