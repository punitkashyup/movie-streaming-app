import logging
from sqlalchemy import text
from app.core.database import engine, Base, get_db
# Import all models to ensure they're registered with SQLAlchemy
from app.models.user import User
from app.models.subscription import SubscriptionPlan, Subscription
from app.models.movie import Movie

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def add_column(table, column, type_):
    """Add a column to a table if it doesn't exist"""
    try:
        with engine.connect() as conn:
            conn.execute(text(f"ALTER TABLE {table} ADD COLUMN IF NOT EXISTS {column} {type_}"))
            conn.commit()
            logger.info(f"Added column {column} to {table}")
    except Exception as e:
        logger.error(f"Error adding column {column} to {table}: {str(e)}")

def create_subscription_plans():
    """Create default subscription plans"""
    db = next(get_db())

    # Check if plans already exist
    existing_plans = db.query(SubscriptionPlan).all()
    if existing_plans:
        logger.info("Subscription plans already exist, skipping creation")
        return

    # Create default plans with prices in Indian Rupees
    plans = [
        SubscriptionPlan(
            name="Daily",
            description="24-hour access to all movies in standard definition",
            price=149,
            duration_days=1,
            features="Standard Definition,Watch on one device at a time,Full catalog access for 24 hours",
            is_active=True
        ),
        SubscriptionPlan(
            name="Weekly",
            description="7-day access to all movies in HD quality",
            price=599,
            duration_days=7,
            features="HD Quality,Watch on up to 2 devices at a time,Full catalog access for 7 days",
            is_active=True
        ),
        SubscriptionPlan(
            name="Monthly",
            description="30-day access to all movies in HD and Ultra HD",
            price=1199,
            duration_days=30,
            features="HD and Ultra HD,Watch on up to 4 devices at a time,Offline downloads,Full catalog access for 30 days",
            is_active=True
        )
    ]

    for plan in plans:
        db.add(plan)

    db.commit()
    logger.info("Created default subscription plans")

def migrate_subscription_db():
    """Run database migrations for subscription tables"""
    logger.info("Running subscription database migrations...")

    # Create tables if they don't exist
    Base.metadata.create_all(bind=engine)

    # Create default subscription plans
    create_subscription_plans()

    logger.info("Subscription database migrations completed successfully")

if __name__ == "__main__":
    migrate_subscription_db()
