from fastapi import APIRouter, HTTPException, Depends
from typing import List
from app.schemas.project import Task
from app.utils.fairness import gini_coefficient
from app.schemas.fairness import FairnessRequest

# This module defines API endpoints related to fairness metrics, such as the Gini coefficient.
router = APIRouter(
    prefix="/fairness",
    tags=["fairness"]
)

# This is a placeholder – replace the tasks list with a database query
@router.post("/compute")
async def compute_fairness(request: FairnessRequest):
    """
    Compute fairness score (Gini coefficient) for the given tasks and team members.
    """
    try:
        member_names = request.member_names or sorted(
            {
                task.assigned_to
                for task in request.tasks
                if task.assigned_to
            }
        )

        score = gini_coefficient(request.tasks, member_names)
        fairness_percent = round((1.0 - score) * 100.0, 2)

        return {
            "fairness_score": score,
            "score": fairness_percent,
            "insights": [],
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
