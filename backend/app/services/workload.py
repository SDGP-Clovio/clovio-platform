"""
app/services/workload.py
─────────────────────────
[ADDED] Utility to build the workload summary string for AI prompts.

The generate_tasks_for_milestone() function needs a human-readable string
describing each member's current workload, like:
  "Alice: completed 12 points, pending 5 points; Bob: completed 8 points, pending 0 points"

Previously, callers had to type this manually. This module builds it
automatically from task data.

Two versions are provided:
  1. build_workload_summary()        — from raw task dicts (for use before DB)
  2. build_workload_summary_empty()  — generates a "zero workload" string for 
                                       the first milestone (no prior tasks)

When Member 5 (Database) integrates, this can be updated to query the DB
directly. The function signature stays the same — only the data source changes.
"""

from typing import List, Dict
from app.schemas.project import TeamMember


def build_workload_summary(team_members: List[TeamMember], tasks: List[dict]) -> str:
    """
    Builds the workload summary string from a list of tasks.
    
    Args:
        team_members: The full team (so everyone appears, even those with 0 work).
        tasks: A list of task dicts from previous milestones. Each must have:
            - assigned_to (str or None): Team member name
            - complexity (int): Effort points
            - status (str): "todo", "doing", or "done"
    
    Returns:
        A formatted string like:
        "Alice: completed 12 points, pending 5 points; Bob: completed 0 points, pending 0 points"
    
    Example:
        summary = build_workload_summary(members, [
            {"assigned_to": "Alice", "complexity": 5, "status": "done"},
            {"assigned_to": "Alice", "complexity": 7, "status": "doing"},
            {"assigned_to": "Bob",   "complexity": 3, "status": "todo"},
        ])
        # → "Alice: completed 5 points, pending 7 points; Bob: completed 0 points, pending 3 points"
    """
    # Initialise every member with zero
    workload: Dict[str, Dict[str, int]] = {
        m.name: {"completed": 0, "pending": 0}
        for m in team_members
    }

    # Tally up points from tasks
    for task in tasks:
        assigned = task.get("assigned_to")
        if assigned is None or assigned not in workload:
            continue  # Skip unassigned or unknown names

        complexity = task.get("complexity", 0)
        status = task.get("status", "todo")

        if status == "done":
            workload[assigned]["completed"] += complexity
        else:
            # "todo" and "doing" both count as pending
            workload[assigned]["pending"] += complexity

    # Build the summary string
    parts = [
        f"{name}: completed {data['completed']} points, pending {data['pending']} points"
        for name, data in workload.items()
    ]
    return "; ".join(parts)


def build_workload_summary_empty(team_members: List[TeamMember]) -> str:
    """
    Builds a "zero workload" summary — used for the very first milestone
    when no prior tasks exist.
    
    Args:
        team_members: The full team list.
    
    Returns:
        "Alice: completed 0 points, pending 0 points; Bob: completed 0 points, pending 0 points"
    """
    return build_workload_summary(team_members, [])
