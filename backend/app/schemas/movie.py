from typing import Optional
from pydantic import BaseModel
from datetime import datetime

# Shared properties
class MovieBase(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    release_year: Optional[int] = None
    duration: Optional[int] = None
    genre: Optional[str] = None
    director: Optional[str] = None
    cast: Optional[str] = None
    poster_url: Optional[str] = None
    video_url: Optional[str] = None
    streaming_url: Optional[str] = None
    is_transcoded: Optional[bool] = False
    transcoding_status: Optional[str] = "NOT_STARTED"
    rating: Optional[float] = 0.0

# Properties to receive on movie creation
class MovieCreate(MovieBase):
    title: str
    description: str
    release_year: int
    duration: int
    genre: str
    director: str
    cast: str

# Properties to receive on movie update
class MovieUpdate(MovieBase):
    pass

# Properties shared by models stored in DB
class MovieInDBBase(MovieBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True

# Additional properties to return via API
class Movie(MovieInDBBase):
    pass
