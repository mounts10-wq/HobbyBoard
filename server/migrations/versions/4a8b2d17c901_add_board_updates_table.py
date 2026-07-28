"""Add board updates table

Revision ID: 4a8b2d17c901
Revises: 9af942452742
Create Date: 2026-07-28 00:00:00.000000

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '4a8b2d17c901'
down_revision = '9af942452742'
branch_labels = None
depends_on = None


def upgrade():
    op.create_table(
        'board_updates',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('content', sa.Text(), nullable=False),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.Column('board_id', sa.Integer(), nullable=False),
        sa.Column('user_id', sa.Integer(), nullable=False),
        sa.ForeignKeyConstraint(['board_id'], ['boards.id']),
        sa.ForeignKeyConstraint(['user_id'], ['users.id']),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_board_updates_board_id'), 'board_updates', ['board_id'], unique=False)


def downgrade():
    op.drop_index(op.f('ix_board_updates_board_id'), table_name='board_updates')
    op.drop_table('board_updates')