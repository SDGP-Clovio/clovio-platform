from fastapi import APIRouter, HTTPException
from app.schemas.project import ProjectRequest, MilestonePlanResponse
from app.services.ai_service import generate_milestones_only
import logging

logger = logging.getLogger(__name__)

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
        logger.info(f"Received request: description={request.description[:50]}..., team_members={len(request.team_members)}")
        plan = generate_milestones_only(request.description, request.team_members)
        logger.info(f"Generated plan with {len(plan.milestones)} milestones")
        return plan
    except Exception as e:
        logger.error(f"Error in create_project_plan: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))