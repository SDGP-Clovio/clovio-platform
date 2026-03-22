from typing import List
from fastapi import APIRouter, HTTPException, Depends, Query
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.task import Task as DBTask, TaskStatus
from app.models.milestone import Milestone as DBMilestone
from app.schemas.project import MilestoneTaskRequest, Task
from app.services.ai_service import generate_tasks_for_milestone

router = APIRouter(
    prefix="/milestones",
    tags=["milestones"]
)

@router.post("/{milestone_id}/generate-tasks", response_model=List[Task])
async def generate_tasks(
    milestone_id: int,
    request: MilestoneTaskRequest,
    persist: bool = Query(default=False, description="Persist generated tasks to database"),
    db: Session = Depends(get_db)
):
    """
    Generate tasks for a specific milestone using the provided context.

    By default this endpoint only returns AI-generated tasks and does not
    persist them. To persist generated tasks, set persist=true and provide
    a valid milestone_id that exists in the database.
    """
    try:
        tasks = generate_tasks_for_milestone(
            project_description=request.project_description,
            milestone_title=request.milestone_title,
            milestone_effort=request.milestone_effort,
            team_members=request.team_members,
            workload_summary=request.workload_summary,
            all_milestones=[m.model_dump() for m in request.all_milestones]
        )

        if not persist:
            return tasks

        milestone = db.query(DBMilestone).filter(DBMilestone.id == milestone_id).first()
        if milestone is None:
            raise HTTPException(
                status_code=404,
                detail=f"Milestone {milestone_id} not found. Generated tasks were not persisted."
            )

        for ai_task in tasks:
            new_db_task = DBTask(
                milestone_id=milestone_id,
                name=ai_task.name,
                description=ai_task.description,
                complexity=ai_task.complexity,
                required_skills=ai_task.required_skills,
                assignment_reason=ai_task.assignment_reason,
                is_skill_gap=ai_task.is_skill_gap,
                status=TaskStatus.TODO
            )
            db.add(new_db_task)

        db.commit()

        return tasks

    except HTTPException:
        db.rollback()
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))