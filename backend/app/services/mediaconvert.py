import boto3
import json
import logging
import os
from urllib.parse import urlparse
from app.core.config import settings

# Set up logging
logger = logging.getLogger(__name__)

# Initialize MediaConvert client with custom endpoint
mediaconvert_client = boto3.client(
    'mediaconvert',
    region_name=settings.AWS_REGION,
    aws_access_key_id=settings.AWS_ACCESS_KEY_ID,
    aws_secret_access_key=settings.AWS_SECRET_ACCESS_KEY,
    endpoint_url=settings.MEDIACONVERT_ENDPOINT
)

def get_s3_key_from_url(url):
    """Extract S3 key from a URL"""
    parsed_url = urlparse(url)
    path = parsed_url.path.lstrip('/')

    # If the URL is in the format https://bucket-name.s3.amazonaws.com/key
    if parsed_url.netloc.startswith(f"{settings.S3_BUCKET_NAME}.s3."):
        return path
    # If the URL is in the format https://s3.amazonaws.com/bucket-name/key
    elif parsed_url.netloc == "s3.amazonaws.com":
        return path.replace(f"{settings.S3_BUCKET_NAME}/", "", 1)
    else:
        logger.error(f"Unrecognized S3 URL format: {url}")
        return None

def get_job_status(job_id):
    """
    Get the status of a MediaConvert job

    Args:
        job_id: The ID of the MediaConvert job

    Returns:
        str: The status of the job (SUBMITTED, PROGRESSING, COMPLETE, ERROR, CANCELED)
    """
    try:
        response = mediaconvert_client.get_job(
            Id=job_id
        )

        status = response['Job']['Status']
        logger.info(f"MediaConvert job {job_id} status: {status}")

        return status
    except Exception as e:
        logger.error(f"Error getting MediaConvert job status: {str(e)}")
        return None

def create_hls_job(video_url, movie_id):
    """
    Create an AWS MediaConvert job to convert a video to HLS format

    Args:
        video_url: The S3 URL of the uploaded video
        movie_id: The ID of the movie

    Returns:
        dict: Job details including the job ID and output path
    """
    try:
        # Extract the S3 key from the video URL
        input_key = get_s3_key_from_url(video_url)
        if not input_key:
            logger.error(f"Failed to extract S3 key from URL: {video_url}")
            return None

        # Define output path
        output_path = f"movies/{movie_id}/hls/"

        # Define simplified job settings that we know work
        job_settings = {
            "Inputs": [
                {
                    "FileInput": f"s3://{settings.S3_BUCKET_NAME}/{input_key}",
                    "AudioSelectors": {
                        "Audio Selector 1": {
                            "DefaultSelection": "DEFAULT"
                        }
                    },
                    "VideoSelector": {},
                    "TimecodeSource": "EMBEDDED"
                }
            ],
            "OutputGroups": [
                {
                    "Name": "Apple HLS",
                    "OutputGroupSettings": {
                        "Type": "HLS_GROUP_SETTINGS",
                        "HlsGroupSettings": {
                            "SegmentLength": 6,
                            "MinSegmentLength": 0,
                            "Destination": f"s3://{settings.S3_OUTPUT_BUCKET}/{output_path}",
                            "SegmentControl": "SEGMENTED_FILES"
                        }
                    },
                    "Outputs": [
                        # 720p (HD) - Using only one output for simplicity
                        {
                            "NameModifier": "index",
                            "VideoDescription": {
                                "Width": 1280,
                                "Height": 720,
                                "CodecSettings": {
                                    "Codec": "H_264",
                                    "H264Settings": {
                                        "RateControlMode": "QVBR",
                                        "MaxBitrate": 3000000,
                                        "QvbrSettings": {
                                            "QvbrQualityLevel": 7
                                        }
                                    }
                                }
                            },
                            "AudioDescriptions": [
                                {
                                    "CodecSettings": {
                                        "Codec": "AAC",
                                        "AacSettings": {
                                            "Bitrate": 96000,
                                            "CodingMode": "CODING_MODE_2_0",
                                            "SampleRate": 48000
                                        }
                                    }
                                }
                            ],
                            "OutputSettings": {
                                "HlsSettings": {
                                    "SegmentModifier": "_segment"
                                }
                            },
                            "ContainerSettings": {
                                "Container": "M3U8",
                                "M3u8Settings": {}
                            }
                        }
                    ]
                }
            ]
        }

        # We're already using "index" as the name modifier, so no need to modify it here

        # Log job settings for debugging
        logger.info(f"Creating MediaConvert job for movie {movie_id} with settings:")
        logger.info(f"Input: s3://{settings.S3_BUCKET_NAME}/{input_key}")
        logger.info(f"Output: s3://{settings.S3_OUTPUT_BUCKET}/{output_path}")
        logger.info(f"Role ARN: {settings.MEDIACONVERT_ROLE_ARN}")

        # Create the job
        response = mediaconvert_client.create_job(
            Role=settings.MEDIACONVERT_ROLE_ARN,
            Settings=job_settings
        )

        job_id = response['Job']['Id']
        logger.info(f"Created MediaConvert job {job_id} for movie {movie_id}")

        # Construct the CloudFront URL for the master playlist
        cloudfront_url = f"https://{settings.CLOUDFRONT_DOMAIN}/{output_path}index.m3u8"

        return {
            "job_id": job_id,
            "status": response['Job']['Status'],
            "streaming_url": cloudfront_url
        }

    except Exception as e:
        logger.error(f"Error creating MediaConvert job: {str(e)}")
        return None

def get_job_status(job_id):
    """
    Get the status of a MediaConvert job

    Args:
        job_id: The ID of the MediaConvert job

    Returns:
        str: The status of the job
    """
    try:
        response = mediaconvert_client.get_job(Id=job_id)
        return response['Job']['Status']
    except Exception as e:
        logger.error(f"Error getting MediaConvert job status: {str(e)}")
        return "ERROR"
