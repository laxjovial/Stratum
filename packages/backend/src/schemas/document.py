from pydantic import BaseModel
import uuid
from datetime import datetime
from typing import Optional
from ..models.document import DocumentStatus

class DocumentBase(BaseModel):
    file_name: str
    s3_path: str
    section: Optional[str] = "General"
    department_id: Optional[uuid.UUID] = None

class DocumentCreate(DocumentBase):
    organization_id: uuid.UUID
    uploader_id: uuid.UUID

class DocumentUpdate(BaseModel):
    status: Optional[DocumentStatus] = None
    section: Optional[str] = None
    department_id: Optional[uuid.UUID] = None

class Document(DocumentBase):
    id: uuid.UUID
    status: DocumentStatus
    uploaded_at: datetime
    organization_id: uuid.UUID
    uploader_id: uuid.UUID

    class Config:
        from_attributes = True
