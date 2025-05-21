import os
from typing import List
from pydantic import AnyHttpUrl, EmailStr, field_validator
from pydantic_settings import BaseSettings
from dotenv import load_dotenv

load_dotenv()

class Settings(BaseSettings):
    # API settings
    API_V1_STR: str = "/api/v1"
    PROJECT_NAME: str = "Movie Streaming API"

    # CORS settings
    CORS_ORIGINS: List[str] = ["http://localhost:5173", "http://localhost:3000"]

    # JWT settings
    SECRET_KEY: str = os.getenv("SECRET_KEY", "your-secret-key-for-development")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30

    # Database settings
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./movie_app.db")

    # AWS settings
    AWS_ACCESS_KEY_ID: str = os.getenv("AWS_ACCESS_KEY_ID", "")
    AWS_SECRET_ACCESS_KEY: str = os.getenv("AWS_SECRET_ACCESS_KEY", "")
    AWS_REGION: str = os.getenv("AWS_REGION", "us-east-1")
    S3_BUCKET_NAME: str = os.getenv("S3_BUCKET_NAME", "movie-streaming-app")
    S3_INPUT_BUCKET: str = os.getenv("S3_INPUT_BUCKET", "movie-streaming-app-input")
    S3_OUTPUT_BUCKET: str = os.getenv("S3_OUTPUT_BUCKET", "movie-streaming-app-output")
    CLOUDFRONT_DOMAIN: str = os.getenv("CLOUDFRONT_DOMAIN", "")
    MEDIACONVERT_ENDPOINT: str = os.getenv("MEDIACONVERT_ENDPOINT", "")
    MEDIACONVERT_ROLE_ARN: str = os.getenv("MEDIACONVERT_ROLE_ARN", "")

    # Email settings
    EMAILS_ENABLED: bool = False
    EMAILS_FROM_EMAIL: str = os.getenv("EMAILS_FROM_EMAIL", "info@movieapp.com")
    EMAILS_FROM_NAME: str = os.getenv("EMAILS_FROM_NAME", "Movie Streaming App")

    @field_validator("CORS_ORIGINS")
    def assemble_cors_origins(cls, v):
        if isinstance(v, str) and not v.startswith("["):
            return [i.strip() for i in v.split(",")]
        return v

settings = Settings()
