"""drop direct chat tables

Revision ID: f27d9caf58ef
Revises: f4be5e11e89b
Create Date: 2026-03-22 14:34:40.748484

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'f27d9caf58ef'
down_revision: Union[str, Sequence[str], None] = 'f4be5e11e89b'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.drop_table("direct_messages")
    op.drop_table("direct_conversations")

def downgrade() -> None:
    op.create_table(
        "direct_conversations",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("user_a_id", sa.Integer(), sa.ForeignKey("users.id", ondelete="CASCADE"), nullable=False),
        sa.Column("user_b_id", sa.Integer(), sa.ForeignKey("users.id", ondelete="CASCADE"), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.UniqueConstraint("user_a_id", "user_b_id", name="uq_direct_conv"),
    )
    op.create_table(
        "direct_messages",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("direct_conversation_id", sa.Integer(), sa.ForeignKey("direct_conversations.id", ondelete="CASCADE"), nullable=False),
        sa.Column("sender_id", sa.Integer(), sa.ForeignKey("users.id", ondelete="CASCADE"), nullable=False),
        sa.Column("content", sa.Text(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
    )