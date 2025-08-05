from pydantic import BaseModel
import uuid
from datetime import datetime
from ..models.document import DocumentStatus

class DocumentBase(BaseModel):
    file_name: str
    s3_path: str

class DocumentCreate(DocumentBase):
    organization_id: uuid.UUID
    uploader_id: uuid.UUID

class DocumentUpdate(BaseModel):
    status: DocumentStatus

class Document(DocumentBase):
    id: uuid.UUID
    status: DocumentStatus
    uploaded_at: datetime
    organization_id: uuid.UUID
    uploader_id: uuid.UUID

    class Config:
        from_attributes = True
