"""add default availability to users

Revision ID: b7c4d2e9a1f0
Revises: 9a2b6f7d1c3e
Create Date: 2026-03-22 00:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy import inspect


# revision identifiers, used by Alembic.
revision: str = "b7c4d2e9a1f0"
down_revision: Union[str, Sequence[str], None] = "9a2b6f7d1c3e"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def _column_exists(table_name: str, column_name: str) -> bool:
    bind = op.get_bind()
    inspector = inspect(bind)
    columns = inspector.get_columns(table_name)
    return any(column["name"] == column_name for column in columns)


def upgrade() -> None:
    if not _column_exists("users", "default_availability"):
        op.add_column("users", sa.Column("default_availability", sa.JSON(), nullable=True))


def downgrade() -> None:
    if _column_exists("users", "default_availability"):
        op.drop_column("users", "default_availability")
