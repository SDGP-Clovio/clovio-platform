from typing import List
from app.schemas.project import Milestone

def compute_overall_progress(milestones: List[Milestone]) -> float:
    """
    Compute overall project progress as a percentage (0.0 to 1.0).
    For each milestone:
      - If it has tasks, total_effort = sum of task complexities
      - completed_effort = sum of complexities of tasks with status "done"
      - milestone_progress = completed_effort / total_effort
      - contribution = milestone_progress * (milestone_effort or total_effort)
    But we need to decide how to weight milestones. I propose using the milestone's effort_points as weight, and for milestones with tasks, we use the actual total task complexity (which may differ from effort_points) for completed effort, but the weight remains the original effort_points.
    
    Simplified: For each milestone, compute fraction completed (0 if no tasks, else completed_task_complexity / total_task_complexity). Then overall progress = sum(milestone_effort * fraction) / sum(milestone_effort).
    If a milestone has no tasks yet, fraction = 0.
    """
    total_effort = 0.0
    completed_effort = 0.0

    for milestone in milestones:
        # Use milestone.effort_points as weight (even if tasks exist)
        weight = milestone.effort_points
        total_effort += weight

        if milestone.tasks:
            # Sum complexities of all tasks in this milestone
            total_task_complexity = sum(task.complexity for task in milestone.tasks)
            # Sum complexities of completed tasks
            completed_task_complexity = sum(task.complexity for task in milestone.tasks if task.status == "done")
            # Fraction of this milestone completed
            if total_task_complexity > 0:
                fraction = completed_task_complexity / total_task_complexity
            else:
                fraction = 0.0
        else:
            # No tasks yet – no progress
            fraction = 0.0

        completed_effort += weight * fraction

    if total_effort == 0:
        return 0.0
    return completed_effort / total_effort