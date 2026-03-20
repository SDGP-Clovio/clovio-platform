from typing import Any, Mapping
from fastapi import APIRouter, Depends, HTTPException
from app.services.supervisor_provider import get_supervisor_data_provider
from app.services.supervisor_service import SupervisorDataProvider, SupervisorService
from app.services.report_service import SupervisorReportService
from app.schemas.supervisor import (
    SupervisorAlertsResponse,
    SupervisorContributionsResponse,
    SupervisorFairnessResponse,
    SupervisorProjectDetailResponse,
    SupervisorProjectsResponse,
)

router = APIRouter(prefix="/supervisor", tags=["Supervisor"])


def get_supervisor_user() -> Mapping[str, Any]:
    """
    Integration hook for existing JWT + role guard.

    Replace this dependency with your existing branch dependency that ensures
    supervisor-only access and returns the authenticated user payload.
    """
    raise HTTPException(
        status_code=500,
        detail="Supervisor auth dependency is not configured. Wire existing JWT/role dependency.",
    )

def _extract_user_id(user_payload: Mapping[str, Any]) -> int:
    raw_id = user_payload.get("id")
    if raw_id is None:
        raise HTTPException(status_code=401, detail="Authenticated user payload missing id")
    try:
        return int(raw_id)
    except (TypeError, ValueError):
        raise HTTPException(status_code=401, detail="Authenticated user id is invalid")
     
def get_supervisor_service(
    provider: SupervisorDataProvider = Depends(get_supervisor_data_provider),
) -> SupervisorService:
    return SupervisorService(provider=provider)


def get_report_service() -> SupervisorReportService:
    return SupervisorReportService()

@router.get("/projects", response_model=SupervisorProjectsResponse)
def get_supervisor_projects(
    current_user: Mapping[str, Any] = Depends(get_supervisor_user),
    service: SupervisorService = Depends(get_supervisor_service),
) -> SupervisorProjectsResponse:
    supervisor_id = _extract_user_id(current_user)
    return service.get_projects(supervisor_id=supervisor_id)

