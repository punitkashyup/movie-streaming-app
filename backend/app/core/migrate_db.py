import logging
from sqlalchemy import Column, String, Boolean
from sqlalchemy.sql import text
from app.core.database import engine, Base, get_db
from app.models.movie import Movie

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def check_column_exists(table_name, column_name):
    """Check if a column exists in a table"""
    from app.core.config import settings

    with engine.connect() as connection:
        if settings.DATABASE_URL.startswith('sqlite'):
            # SQLite specific query
            result = connection.execute(text(
                f"SELECT COUNT(*) FROM pragma_table_info('{table_name}') "
                f"WHERE name='{column_name}'"
            ))
        else:
            # PostgreSQL query
            result = connection.execute(text(
                f"SELECT EXISTS (SELECT 1 FROM information_schema.columns "
                f"WHERE table_name='{table_name}' AND column_name='{column_name}')"
            ))
        return result.scalar() > 0

def add_column(table_name, column_name, column_type):
    """Add a column to a table if it doesn't exist"""
    if not check_column_exists(table_name, column_name):
        logger.info(f"Adding column {column_name} to {table_name}")
        with engine.connect() as connection:
            connection.execute(text(f"ALTER TABLE {table_name} ADD COLUMN {column_name} {column_type}"))
            connection.commit()
        return True
    else:
        logger.info(f"Column {column_name} already exists in {table_name}")
        return False

def migrate_db():
    """Run database migrations"""
    logger.info("Running database migrations...")

    # Create tables if they don't exist
    Base.metadata.create_all(bind=engine)

    # Add missing columns to movies table
    add_column("movies", "streaming_url", "VARCHAR")
    add_column("movies", "mediaconvert_job_id", "VARCHAR")
    add_column("movies", "is_transcoded", "BOOLEAN DEFAULT FALSE")
    add_column("movies", "transcoding_status", "VARCHAR DEFAULT 'NOT_STARTED'")

    logger.info("Database migrations completed successfully")

if __name__ == "__main__":
    migrate_db()
