import asyncio
import logging
from datetime import datetime
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.movie import Movie
from app.services.mediaconvert import get_job_status
from app.services.s3 import s3_client
from app.core.config import settings

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def update_streaming_url_with_actual_file(db, movie):
    """Update the streaming URL of a movie to use the actual file name"""
    try:
        # List files in the S3 bucket
        response = s3_client.list_objects_v2(
            Bucket=settings.S3_OUTPUT_BUCKET,
            Prefix=f'movies/{movie.id}/hls/'
        )

        if 'Contents' not in response:
            logger.error(f"No files found for movie {movie.id}")
            return False

        # Find the m3u8 file
        m3u8_files = [item['Key'] for item in response['Contents'] if item['Key'].endswith('.m3u8')]

        if not m3u8_files:
            logger.error(f"No m3u8 files found for movie {movie.id}")
            return False

        # Find the main m3u8 file (not the one with _720p or other quality indicators)
        main_m3u8_file = None
        for file_key in m3u8_files:
            if 'index' in file_key.lower():
                main_m3u8_file = file_key
                break

        if not main_m3u8_file:
            main_m3u8_file = m3u8_files[0]

        logger.info(f"Found main m3u8 file: {main_m3u8_file}")

        # Update the streaming URL to use the actual file name
        new_streaming_url = f"https://{settings.CLOUDFRONT_DOMAIN}/{main_m3u8_file}"

        # Only update if the URL has changed
        if movie.streaming_url != new_streaming_url:
            logger.info(f"Updating streaming URL for movie {movie.id}")
            logger.info(f"Old URL: {movie.streaming_url}")
            logger.info(f"New URL: {new_streaming_url}")

            # Update the movie
            movie.streaming_url = new_streaming_url
            return True

        return False
    except Exception as e:
        logger.error(f"Error updating streaming URL: {str(e)}")
        return False

async def check_transcoding_status():
    """
    Background task to check the status of pending MediaConvert jobs
    """
    while True:
        try:
            # Get database session
            db = next(get_db())

            # Get all movies with pending transcoding jobs that are not already transcoded
            pending_movies = db.query(Movie).filter(
                Movie.transcoding_status.in_(["SUBMITTED", "PROGRESSING"]),
                Movie.mediaconvert_job_id.isnot(None),
                Movie.is_transcoded == False
            ).all()

            if pending_movies:
                logger.info(f"Checking status for {len(pending_movies)} pending transcoding jobs")

                for movie in pending_movies:
                    # Skip if no job ID
                    if not movie.mediaconvert_job_id:
                        continue

                    # Get job status from AWS
                    status = get_job_status(movie.mediaconvert_job_id)

                    # Update movie status if changed
                    if status and status != movie.transcoding_status:
                        logger.info(f"Updating movie {movie.id} status from {movie.transcoding_status} to {status}")
                        movie.transcoding_status = status

                        # If job is complete, mark as transcoded and update streaming URL
                        if status == "COMPLETE":
                            movie.is_transcoded = True
                            logger.info(f"Movie {movie.id} transcoding completed")

                            # Update the streaming URL with the actual file name
                            update_streaming_url_with_actual_file(db, movie)

                        # If job failed, mark as not transcoded
                        elif status in ["ERROR", "CANCELED"]:
                            movie.is_transcoded = False
                            logger.info(f"Movie {movie.id} transcoding failed with status {status}")

                        # Update timestamp
                        movie.updated_at = datetime.utcnow()

                        # Save changes
                        db.add(movie)
                        db.commit()

            # Close the session
            db.close()

        except Exception as e:
            logger.error(f"Error checking transcoding status: {str(e)}")

        # Wait for 10 seconds before checking again
        await asyncio.sleep(10)

# Function to start the background task
def start_background_tasks():
    """
    Start background tasks
    """
    asyncio.create_task(check_transcoding_status())
    logger.info("Started background task to check transcoding status")
