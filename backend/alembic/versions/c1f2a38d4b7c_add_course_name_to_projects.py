"""add course name to projects

Revision ID: c1f2a38d4b7c
Revises: b7c4d2e9a1f0
Create Date: 2026-03-22 00:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy import inspect


# revision identifiers, used by Alembic.
revision: str = "c1f2a38d4b7c"
down_revision: Union[str, Sequence[str], None] = "b7c4d2e9a1f0"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def _column_exists(table_name: str, column_name: str) -> bool:
    bind = op.get_bind()
    inspector = inspect(bind)
    columns = inspector.get_columns(table_name)
    return any(column["name"] == column_name for column in columns)


def upgrade() -> None:
    if not _column_exists("projects", "course_name"):
        op.add_column("projects", sa.Column("course_name", sa.String(), nullable=True))


def downgrade() -> None:
    if _column_exists("projects", "course_name"):
        op.drop_column("projects", "course_name")
