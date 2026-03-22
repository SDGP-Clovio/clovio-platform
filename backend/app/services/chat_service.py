from sqlalchemy.orm import Session
from fastapi import HTTPException
from app.models.chat import (
    Conversation, ConversationParticipant,
    Message
)

def create_conversation_for_project(
    db: Session,
    project_id: int,
    member_ids: list[int],
) -> Conversation:
    conversation = Conversation(project_id=project_id)
    db.add(conversation)
    db.flush()

    for user_id in member_ids:
        db.add(ConversationParticipant(
            conversation_id=conversation.id,
            user_id=user_id,
        ))

    db.flush()
    return conversation


def add_participant(db: Session, project_id: int, user_id: int):
    conversation = _get_conversation_by_project(db, project_id)
    already_in = db.query(ConversationParticipant).filter_by(
        conversation_id=conversation.id,
        user_id=user_id,
    ).first()
    if not already_in:
        db.add(ConversationParticipant(conversation_id=conversation.id, user_id=user_id))
        db.flush()


def remove_participant(db: Session, project_id: int, user_id: int):
    conversation = _get_conversation_by_project(db, project_id)
    db.query(ConversationParticipant).filter_by(
        conversation_id=conversation.id,
        user_id=user_id,
    ).delete()
    db.flush()


def is_participant(db: Session, conversation_id: int, user_id: int) -> bool:
    return db.query(ConversationParticipant).filter_by(
        conversation_id=conversation_id,
        user_id=user_id,
    ).first() is not None


def get_recent_messages(db: Session, conversation_id: int, limit: int = 50) -> list[Message]:
    return (
        db.query(Message)
        .filter(Message.conversation_id == conversation_id)
        .order_by(Message.created_at.desc())
        .limit(limit)
        .all()
    )


def get_conversation_by_project(db: Session, project_id: int) -> Conversation:
    return _get_conversation_by_project(db, project_id)


def _get_conversation_by_project(db: Session, project_id: int) -> Conversation:
    conv = db.query(Conversation).filter(Conversation.project_id == project_id).first()
    if not conv:
        raise HTTPException(status_code=404, detail="Conversation not found for this project")
    return conv
