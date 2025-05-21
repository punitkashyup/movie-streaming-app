import boto3
import uuid
import logging
from urllib.parse import urlparse
from fastapi import UploadFile
from botocore.exceptions import ClientError
from app.core.config import settings

# Set up logging
logger = logging.getLogger(__name__)

s3_client = boto3.client(
    's3',
    aws_access_key_id=settings.AWS_ACCESS_KEY_ID,
    aws_secret_access_key=settings.AWS_SECRET_ACCESS_KEY,
    region_name=settings.AWS_REGION
)

async def upload_file_to_s3(file: UploadFile, prefix: str) -> str:
    """
    Upload a file to S3 bucket
    """
    file_content = await file.read()
    file_extension = file.filename.split('.')[-1]
    file_name = f"{prefix}/{str(uuid.uuid4())}.{file_extension}"

    s3_client.put_object(
        Bucket=settings.S3_BUCKET_NAME,
        Key=file_name,
        Body=file_content,
        ContentType=file.content_type
    )

    # Generate the URL
    url = f"https://{settings.S3_BUCKET_NAME}.s3.amazonaws.com/{file_name}"
    return url

def delete_file_from_s3(file_url: str) -> bool:
    """
    Delete a file from S3 bucket using its URL

    Args:
        file_url: The full URL of the file to delete

    Returns:
        bool: True if deletion was successful, False otherwise
    """
    if not file_url:
        logger.warning("Attempted to delete empty file URL")
        return False

    try:
        # Parse the URL to get the key
        parsed_url = urlparse(file_url)
        path = parsed_url.path.lstrip('/')

        # If the URL is in the format https://bucket-name.s3.amazonaws.com/key
        if parsed_url.netloc.startswith(f"{settings.S3_BUCKET_NAME}.s3."):
            key = path
        # If the URL is in the format https://s3.amazonaws.com/bucket-name/key
        elif parsed_url.netloc == "s3.amazonaws.com":
            key = path.replace(f"{settings.S3_BUCKET_NAME}/", "", 1)
        else:
            logger.error(f"Unrecognized S3 URL format: {file_url}")
            return False

        # Delete the file
        s3_client.delete_object(
            Bucket=settings.S3_BUCKET_NAME,
            Key=key
        )
        logger.info(f"Successfully deleted file from S3: {key}")
        return True
    except ClientError as e:
        logger.error(f"Error deleting file from S3: {e}")
        return False
    except Exception as e:
        logger.error(f"Unexpected error deleting file from S3: {e}")
        return False
