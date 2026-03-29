from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from app.schemas.project import (
    ProjectRequest,
    MilestonePlanResponse,
    TaskGenerationRequest,
    Task,
    FairnessResponse,
    MemberWorkload,
    ProgressResponse,
    ProgressMilestoneInput,
)
from app.services.ai_service import generate_milestones_only, generate_tasks_for_milestone
from app.services.fairness import calculate_gini_coefficient
from app.services.progress import calculate_progress
from app.services.workload import build_workload_summary_empty

from typing import List

# ─────────────────────────────────────────────────────────────────────────────
# Initialise the FastAPI app
# ─────────────────────────────────────────────────────────────────────────────
app = FastAPI(
    title="Clovio AI Backend",
    version="0.2.0",  # [CHANGED] Bumped from 0.1.0 — reflects the new two-step flow
    description="AI-powered project planning and task breakdown API."
)

# ─────────────────────────────────────────────────────────────────────────────
# [ADDED] CORS Middleware
# Without this, the React frontend (running on localhost:3000) cannot call
# these endpoints — the browser blocks cross-origin requests.
# For production, replace the wildcard "*" with specific allowed origins.
# ─────────────────────────────────────────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],         # Allow all origins (restrict in production)
    allow_credentials=True,
    allow_methods=["*"],         # Allow GET, POST, PUT, DELETE, etc.
    allow_headers=["*"],         # Allow all headers (Authorization, Content-Type, etc.)
)


# ─────────────────────────────────────────────────────────────────────────────
# 1. Health Check — just to see if lights are on
# ─────────────────────────────────────────────────────────────────────────────
@app.get("/")
def health_check():
    return {"status": "Active", "message": "Clovio Backend is running"}


# ─────────────────────────────────────────────────────────────────────────────
# 2. [CHANGED] Generate Milestones — Step 1 of the two-step flow
#    OLD: POST /api/v1/generate-plan called the deprecated generate_task_breakdown()
#         which was commented out and crashed the app on startup.
#    NEW: POST /api/v1/generate-milestones calls generate_milestones_only()
#         and returns just milestones with effort points (no tasks yet).
# ─────────────────────────────────────────────────────────────────────────────
@app.post("/api/v1/generate-milestones", response_model=MilestonePlanResponse, tags=["AI Generation"])
def generate_milestones(request: ProjectRequest):
    """
    Step 1: Takes a project description + team members and returns milestones
    with effort points, a suggested timeline, and optional risk warnings.
    The user reviews/edits these before proceeding to task generation.
    """
    try:
        result = generate_milestones_only(request.description, request.team_members)
        return result
    except Exception as e:
        print(f"[generate-milestones] Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


# ─────────────────────────────────────────────────────────────────────────────
# 3. [ADDED] Generate Tasks for a Milestone — Step 2 of the two-step flow
#    Called once per milestone, after the user has accepted the milestone plan.
#    Sends workload context so the AI can balance work across milestones.
# ─────────────────────────────────────────────────────────────────────────────
@app.post("/api/v1/generate-tasks", response_model=List[Task], tags=["AI Generation"])
def generate_tasks(request: TaskGenerationRequest):
    """
    Step 2: Takes a milestone (title + effort) and generates concrete tasks
    assigned to team members based on skills and current workload.
    """
    try:
        # If no workload override is given, generate a zero-workload summary.
        # In production, this will come from the database (Member 5's work).
        workload_summary = request.workload_override
        if not workload_summary:
            workload_summary = build_workload_summary_empty(request.team_members)

        # Convert MilestoneSummary objects to dicts for the AI function
        all_milestones_dicts = None
        if request.all_milestones:
            all_milestones_dicts = [
                {"title": m.title, "effort_points": m.effort_points}
                for m in request.all_milestones
            ]

        tasks = generate_tasks_for_milestone(
            project_description=request.project_description,
            milestone_title=request.milestone_title,
            milestone_effort=request.milestone_effort,
            team_members=request.team_members,
            workload_summary=workload_summary,
            all_milestones=all_milestones_dicts
        )
        return tasks
    except Exception as e:
        print(f"[generate-tasks] Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


# ─────────────────────────────────────────────────────────────────────────────
# 4. [ADDED] Fairness Score — Gini coefficient calculation
#    Accepts a list of per-member workloads and returns the Gini coefficient.
#    In production, the endpoint would query the DB for all tasks in a project.
#    For now, it accepts workload data directly (so frontend/testing can use it).
# ─────────────────────────────────────────────────────────────────────────────
@app.post("/api/v1/fairness", response_model=FairnessResponse, tags=["Analytics"])
def compute_fairness(member_workloads: List[MemberWorkload]):
    """
    Computes the Gini coefficient for workload fairness.
    Accepts a list of member workloads and returns the score.
    
    Example request body:
    [
        {"name": "Alice", "total_assigned": 25, "completed": 15, "pending": 10},
        {"name": "Bob",   "total_assigned": 10, "completed": 10, "pending": 0},
        {"name": "Charlie", "total_assigned": 20, "completed": 5, "pending": 15}
    ]
    """
    try:
        # Extract the total_assigned values for Gini calculation
        workloads = [mw.total_assigned for mw in member_workloads]
        gini = calculate_gini_coefficient(workloads)

        return FairnessResponse(
            gini_coefficient=gini,
            member_workloads=member_workloads
        )
    except Exception as e:
        print(f"[fairness] Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


# ─────────────────────────────────────────────────────────────────────────────
# 5. [ADDED] Progress Tracking — effort-point-based progress calculation
#    Accepts milestone data with task statuses and returns progress percentages.
#    In production, data would come from the DB. For now, accepts it directly.
# ─────────────────────────────────────────────────────────────────────────────
@app.post("/api/v1/progress", response_model=ProgressResponse, tags=["Analytics"])
def compute_progress(milestones: List[ProgressMilestoneInput]):
    """
    Computes overall and per-milestone progress based on effort points.
    
    Example request body:
    [
        {
            "title": "Planning", "effort_points": 10, "status": "completed",
            "tasks": [{"complexity": 5, "status": "done"}, {"complexity": 5, "status": "done"}]
        },
        {
            "title": "Frontend", "effort_points": 20, "status": "active",
            "tasks": [{"complexity": 5, "status": "done"}, {"complexity": 15, "status": "todo"}]
        }
    ]
    """
    try:
        # Convert Pydantic models to dicts for the progress calculation function
        milestones_dicts = [m.model_dump() for m in milestones]
        result = calculate_progress(milestones_dicts)
        return result
    except Exception as e:
        print(f"[progress] Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))