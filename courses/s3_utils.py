import boto3
import uuid
from django.conf import settings


ALLOWED_VIDEO_TYPES = {
    'video/mp4': 'mp4',
    'video/webm': 'webm',
    'video/quicktime': 'mov',
    'video/x-msvideo': 'avi',
}


def generate_presigned_upload_url(file_name: str, file_type: str):
    """
    Generate a presigned PUT URL so the frontend can upload directly to S3.
    Returns (presigned_url, s3_key) or raises ValueError on bad file type.
    """
    if file_type not in ALLOWED_VIDEO_TYPES:
        raise ValueError(f"Unsupported file type: {file_type}")

    extension = ALLOWED_VIDEO_TYPES[file_type]
    s3_key = f"videos/pending/{uuid.uuid4()}.{extension}"

    client = boto3.client(
        's3',
        aws_access_key_id=settings.AWS_ACCESS_KEY_ID,
        aws_secret_access_key=settings.AWS_SECRET_ACCESS_KEY,
        region_name=settings.AWS_S3_REGION_NAME,
    )

    presigned_url = client.generate_presigned_url(
        'put_object',
        Params={
            'Bucket': settings.AWS_STORAGE_BUCKET_NAME,
            'Key': s3_key,
            'ContentType': file_type,
        },
        ExpiresIn=3600,  # 1 hour
    )

    return presigned_url, s3_key


def generate_presigned_view_url(s3_key: str, expires_in: int = 3600):
    """
    Generate a short-lived presigned GET URL so students can stream a private video.
    """
    client = boto3.client(
        's3',
        aws_access_key_id=settings.AWS_ACCESS_KEY_ID,
        aws_secret_access_key=settings.AWS_SECRET_ACCESS_KEY,
        region_name=settings.AWS_S3_REGION_NAME,
    )

    return client.generate_presigned_url(
        'get_object',
        Params={
            'Bucket': settings.AWS_STORAGE_BUCKET_NAME,
            'Key': s3_key,
        },
        ExpiresIn=expires_in,
    )
