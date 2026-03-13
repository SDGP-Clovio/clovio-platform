from typing import List
from app.schemas.project import Task

def gini_coefficient(tasks: List[Task], member_names: List[str]) -> float:
    """
    Compute Gini coefficient based on total complexity per member.
    All members (including those with zero tasks) are considered.
    """
    # Initialize all members with 0
    totals = {name: 0 for name in member_names}
    for task in tasks:
        if task.assigned_to:  # ignore unassigned tasks (skill gaps)
            totals[task.assigned_to] = totals.get(task.assigned_to, 0) + task.complexity

    values = sorted(totals.values())
    n = len(values)
    if n == 0 or sum(values) == 0:
        return 0.0

    S = sum(values)
    cumulative = 0
    for i, val in enumerate(values, start=1):
        cumulative += i * val

    gini = (2 * cumulative) / (n * S) - (n + 1) / n
    return gini
