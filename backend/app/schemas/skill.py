from pydantic import BaseModel
from typing import Optional

# 1. Base properties for a Skill
class SkillBase(BaseModel):
    name: str  # e.g., "Python", "React"
    category: Optional[str] = None # e.g., "Frontend", "Backend", "Database"
    description: Optional[str] = None

# 2. Properties required to create a new Skill
class SkillCreate(SkillBase):
    pass # We just need the base fields to create one

# 3. Properties returned when fetching a Skill from the database
class SkillResponse(SkillBase):
    id: int

    class Config:
        from_attributes = True