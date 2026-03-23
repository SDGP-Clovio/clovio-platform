from pydantic import BaseModel
from datetime import datetime


class MessageOut(BaseModel):
    id: int
    sender_id: int
    sender_username: str
    content: str
    created_at: datetime

    class Config:
        from_attributes = True


class ConversationOut(BaseModel):
    id: int
    project_id: int
    created_at: datetime

    class Config:
        from_attributes = True


class SendMessageRequest(BaseModel):
    content: str

