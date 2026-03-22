from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException

from app.core.auth import get_current_user
from app.models.user import User, UserRole
from app.schemas.supervisor import (
    SupervisorAlertsResponse,
    SupervisorContributionsResponse,
    SupervisorFairnessResponse,
    SupervisorProjectDetailResponse,
    SupervisorProjectsResponse,
)
from app.services.supervisor_provider import get_supervisor_data_provider
from app.services.supervisor_service import SupervisorDataProvider, SupervisorService

router = APIRouter(prefix="/supervisor", tags=["Supervisor"])


def get_supervisor_user(current_user: User = Depends(get_current_user)) -> User:
    """
    Enforce supervisor-only access for supervisor routes.
    """
    if current_user.role != UserRole.SUPERVISOR:
        raise HTTPException(status_code=403, detail="Supervisor access required")
    return current_user


def get_supervisor_service(
    provider: SupervisorDataProvider = Depends(get_supervisor_data_provider),
) -> SupervisorService:
    return SupervisorService(provider=provider)


@router.get("/projects", response_model=SupervisorProjectsResponse)
def get_supervisor_projects(
    current_user: User = Depends(get_supervisor_user),
    service: SupervisorService = Depends(get_supervisor_service),
) -> SupervisorProjectsResponse:
    supervisor_id = int(current_user.id)
    return service.get_projects(supervisor_id=supervisor_id)


@router.get("/project/{project_id}", response_model=SupervisorProjectDetailResponse)
def get_supervisor_project_detail(
    project_id: int,
    current_user: User = Depends(get_supervisor_user),
    service: SupervisorService = Depends(get_supervisor_service),
) -> SupervisorProjectDetailResponse:
    supervisor_id = int(current_user.id)
    return service.get_project_detail(supervisor_id=supervisor_id, project_id=project_id)


@router.get("/project/{project_id}/contributions", response_model=SupervisorContributionsResponse)
def get_supervisor_project_contributions(
    project_id: int,
    current_user: User = Depends(get_supervisor_user),
    service: SupervisorService = Depends(get_supervisor_service),
) -> SupervisorContributionsResponse:
    supervisor_id = int(current_user.id)
    return service.get_contributions(supervisor_id=supervisor_id, project_id=project_id)


@router.get("/project/{project_id}/fairness", response_model=SupervisorFairnessResponse)
def get_supervisor_project_fairness(
    project_id: int,
    current_user: User = Depends(get_supervisor_user),
    service: SupervisorService = Depends(get_supervisor_service),
) -> SupervisorFairnessResponse:
    supervisor_id = int(current_user.id)
    return service.get_fairness(supervisor_id=supervisor_id, project_id=project_id)


@router.get("/project/{project_id}/alerts", response_model=SupervisorAlertsResponse)
def get_supervisor_project_alerts(
    project_id: int,
    current_user: User = Depends(get_supervisor_user),
    service: SupervisorService = Depends(get_supervisor_service),
) -> SupervisorAlertsResponse:
    supervisor_id = int(current_user.id)
    return service.get_alerts(supervisor_id=supervisor_id, project_id=project_id)

