from typing import Dict, Any, List
from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session
from server.app.db.database import get_db
from server.app.db.models import IncidentModel
from server.app.core.security import require_permission, log_audit_action
from server.app.schemas.user import IncidentCreate, IncidentUpdate, IncidentResponse

router = APIRouter(prefix="/operator", tags=["Operator Operations"])

@router.get("/crowd-analytics")
async def get_crowd_analytics(
    current_user: Dict[str, Any] = Depends(require_permission("read:crowd_analytics"))
):
    """
    [Operator / Manager / Admin] Real-time crowd density analytics.
    Requires permission: 'read:crowd_analytics'
    """
    return {
        "timestamp": "2026-07-21T06:15:00Z",
        "overall_density": "78%",
        "hotspots": [
            {"zone": "North Gate Turnstiles", "density": "92%", "status": "Congested"},
            {"zone": "South Concourse Food Court", "density": "84%", "status": "Busy"},
            {"zone": "VIP Lounge Entry", "density": "45%", "status": "Normal"}
        ],
        "flow_rate_per_min": 1420
    }

@router.get("/incidents", response_model=List[IncidentResponse])
async def list_incidents(
    current_user: Dict[str, Any] = Depends(require_permission("read:incidents")),
    db: Session = Depends(get_db)
):
    """
    [Operator / Manager / Security / Admin] View active incidents.
    Requires permission: 'read:incidents'
    """
    incidents = db.query(IncidentModel).order_by(IncidentModel.created_at.desc()).all()
    return incidents

@router.post("/incidents", response_model=IncidentResponse)
async def create_incident(
    payload: IncidentCreate,
    request: Request,
    current_user: Dict[str, Any] = Depends(require_permission("create:incidents")),
    db: Session = Depends(get_db)
):
    """
    [Operator / Admin] Create new stadium incident ticket.
    Requires permission: 'create:incidents'
    """
    incident = IncidentModel(
        title=payload.title,
        description=payload.description,
        severity=payload.severity,
        category=payload.category,
        location=payload.location,
        assigned_to=payload.assigned_to,
        created_by=current_user["email"],
        status="Open"
    )
    db.add(incident)
    db.commit()
    db.refresh(incident)

    log_audit_action(
        db, request, current_user["db_user"],
        "CREATE_INCIDENT", f"/operator/incidents/{incident.id}", "SUCCESS",
        f"Created incident #{incident.id}: '{incident.title}'"
    )
    return incident

@router.put("/incidents/{incident_id}", response_model=IncidentResponse)
async def update_incident_status(
    incident_id: int,
    payload: IncidentUpdate,
    request: Request,
    current_user: Dict[str, Any] = Depends(require_permission("update:incidents")),
    db: Session = Depends(get_db)
):
    """
    [Operator / Admin / Security] Update incident status and assignments.
    Requires permission: 'update:incidents'
    """
    incident = db.query(IncidentModel).filter(IncidentModel.id == incident_id).first()
    if not incident:
        raise HTTPException(status_code=404, detail="Incident not found")

    if payload.status:
        incident.status = payload.status
    if payload.title:
        incident.title = payload.title
    if payload.description:
        incident.description = payload.description
    if payload.severity:
        incident.severity = payload.severity
    if payload.assigned_to:
        incident.assigned_to = payload.assigned_to

    db.commit()
    db.refresh(incident)

    log_audit_action(
        db, request, current_user["db_user"],
        "UPDATE_INCIDENT", f"/operator/incidents/{incident_id}", "SUCCESS",
        f"Updated incident #{incident_id} status to '{incident.status}'"
    )
    return incident

@router.post("/ai-assistant")
async def query_ai_assistant(
    payload: Dict[str, Any],
    request: Request,
    current_user: Dict[str, Any] = Depends(require_permission("use:ai_assistant"))
):
    """
    [Operator / Admin] Smart Stadium AI Assistant query.
    Requires permission: 'use:ai_assistant'
    """
    query = payload.get("prompt", "Summarize stadium operational status")
    return {
        "query": query,
        "ai_response": f"AI Copilot Analysis: All 42 turnstiles operational. North Gate congestion reduced by 14% after opening auxiliary lane. Next perimeter patrol recommended at Gate D in 15 minutes.",
        "confidence": 0.96,
        "suggested_actions": [
            "Dispatch 2 additional stewards to Gate D",
            "Broadcast turnstile update to Fan App"
        ]
    }
