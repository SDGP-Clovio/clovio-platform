from fastapi import APIRouter, HTTPException
from app.schemas.project import ProjectRequest, MilestonePlanResponse
from app.services.ai_service import generate_milestones_only

router = APIRouter(
    prefix="/projects",
    tags=["projects"]
)

@router.post("/breakdown", response_model=MilestonePlanResponse)
async def create_project_plan(request: ProjectRequest):
    """
    Generate milestones (without tasks) for a project description and team members.
    """
    try:
        plan = generate_milestones_only(request.description, request.team_members)
        return plan
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))