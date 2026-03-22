"""enforce unique conversation participant pair

Revision ID: f4be5e11e89b
Revises: dca28a566bdc
Create Date: 2026-03-21 21:15:10.429757

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy import inspect



# revision identifiers, used by Alembic.
revision: str = 'f4be5e11e89b'
down_revision: Union[str, Sequence[str], None] = 'dca28a566bdc'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def _table_exists(table_name: str) -> bool:
    bind = op.get_bind()
    inspector = inspect(bind)
    return table_name in inspector.get_table_names()


def _unique_exists(table_name: str, constraint_name: str) -> bool:
    bind = op.get_bind()
    inspector = inspect(bind)
    uniques = inspector.get_unique_constraints(table_name)
    return any(u.get("name") == constraint_name for u in uniques)


def upgrade() -> None:
    if not _table_exists("conversation_participants"):
        return

    # Keep one row per (conversation_id, user_id), delete duplicates
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
    if not _table_exists("conversation_participants"):
        return

    if _unique_exists("conversation_participants", "uq_conversation_participant"):
        with op.batch_alter_table("conversation_participants") as batch_op:
            batch_op.drop_constraint("uq_conversation_participant", type_="unique")