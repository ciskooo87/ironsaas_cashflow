"""add audit fields to users

Revision ID: 0003_user_audit_fields
Revises: 0002_recurring_rules
Create Date: 2026-04-08
"""
from alembic import op
import sqlalchemy as sa

revision = '0003_user_audit_fields'
down_revision = '0002_recurring_rules'
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column('users', sa.Column('created_by_user_id', sa.Integer(), sa.ForeignKey('users.id'), nullable=True))
    op.add_column('users', sa.Column('updated_by_user_id', sa.Integer(), sa.ForeignKey('users.id'), nullable=True))


def downgrade() -> None:
    op.drop_column('users', 'updated_by_user_id')
    op.drop_column('users', 'created_by_user_id')
