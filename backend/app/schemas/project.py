from pydantic import BaseModel, Field
from typing import List, Optional

# Skill level labels for human-readable output
_LEVEL_LABELS = {
    1: "Beginner",
    2: "Intermediate",
    3: "Advanced",
    4: "Expert",
}

# A single skill with a proficiency level (1 = Beginner … 4 = Expert)
class Skill(BaseModel):
    name: str                              # e.g. "Python"
    level: int = Field(..., ge=1, le=4)    # 1-Beginner, 2-Intermediate, 3-Advanced, 4-Expert

    @property
    def label(self) -> str:
        """Return the human-readable level label."""
        return _LEVEL_LABELS[self.level]

    def __str__(self) -> str:
        return f"{self.name} ({self.label}, {self.level}/4)"

# This is the "TeamMember" model. It represents a person on the team and their skills.
class TeamMember(BaseModel):
    name: str             # The person's name
    skills: List[Skill] = Field(default_factory=list)   # A list of skills with proficiency levels
    # Add a max_items constraint on skills (e.g., max_length=20) to prevent
    # a single member from having 100+ skills that balloon the system prompt size.

# Refusing to accept a project request without a proper description. 
class ProjectRequest(BaseModel):
    # This forces the user to type at least 10 characters.
    # If they type "Hi", the app rejects it immediately.
    description: str = Field(..., min_length=10, max_length=2000)
    # Add max_length (e.g., 2000) to cap token usage per request. Without it,
    # a very long description can produce unexpectedly large (and expensive) AI responses.
    team_members: List[TeamMember] = Field(default_factory=list)   # A list of team members involved in the project
    # Consider adding a max_items constraint on team_members (e.g., reasonable cap of 20)
    # to prevent prompt size explosion and unreasonable AI load-balancing scenarios.

# Defining the tasks. This is the smallest unit.
class Task(BaseModel):
    name: str              # The title of the task 
    description: Optional[str] = None  # Short explanation of what to do
    complexity: int = Field(..., ge=1, le=10) # A difficulty score (1-10)
    required_skills: List[str] # A list of skills needed (e.g. ["Python", "Logic"])
    
    # These fields handle "Assignment" logic
    assigned_to: Optional[str] = None  # The name of the team member
    assignment_reason: Optional[str] = None # The "Why" (e.g. "Best skill match")
    is_skill_gap: bool = False # True if no one in the team actually had the skill

# Defining the "Milestone". It's a folder for Tasks.
class Milestone(BaseModel):
    title: str
    tasks: List[Task]

# Defining the "ProjectPlan". This is the final JSON "Package".
class ProjectPlan(BaseModel):
    project_name: str
    milestones: List[Milestone]
    # A summary of the project health
    overall_risk_warning: Optional[str] = None