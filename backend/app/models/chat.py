import uuid
from sqlalchemy import Column, Text, DateTime, ForeignKey, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from app.database import Base


class Conversation(Base):
    """Group chat — one per project, auto-created when project is created."""
    __tablename__ = "conversations"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    project_id = Column(UUID(as_uuid=True), ForeignKey("projects.id", ondelete="CASCADE"), unique=True, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    project = relationship("Project", back_populates="conversation")
    participants = relationship("ConversationParticipant", back_populates="conversation", cascade="all, delete")
    messages = relationship("Message", back_populates="conversation", cascade="all, delete")


class ConversationParticipant(Base):
    """Tracks who is in each project group chat."""
    __tablename__ = "conversation_participants"

    conversation_id = Column(UUID(as_uuid=True), ForeignKey("conversations.id", ondelete="CASCADE"), primary_key=True)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), primary_key=True)
    joined_at = Column(DateTime(timezone=True), server_default=func.now())

    conversation = relationship("Conversation", back_populates="participants")
    user = relationship("User")


class DirectConversation(Base):
    """1-on-1 private chat between two users."""
    __tablename__ = "direct_conversations"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_a_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    user_b_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    user_a = relationship("User", foreign_keys=[user_a_id])
    user_b = relationship("User", foreign_keys=[user_b_id])
    messages = relationship("DirectMessage", back_populates="direct_conversation", cascade="all, delete")


class Message(Base):
    """A message inside a project group chat."""
    __tablename__ = "messages"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    conversation_id = Column(UUID(as_uuid=True), ForeignKey("conversations.id", ondelete="CASCADE"), nullable=False)
    sender_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    content = Column(Text, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    conversation = relationship("Conversation", back_populates="messages")
    sender = relationship("User")


class DirectMessage(Base):
    """A message inside a 1-on-1 DM conversation."""
    __tablename__ = "direct_messages"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    direct_conversation_id = Column(UUID(as_uuid=True), ForeignKey("direct_conversations.id", ondelete="CASCADE"), nullable=False)
    sender_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    content = Column(Text, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    direct_conversation = relationship("DirectConversation", back_populates="messages")
    sender = relationship("User")