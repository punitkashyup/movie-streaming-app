from typing import List, Dict, Any
import logging
from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, BackgroundTasks, Query
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models.movie import Movie
from app.schemas.movie import Movie as MovieSchema, MovieCreate, MovieUpdate
from app.api.deps import get_current_active_user, get_current_active_superuser
from app.services.s3 import upload_file_to_s3, delete_file_from_s3
from app.services.mediaconvert import create_hls_job, get_job_status
from app.services.movie_api import search_movie, get_movie_details

# Set up logging
logger = logging.getLogger(__name__)

router = APIRouter()

@router.get("/movies", response_model=List[MovieSchema])
def read_movies(
    db: Session = Depends(get_db),
    skip: int = 0,
    limit: int = 100,
):
    """
    Retrieve movies.
    """
    movies = db.query(Movie).offset(skip).limit(limit).all()
    return movies

@router.get("/movies/{movie_id}", response_model=MovieSchema)
def read_movie(
    *,
    db: Session = Depends(get_db),
    movie_id: int,
):
    """
    Get movie by ID.
    """
    movie = db.query(Movie).filter(Movie.id == movie_id).first()
    if not movie:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Movie not found",
        )
    return movie

@router.post("/movies", response_model=MovieSchema)
def create_movie(
    *,
    db: Session = Depends(get_db),
    movie_in: MovieCreate,
    current_user = Depends(get_current_active_superuser),
):
    """
    Create new movie.
    """
    movie = Movie(
        title=movie_in.title,
        description=movie_in.description,
        release_year=movie_in.release_year,
        duration=movie_in.duration,
        genre=movie_in.genre,
        director=movie_in.director,
        cast=movie_in.cast,
        poster_url=movie_in.poster_url,
        video_url=movie_in.video_url,
    )
    db.add(movie)
    db.commit()
    db.refresh(movie)
    return movie

@router.put("/movies/{movie_id}", response_model=MovieSchema)
def update_movie(
    *,
    db: Session = Depends(get_db),
    movie_id: int,
    movie_in: MovieUpdate,
    current_user = Depends(get_current_active_superuser),
):
    """
    Update a movie.
    """
    movie = db.query(Movie).filter(Movie.id == movie_id).first()
    if not movie:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Movie not found",
        )

    update_data = movie_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(movie, field, value)

    db.add(movie)
    db.commit()
    db.refresh(movie)
    return movie

@router.delete("/movies/{movie_id}", response_model=MovieSchema)
def delete_movie(
    *,
    db: Session = Depends(get_db),
    movie_id: int,
    current_user = Depends(get_current_active_superuser),
):
    """
    Delete a movie and its associated files from S3.
    """
    movie = db.query(Movie).filter(Movie.id == movie_id).first()
    if not movie:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Movie not found",
        )

    # Store movie data for return
    movie_data = MovieSchema.model_validate(movie)

    # Delete associated files from S3
    s3_deletion_results = {}

    # Delete poster if exists
    if movie.poster_url:
        poster_deleted = delete_file_from_s3(movie.poster_url)
        s3_deletion_results["poster_deleted"] = poster_deleted
        if not poster_deleted:
            logger.warning(f"Failed to delete poster for movie {movie_id}: {movie.poster_url}")

    # Delete original video if exists
    if movie.video_url:
        video_deleted = delete_file_from_s3(movie.video_url)
        s3_deletion_results["video_deleted"] = video_deleted
        if not video_deleted:
            logger.warning(f"Failed to delete video for movie {movie_id}: {movie.video_url}")

    # Delete transcoded files if they exist
    # This is a simplified approach - in production, you would need to delete all HLS segments
    # For now, we'll just log that these files should be deleted
    if movie.is_transcoded and movie.streaming_url:
        logger.info(f"Transcoded files for movie {movie_id} should be deleted from S3 output bucket")
        # In a production environment, you would:
        # 1. List all objects in the output bucket with the prefix "movies/{movie_id}/hls/"
        # 2. Delete all those objects
        s3_deletion_results["transcoded_files"] = "NEEDS_MANUAL_DELETION"

    # Log S3 deletion results
    logger.info(f"S3 deletion results for movie {movie_id}: {s3_deletion_results}")

    # Delete movie from database
    db.delete(movie)
    db.commit()

    return movie_data

@router.post("/movies/{movie_id}/upload-poster")
async def upload_movie_poster(
    *,
    db: Session = Depends(get_db),
    movie_id: int,
    file: UploadFile = File(...),
    current_user = Depends(get_current_active_superuser),
):
    """
    Upload a movie poster image to S3.
    """
    movie = db.query(Movie).filter(Movie.id == movie_id).first()
    if not movie:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Movie not found",
        )

    poster_url = await upload_file_to_s3(file, f"movies/{movie_id}/poster")
    movie.poster_url = poster_url

    db.add(movie)
    db.commit()
    db.refresh(movie)

    return {"poster_url": poster_url}

@router.post("/movies/{movie_id}/upload-video")
async def upload_movie_video(
    *,
    db: Session = Depends(get_db),
    movie_id: int,
    file: UploadFile = File(...),
    background_tasks: BackgroundTasks,
    current_user = Depends(get_current_active_superuser),
):
    """
    Upload a movie video file to S3 and start the transcoding process.
    """
    movie = db.query(Movie).filter(Movie.id == movie_id).first()
    if not movie:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Movie not found",
        )

    # Upload the original video to S3
    video_url = await upload_file_to_s3(file, f"movies/{movie_id}/video")
    movie.video_url = video_url
    movie.transcoding_status = "QUEUED"

    db.add(movie)
    db.commit()
    db.refresh(movie)

    # Start the transcoding process in the background
    background_tasks.add_task(start_transcoding_job, db, movie_id, video_url)

    return {
        "video_url": video_url,
        "message": "Video uploaded successfully. Transcoding process started in the background."
    }

async def start_transcoding_job(db: Session, movie_id: int, video_url: str):
    """
    Start a MediaConvert job to transcode the video to HLS format.
    """
    try:
        # Get the movie
        movie = db.query(Movie).filter(Movie.id == movie_id).first()
        if not movie:
            logger.error(f"Movie {movie_id} not found when starting transcoding job")
            return

        # Update status
        movie.transcoding_status = "PROCESSING"
        db.add(movie)
        db.commit()

        # Create the MediaConvert job
        job_result = create_hls_job(video_url, movie_id)

        if not job_result:
            logger.error(f"Failed to create MediaConvert job for movie {movie_id}")
            movie.transcoding_status = "ERROR"
            db.add(movie)
            db.commit()
            return

        # Update the movie with job details
        movie.mediaconvert_job_id = job_result["job_id"]
        movie.streaming_url = job_result["streaming_url"]
        movie.transcoding_status = job_result["status"]

        db.add(movie)
        db.commit()

        logger.info(f"Started transcoding job {job_result['job_id']} for movie {movie_id}")

    except Exception as e:
        logger.error(f"Error starting transcoding job for movie {movie_id}: {str(e)}")
        try:
            movie = db.query(Movie).filter(Movie.id == movie_id).first()
            if movie:
                movie.transcoding_status = "ERROR"
                db.add(movie)
                db.commit()
        except Exception as db_error:
            logger.error(f"Error updating movie status: {str(db_error)}")

@router.get("/movies/{movie_id}/transcoding-status")
async def get_transcoding_status(
    *,
    db: Session = Depends(get_db),
    movie_id: int,
    current_user = Depends(get_current_active_user),
):
    """
    Get the transcoding status of a movie.
    """
    movie = db.query(Movie).filter(Movie.id == movie_id).first()
    if not movie:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Movie not found",
        )

    # Check if user has an active subscription or is an admin
    has_access = current_user.is_superuser

    if not has_access:
        # Check for active subscription
        from app.models.subscription import Subscription
        from app.core.utils import get_utc_now

        subscription = db.query(Subscription).filter(
            Subscription.user_id == current_user.id,
            Subscription.is_active == True,
            Subscription.end_date > get_utc_now()
        ).first()

        has_access = subscription is not None

    # If the movie has a MediaConvert job ID and is still processing, check the status
    if movie.mediaconvert_job_id and movie.transcoding_status == "PROCESSING":
        job_status = get_job_status(movie.mediaconvert_job_id)

        # Update the status if it has changed
        if job_status != movie.transcoding_status:
            movie.transcoding_status = job_status

            # If the job is complete, mark the movie as transcoded
            if job_status == "COMPLETE":
                movie.is_transcoded = True

            db.add(movie)
            db.commit()
            db.refresh(movie)

    # Return streaming URL only if user has access
    streaming_url = None
    if has_access and movie.is_transcoded:
        streaming_url = movie.streaming_url

    return {
        "movie_id": movie_id,
        "transcoding_status": movie.transcoding_status,
        "is_transcoded": movie.is_transcoded,
        "streaming_url": streaming_url,
        "has_access": has_access,
        "requires_subscription": not has_access
    }

@router.get("/search-movies")
async def search_movies(
    *,
    title: str = Query(..., description="Movie title to search for"),
    current_user = Depends(get_current_active_superuser),
):
    """
    Search for movies by title using external API.
    """
    results = search_movie(title)
    return {"results": results}

@router.get("/movie-details/{tmdb_id}")
async def fetch_movie_details(
    *,
    tmdb_id: int,
    current_user = Depends(get_current_active_superuser),
):
    """
    Get detailed information about a movie by its TMDB ID.
    """
    movie_details = get_movie_details(tmdb_id)
    if not movie_details:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Movie details not found",
        )
    return movie_details
