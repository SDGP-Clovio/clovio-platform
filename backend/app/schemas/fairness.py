from pydantic import BaseModel
from typing import List
from app.schemas.project import Task

class FairnessRequest(BaseModel):
    tasks: List[Task]
    member_names: List[str]