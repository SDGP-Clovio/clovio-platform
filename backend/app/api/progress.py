from fastapi import APIRouter, HTTPException
from app.schemas.project import ProgressRequest
from app.utils.progress import compute_overall_progress

router = APIRouter(
    prefix="/progress",
    tags=["progress"]
)

@router.post("/compute")
async def compute_progress(request: ProgressRequest):
    """
    Compute overall project progress based on milestones and their tasks.
    Send a list of all milestones with their current tasks (including status).
    """
    try:
        progress = compute_overall_progress(request.milestones)
        return {"progress": progress}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))