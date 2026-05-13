from pydantic import BaseModel
from typing import Optional, Dict

class PresignedUrl(BaseModel):
    url: str
    fields: Optional[Dict] = None
    provider: str # 's3' or 'supabase'
    token: Optional[str] = None # For supabase direct upload if needed

class S3UploadWebhookPayload(BaseModel):
    s3_key: str
    s3_bucket: str
    provider: str = 's3'
