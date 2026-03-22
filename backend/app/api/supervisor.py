from __future__ import annotations

from typing import Any, Mapping

from fastapi import APIRouter, Depends, HTTPException

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


def get_supervisor_service(
    provider: SupervisorDataProvider = Depends(get_supervisor_data_provider),
) -> SupervisorService:
    return SupervisorService(provider=provider)


def _extract_user_id(user_payload: Mapping[str, Any]) -> int:
    raw_id = user_payload.get("id")
    if raw_id is None:
        raise HTTPException(status_code=401, detail="Authenticated user payload missing id")
    try:
        return int(raw_id)
    except (TypeError, ValueError):
        raise HTTPException(status_code=401, detail="Authenticated user id is invalid")


@router.get("/projects", response_model=SupervisorProjectsResponse)
def get_supervisor_projects(
    current_user: Mapping[str, Any] = Depends(get_supervisor_user),
    service: SupervisorService = Depends(get_supervisor_service),
) -> SupervisorProjectsResponse:
    supervisor_id = _extract_user_id(current_user)
    return service.get_projects(supervisor_id=supervisor_id)


@router.get("/project/{project_id}", response_model=SupervisorProjectDetailResponse)
def get_supervisor_project_detail(
    project_id: int,
    current_user: Mapping[str, Any] = Depends(get_supervisor_user),
    service: SupervisorService = Depends(get_supervisor_service),
) -> SupervisorProjectDetailResponse:
    supervisor_id = _extract_user_id(current_user)
    return service.get_project_detail(supervisor_id=supervisor_id, project_id=project_id)


@router.get("/project/{project_id}/contributions", response_model=SupervisorContributionsResponse)
def get_supervisor_project_contributions(
    project_id: int,
    current_user: Mapping[str, Any] = Depends(get_supervisor_user),
    service: SupervisorService = Depends(get_supervisor_service),
) -> SupervisorContributionsResponse:
    supervisor_id = _extract_user_id(current_user)
    return service.get_contributions(supervisor_id=supervisor_id, project_id=project_id)


@router.get("/project/{project_id}/fairness", response_model=SupervisorFairnessResponse)
def get_supervisor_project_fairness(
    project_id: int,
    current_user: Mapping[str, Any] = Depends(get_supervisor_user),
    service: SupervisorService = Depends(get_supervisor_service),
) -> SupervisorFairnessResponse:
    supervisor_id = _extract_user_id(current_user)
    return service.get_fairness(supervisor_id=supervisor_id, project_id=project_id)


@router.get("/project/{project_id}/alerts", response_model=SupervisorAlertsResponse)
def get_supervisor_project_alerts(
    project_id: int,
    current_user: Mapping[str, Any] = Depends(get_supervisor_user),
    service: SupervisorService = Depends(get_supervisor_service),
) -> SupervisorAlertsResponse:
    supervisor_id = _extract_user_id(current_user)
    return service.get_alerts(supervisor_id=supervisor_id, project_id=project_id)

