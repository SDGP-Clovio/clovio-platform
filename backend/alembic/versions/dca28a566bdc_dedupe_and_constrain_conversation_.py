"""dedupe and constrain conversation participants

Revision ID: dca28a566bdc
Revises: c266a300c4ba
Create Date: 2026-03-21 21:05:28.004912

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa
from sqlalchemy import inspect


# revision identifiers, used by Alembic.
revision: str = 'dca28a566bdc'
down_revision: Union[str, Sequence[str], None] = 'c266a300c4ba'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def _unique_exists(table_name: str, constraint_name: str) -> bool:
    bind = op.get_bind()
    inspector = inspect(bind)
    uniques = inspector.get_unique_constraints(table_name)
    return any(u.get("name") == constraint_name for u in uniques)


def upgrade() -> None:
    # Keep first row and delete duplicates for same (conversation_id, user_id)
    op.execute(
        sa.text(
            """
            DELETE FROM conversation_participants
            WHERE id NOT IN (
                SELECT MIN(id)
                FROM conversation_participants
                GROUP BY conversation_id, user_id
            )
            """
        )
    )

    if not _unique_exists("conversation_participants", "uq_conversation_participant"):
        with op.batch_alter_table("conversation_participants") as batch_op:
            batch_op.create_unique_constraint(
                "uq_conversation_participant",
                ["conversation_id", "user_id"],
            )


def downgrade() -> None:
    if _unique_exists("conversation_participants", "uq_conversation_participant"):
        with op.batch_alter_table("conversation_participants") as batch_op:
            batch_op.drop_constraint("uq_conversation_participant", type_="unique")