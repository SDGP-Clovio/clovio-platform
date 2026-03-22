from pydantic import BaseModel, Field
from typing import List, Literal, Optional
from datetime import datetime

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
    skills: List[Skill] = Field(default_factory=list, max_length=20)   # A list of skills with proficiency levels, 20 skills max to prevent prompt overload.

class MilestoneSummary(BaseModel): # A simplified milestone summary for the milestone-only endpoint
    title: str # The title of the milestone
    effort_points: int = Field(..., ge=1) # A positive integer estimating the effort for this milestone (no upper limit)


# The response for milestone generation
class MilestonePlanResponse(BaseModel): 
    project_name: str # The name of the project (can be a short title derived from the description)
    milestones: List[MilestoneSummary] # A list of milestones with their effort points
    overall_risk_warning: Optional[str] = None # A summary of any risks the AI identified (e.g., "High risk due to missing skills in X")
    suggested_timeline_weeks: Optional[int] = None # An estimated timeline for the project in weeks, based on effort points and team skills

# Refusing to accept a project request without a proper description. 
class ProjectRequest(BaseModel):
    # This forces the user to type at least 10 characters.
    # If they type "Hi", the app rejects it immediately.
    description: str = Field(..., min_length=10, max_length=2000) # We set a max_length to prevent prompt overload and unreasonable AI load-balancing scenarios.
    
    team_members: List[TeamMember] = Field(default_factory=list, max_length=20)   # A list of team members involved in the project. Capped at 20 to prevent prompt overload and unreasonable AI load-balancing scenarios.

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
    status: Literal["todo", "in_progress", "done"] = "todo" # enforced status values

# Defining the "Milestone". It's a folder for Tasks.
class Milestone(BaseModel):
    title: str
    tasks: List[Task]
    effort_points: int = Field(..., ge=1) # A positive integer estimating the effort for this milestone (no upper limit)
    order: Optional[int] = None

# This is the request model for generating tasks for a specific milestone. 
class MilestoneTaskRequest(BaseModel):
    project_description: str
    milestone_title: str
    milestone_effort: int
    team_members: List[TeamMember] = Field(..., min_length=1, max_length=20)  # at least 1 member required; capped at 20
    workload_summary: str
    all_milestones: List[MilestoneSummary]   # list of all milestones with title and effort_points

# Defining the "ProjectPlan". This is the final JSON "Package".
class ProjectPlan(BaseModel):
    project_name: str
    milestones: List[Milestone]
    
    # A summary of the project health
    overall_risk_warning: Optional[str] = None

class ProgressRequest(BaseModel):
    milestones: List[Milestone]  # each Milestone contains its tasks


# 1. Base properties every Project needs
class ProjectBase(BaseModel):
    name: str
    description: str  # Removed Optional: Database strictly requires a description
    status: str = "planned"  # Lowercase to perfectly match the Database Enum
    created_by: int  # Changed from owner_id to perfectly match the Database column
    deadline: Optional[datetime] = None

# 2. Properties required when the frontend creates a new Project
class ProjectCreate(ProjectBase):
    member_ids: List[int] = Field(default_factory=list)
    supervisor_id: Optional[int] = None

# 3. Properties returned when sending a Project back to the frontend
class ProjectResponse(ProjectBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True
