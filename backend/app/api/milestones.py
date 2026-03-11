from typing import List
from fastapi import APIRouter, HTTPException
from app.schemas.project import MilestoneTaskRequest, Task
from app.services.ai_service import generate_tasks_for_milestone

router = APIRouter(
    prefix="/milestones",
    tags=["milestones"]
)

@router.post("/{milestone_id}/generate-tasks", response_model=List[Task])
async def generate_tasks(milestone_id: int, request: MilestoneTaskRequest):
    """
    Generate tasks for a specific milestone using the provided context.
    (milestone_id is not used yet but can be used later for database integration)
    """
    try:
        tasks = generate_tasks_for_milestone( 
            project_description=request.project_description,
            milestone_title=request.milestone_title,
            milestone_effort=request.milestone_effort,
            team_members=request.team_members,
            workload_summary=request.workload_summary,
            all_milestones=[m.dict() for m in request.all_milestones]  # convert to dicts
        )
        return tasks
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e)) 