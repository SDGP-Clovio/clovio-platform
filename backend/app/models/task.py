from sqlalchemy import Column, Integer, String, Text, Boolean, Enum, ForeignKey, JSON
from sqlalchemy.orm import relationship
from app.core.database import Base
import enum

class TaskStatus(str, enum.Enum):
    TODO = "todo"
    DOING = "doing"
    DONE = "done"

class Task(Base):
    __tablename__ = "tasks"

    id = Column(Integer, primary_key=True, index=True)
    milestone_id = Column(Integer, ForeignKey("milestones.id", ondelete="CASCADE"), nullable=False, index=True)
    name = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    complexity = Column(Integer, nullable=False)
    required_skills = Column(JSON, nullable=True)
    assigned_to = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True, index=True)
    assignment_reason = Column(Text, nullable=True)
    is_skill_gap = Column(Boolean, default=False)
    status = Column(Enum(TaskStatus), default=TaskStatus.TODO)

    milestone = relationship("Milestone", back_populates="tasks")
    assignee = relationship("User", foreign_keys=[assigned_to])