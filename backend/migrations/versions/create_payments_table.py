"""create payments table

Revision ID: 3a4c5b6d7e8f
Revises: 2b3c4d5e6f7g
Create Date: 2023-05-15 10:00:00.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects.postgresql import JSON

# revision identifiers, used by Alembic.
revision = '3a4c5b6d7e8f'
down_revision = '2b3c4d5e6f7g'  # Update this to match your last migration
branch_labels = None
depends_on = None


def upgrade():
    # Create payments table
    op.create_table(
        'payments',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('user_id', sa.Integer(), nullable=False),
        sa.Column('subscription_id', sa.Integer(), nullable=True),
        sa.Column('amount', sa.Float(), nullable=False),
        sa.Column('currency', sa.String(), nullable=True),
        sa.Column('payment_method', sa.String(), nullable=True),
        sa.Column('razorpay_order_id', sa.String(), nullable=True),
        sa.Column('razorpay_payment_id', sa.String(), nullable=True),
        sa.Column('razorpay_signature', sa.String(), nullable=True),
        sa.Column('status', sa.String(), nullable=True),
        sa.Column('payment_data', JSON(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=True),
        sa.ForeignKeyConstraint(['subscription_id'], ['subscriptions.id'], ),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    
    # Create indexes
    op.create_index(op.f('ix_payments_id'), 'payments', ['id'], unique=False)
    op.create_index(op.f('ix_payments_user_id'), 'payments', ['user_id'], unique=False)
    op.create_index(op.f('ix_payments_subscription_id'), 'payments', ['subscription_id'], unique=False)
    op.create_index(op.f('ix_payments_razorpay_order_id'), 'payments', ['razorpay_order_id'], unique=False)
    op.create_index(op.f('ix_payments_razorpay_payment_id'), 'payments', ['razorpay_payment_id'], unique=False)
    
    # Add payment_status column to subscriptions table
    op.add_column('subscriptions', sa.Column('payment_status', sa.String(), nullable=True, server_default='pending'))


def downgrade():
    # Drop indexes
    op.drop_index(op.f('ix_payments_razorpay_payment_id'), table_name='payments')
    op.drop_index(op.f('ix_payments_razorpay_order_id'), table_name='payments')
    op.drop_index(op.f('ix_payments_subscription_id'), table_name='payments')
    op.drop_index(op.f('ix_payments_user_id'), table_name='payments')
    op.drop_index(op.f('ix_payments_id'), table_name='payments')
    
    # Drop payments table
    op.drop_table('payments')
    
    # Remove payment_status column from subscriptions table
    op.drop_column('subscriptions', 'payment_status')
