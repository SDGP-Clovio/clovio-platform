"""
app/services/progress.py
─────────────────────────
[ADDED] Progress tracking logic using effort points.

This module calculates project completion percentage based on effort points,
NOT task count. A milestone with 50 effort points counts more than one with 10.

How it works:
  - Each milestone has effort_points (set during milestone generation).
  - Each task within a milestone has a complexity score (1-10).
  - A completed milestone = its full effort_points added to completed effort.
  - An in-progress milestone = fraction based on completed task complexities.
  - Overall progress = (total completed effort / total effort) * 100.

Usage:
  from app.services.progress import calculate_progress
  result = calculate_progress(milestones_data)
  print(result)  # {"overall_percent": 45.0, "total_effort": 100, ...}
"""

from typing import List, Optional
from app.schemas.project import MilestoneProgress, ProgressResponse


def calculate_progress(milestones: List[dict]) -> ProgressResponse:
    """
    Calculates overall and per-milestone progress.
    
    Args:
        milestones: A list of milestone dicts, each containing:
            - title (str): Milestone name
            - effort_points (int): Total effort for this milestone
            - status (str): "pending", "active", or "completed"
            - tasks (list of dicts, optional): Each task has:
                - complexity (int): 1-10
                - status (str): "todo", "doing", or "done"
    
    Returns:
        A ProgressResponse object with overall_percent, total_effort,
        completed_effort, and per-milestone breakdowns.
    
    Example input:
        [
            {"title": "Planning", "effort_points": 10, "status": "completed", "tasks": [...]},
            {"title": "Frontend", "effort_points": 20, "status": "active", "tasks": [
                {"complexity": 5, "status": "done"},
                {"complexity": 5, "status": "doing"},
                {"complexity": 10, "status": "todo"}
            ]},
            {"title": "Testing", "effort_points": 15, "status": "pending", "tasks": []}
        ]
    """
    total_effort = 0
    completed_effort = 0.0
    milestone_details = []

    for m in milestones:
        effort = m.get("effort_points", 0)
        status = m.get("status", "pending")
        tasks = m.get("tasks", [])
        total_effort += effort

        if status == "completed":
            # Completed milestone → full effort counts
            completed_points = effort
            progress_pct = 100.0
            completed_effort += effort

        elif status == "active":
            # Active milestone → calculate from completed tasks
            done_complexity = sum(
                t.get("complexity", 0)
                for t in tasks
                if t.get("status") == "done"
            )
            # Avoid division by zero if milestone has effort but no tasks yet
            if effort > 0:
                # The fraction of this milestone that's done, scaled by its effort
                fraction = min(done_complexity / effort, 1.0)  # Cap at 100%
                completed_points = done_complexity
                progress_pct = round(fraction * 100, 1)
                completed_effort += fraction * effort
            else:
                completed_points = 0
                progress_pct = 0.0

        else:
            # Pending milestone → no progress
            completed_points = 0
            progress_pct = 0.0

        milestone_details.append(MilestoneProgress(
            title=m.get("title", "Untitled"),
            effort_points=effort,
            completed_points=completed_points,
            progress_percent=progress_pct
        ))

    # Overall progress
    overall = round((completed_effort / total_effort * 100), 1) if total_effort > 0 else 0.0

    return ProgressResponse(
        overall_percent=overall,
        total_effort=total_effort,
        completed_effort=round(completed_effort, 1),
        milestones=milestone_details
    )
