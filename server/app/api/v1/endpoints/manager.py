from typing import Dict, Any, List
from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session
from server.app.db.database import get_db
from server.app.core.security import require_permission, log_audit_action

router = APIRouter(prefix="/manager", tags=["Manager Operations"])

@router.get("/dashboard-summary")
async def get_manager_dashboard(
    current_user: Dict[str, Any] = Depends(require_permission("read:dashboard"))
):
    """
    [Manager / Admin] Retrieves operational dashboard metrics.
    Requires permission: 'read:dashboard'
    """
    return {
        "active_events": 2,
        "stadium_capacity": "68,500 / 80,000",
        "staff_deployed": 340,
        "open_incidents_count": 4,
        "ai_recommendations_pending": 2,
        "concession_revenue_rate": "$14,200/hr"
    }

@router.post("/assign-staff")
async def assign_stadium_staff(
    payload: Dict[str, Any],
    request: Request,
    current_user: Dict[str, Any] = Depends(require_permission("assign:staff")),
    db: Session = Depends(get_db)
):
    """
    [Manager / Admin] Assign staff to stadium sectors.
    Requires permission: 'assign:staff'
    """
    sector = payload.get("sector", "Gate A")
    staff_count = payload.get("staff_count", 10)
    
    log_audit_action(
        db, request, current_user["db_user"],
        "ASSIGN_STAFF", "/manager/assign-staff", "SUCCESS",
        f"Assigned {staff_count} staff members to {sector}"
    )
    return {"message": "Staff deployment assigned", "sector": sector, "staff_count": staff_count}

@router.get("/reports")
async def get_operational_reports(
    current_user: Dict[str, Any] = Depends(require_permission("read:reports"))
):
    """
    [Manager / Admin] Fetch operational summary reports.
    Requires permission: 'read:reports'
    """
    return {
        "report_id": "REP-2026-0721",
        "title": "Matchday Crowd Dynamics & Resource Efficiency",
        "generated_at": "2026-07-21T06:00:00Z",
        "metrics": {
            "avg_gate_throughput": "1,200 fans/min",
            "concession_queue_avg_time": "3.5 mins",
            "incident_resolution_avg_time": "8.2 mins"
        }
    }

@router.post("/approve-ai-recommendation")
async def approve_ai_recommendation(
    payload: Dict[str, Any],
    request: Request,
    current_user: Dict[str, Any] = Depends(require_permission("approve:ai")),
    db: Session = Depends(get_db)
):
    """
    [Manager / Admin] Approve AI operational recommendations.
    Requires permission: 'approve:ai'
    """
    recommendation_id = payload.get("recommendation_id", "REC-8802")
    action = payload.get("action", "Reroute Gate B turnstiles to Gate C")

    log_audit_action(
        db, request, current_user["db_user"],
        "APPROVE_AI_RECOMMENDATION", f"/manager/approve-ai-recommendation/{recommendation_id}", "SUCCESS",
        f"Approved AI recommendation: {action}"
    )
    return {
        "status": "APPROVED",
        "recommendation_id": recommendation_id,
        "approved_by": current_user["email"],
        "action": action
    }

@router.post("/allocate-resources")
async def allocate_stadium_resources(
    payload: Dict[str, Any],
    request: Request,
    current_user: Dict[str, Any] = Depends(require_permission("allocate:resources")),
    db: Session = Depends(get_db)
):
    """
    [Manager / Admin] Allocate venue resources.
    Requires permission: 'allocate:resources'
    """
    resource_type = payload.get("resource_type", "Medical Response Carts")
    location = payload.get("location", "East Concourse")
    
    log_audit_action(
        db, request, current_user["db_user"],
        "ALLOCATE_RESOURCES", "/manager/allocate-resources", "SUCCESS",
        f"Allocated {resource_type} to {location}"
    )
    return {"message": "Resource allocation updated", "resource_type": resource_type, "location": location}
