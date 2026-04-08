"""add audit fields to categories launches and recurring rules

Revision ID: 0004_audit_fields_entities
Revises: 0003_user_audit_fields
Create Date: 2026-04-08
"""
from alembic import op
import sqlalchemy as sa

revision = '0004_audit_fields_entities'
down_revision = '0003_user_audit_fields'
branch_labels = None
depends_on = None


def upgrade() -> None:
    for table in ('categories', 'launches', 'recurring_rules'):
        op.add_column(table, sa.Column('created_by_user_id', sa.Integer(), sa.ForeignKey('users.id'), nullable=True))
        op.add_column(table, sa.Column('updated_by_user_id', sa.Integer(), sa.ForeignKey('users.id'), nullable=True))


def downgrade() -> None:
    for table in ('recurring_rules', 'launches', 'categories'):
        op.drop_column(table, 'updated_by_user_id')
        op.drop_column(table, 'created_by_user_id')
