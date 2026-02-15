from pydantic import BaseModel
from typing import List, Optional

# 1. We define the "Task" first. This is the smallest unit.
class Task(BaseModel):
    name: str              # The title of the task
    description: Optional[str] = None  # Short explanation of what to do
    complexity: int        # A difficulty score (1-10)
    required_skills: List[str] # A list of skills needed (e.g. ["Python", "Logic"])
    
    # These fields handle your "Assignment" logic
    assigned_to: Optional[str] = None  # The name of the team member
    assignment_reason: Optional[str] = None # The "Why" (e.g. "Best skill match")
    is_skill_gap: bool = False # True if no one in the team actually had the skill

# 2. We define the "Milestone". It's just a folder for Tasks.
class Milestone(BaseModel):
    title: str
    tasks: List[Task]

# 3. We define the "ProjectPlan". This is the final JSON "Package".
class ProjectPlan(BaseModel):
    project_name: str
    milestones: List[Milestone]
    # This is a bonus for your demo: A summary of the project health
    overall_risk_warning: Optional[str] = None