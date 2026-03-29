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

class MilestoneSummary(BaseModel): # A simplified milestone summary for the milestone-only endpoint
    title: str # The title of the milestone
    effort_points: int # A positive integer estimating the effort for this milestone (no upper limit)


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
    description: str = Field(..., min_length=10, max_length=2000)
    # Add max_length (e.g., 2000) to cap token usage per request. Without it,
    # a very long description can produce unexpectedly large (and expensive) AI responses.
    team_members: List[TeamMember] = Field(default_factory=list)   # A list of team members involved in the project
    # Consider adding a max_items constraint on team_members (e.g., reasonable cap of 20)
    # to prevent prompt size explosion and unreasonable AI load-balancing scenarios.


# ──────────────────────────────────────────────────────────────────────────────
# [ADDED] Request model for the task generation endpoint.
# This is what the frontend sends when it wants tasks for a specific milestone.
# Previously there was no schema for this — callers had to pass raw args.
# ──────────────────────────────────────────────────────────────────────────────
class TaskGenerationRequest(BaseModel):
    project_description: str = Field(..., min_length=10, max_length=2000)  # Same project desc used for milestones
    milestone_title: str = Field(..., min_length=1)       # Which milestone to generate tasks for
    milestone_effort: int = Field(..., ge=1)               # The effort points for this milestone
    team_members: List[TeamMember]                         # Full team list with skills
    all_milestones: Optional[List[MilestoneSummary]] = None  # Optional: all milestones for context

    # NOTE: workload_summary is NOT included here because the API layer should
    # build it from the database (Member 5's work). For now, the endpoint will
    # accept an optional override, but the default will come from the
    # build_workload_summary() utility in app/services/workload.py.
    workload_override: Optional[str] = None  # Manual override for testing without a DB


# ──────────────────────────────────────────────────────────────────────────────
# [ADDED] Response models for fairness and progress endpoints.
# These define the JSON shape that the frontend will receive.
# ──────────────────────────────────────────────────────────────────────────────

class MemberWorkload(BaseModel):
    """Per-member workload breakdown — used in fairness response."""
    name: str                    # Team member name
    total_assigned: int          # Sum of complexity points assigned to this member
    completed: int = 0           # Points from completed tasks
    pending: int = 0             # Points from pending/in-progress tasks

class FairnessResponse(BaseModel):
    """Response from GET /api/v1/fairness — Gini coefficient + per-member breakdown."""
    gini_coefficient: float      # 0.0 = perfectly equal, 1.0 = completely unequal
    member_workloads: List[MemberWorkload]  # Breakdown per member (so frontend can show a chart)

# ──────────────────────────────────────────────────────────────────────────────
# [ADDED] Input models for the progress endpoint.
# Previously this endpoint accepted raw List[dict] — now it has proper
# Pydantic validation so Swagger shows the expected shape and bad data
# is rejected automatically.
# ──────────────────────────────────────────────────────────────────────────────

class ProgressTaskInput(BaseModel):
    """A single task's progress data (input to the progress endpoint)."""
    complexity: int = Field(..., ge=1, le=10)  # Task effort score
    status: str = Field(..., pattern="^(todo|doing|done)$")  # "todo", "doing", or "done"

class ProgressMilestoneInput(BaseModel):
    """A single milestone's progress data (input to the progress endpoint)."""
    title: str
    effort_points: int = Field(..., ge=1)        # Total effort for this milestone
    status: str = Field(..., pattern="^(pending|active|completed)$")  # "pending", "active", or "completed"
    tasks: List[ProgressTaskInput] = Field(default_factory=list)  # Tasks within this milestone

class MilestoneProgress(BaseModel):
    """Progress details for a single milestone (output)."""
    title: str
    effort_points: int           # Total effort for this milestone
    completed_points: int        # Sum of completed task complexities
    progress_percent: float      # 0.0 to 100.0

class ProgressResponse(BaseModel):
    """Response from GET /api/v1/progress — overall + per-milestone progress."""
    overall_percent: float       # 0.0 to 100.0
    total_effort: int            # Sum of all milestone effort points
    completed_effort: float      # Weighted completed effort across milestones
    milestones: List[MilestoneProgress]  # Per-milestone detail

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

    # Add an estimated_hours field so the plan output gives teams a rough
    # time estimate per task. The AI could populate this based on complexity.
    # estimated_hours: Optional[float] = Field(None, gt=0)

    # Add a priority field (e.g., "high", "medium", "low" or 1-3 int) so teams
    # can sort and schedule tasks more effectively after receiving the plan.
    # priority: Optional[int] = Field(None, ge=1, le=3)