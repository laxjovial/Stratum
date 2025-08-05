from pydantic import BaseModel

class PresignedUrl(BaseModel):
    url: str
    fields: dict

class S3UploadWebhookPayload(BaseModel):
    # This is a simplified model. A real S3 event notification is more complex.
    # It's typically nested inside an "Records" array.
    s3_key: str
    s3_bucket: str
