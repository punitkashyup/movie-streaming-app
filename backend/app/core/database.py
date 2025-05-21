from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from app.core.config import settings

connect_args = {}
if settings.DATABASE_URL.startswith('sqlite'):
    connect_args = {"check_same_thread": False}
elif settings.DATABASE_URL.startswith('postgresql'):
    connect_args = {"connect_timeout": 10}

engine = create_engine(
    settings.DATABASE_URL,
    pool_pre_ping=True,  # Enables connection pool "pre-ping" feature
    pool_recycle=3600,   # Recycle connections after 1 hour
    connect_args=connect_args
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

# Dependency
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
