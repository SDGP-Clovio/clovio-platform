from typing import List
from app.schemas.project import TeamMember, Task


def build_workload_summary(members: List[TeamMember], tasks: List[Task]) -> str:
    """
    Build a human-readable workload summary string for use in AI prompts.

    Tallies each member's completed (status='done') and pending complexity points
    from the supplied task list, then formats the result as:
        "Alice: completed 12 points, pending 4 points; Bob: completed 8 points, pending 6 points"

    Members whose names don't appear in any task are included with zero totals so
    the AI is aware of currently unloaded team members.
    """
    completed: dict[str, int] = {m.name: 0 for m in members}
    pending: dict[str, int] = {m.name: 0 for m in members}

    for task in tasks:
        if task.assigned_to and task.assigned_to in completed:
            if task.status == "done":
                completed[task.assigned_to] += task.complexity
            else:
                pending[task.assigned_to] += task.complexity

    return "; ".join(
        f"{m.name}: completed {completed[m.name]} points, pending {pending[m.name]} points"
        for m in members
    )
