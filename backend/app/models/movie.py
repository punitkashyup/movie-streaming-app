from sqlalchemy import Column, Integer, String, Float, DateTime, Text, ForeignKey, Boolean
from sqlalchemy.sql import func
from app.core.database import Base

class Movie(Base):
    __tablename__ = "movies"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, index=True)
    description = Column(Text)
    release_year = Column(Integer)
    duration = Column(Integer)  # in minutes
    genre = Column(String)
    director = Column(String)
    cast = Column(String)
    poster_url = Column(String)
    video_url = Column(String)  # Original uploaded video URL
    streaming_url = Column(String)  # HLS streaming URL
    mediaconvert_job_id = Column(String)  # AWS MediaConvert job ID
    is_transcoded = Column(Boolean, default=False)  # Flag to indicate if video has been transcoded
    transcoding_status = Column(String, default="NOT_STARTED")  # Status of transcoding job
    rating = Column(Float, default=0.0)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
