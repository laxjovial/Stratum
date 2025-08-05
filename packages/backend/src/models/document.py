import uuid
import enum
from sqlalchemy import Column, String, DateTime, func, ForeignKey, Enum as pgEnum
from sqlalchemy.dialects.postgresql import UUID as pgUUID
from .base import Base

class DocumentStatus(str, enum.Enum):
    PENDING = "PENDING"
    PROCESSING = "PROCESSING"
    COMPLETED = "COMPLETED"
    FAILED = "FAILED"

class Document(Base):
    __tablename__ = "documents"

    id = Column(pgUUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    file_name = Column(String(255), nullable=False)
    s3_path = Column(String(1024), nullable=False, unique=True)
    status = Column(pgEnum(DocumentStatus, name="document_status_enum"), nullable=False, default=DocumentStatus.PENDING)

    organization_id = Column(pgUUID(as_uuid=True), ForeignKey("organizations.id"), nullable=False)
    uploader_id = Column(pgUUID(as_uuid=True), ForeignKey("users.id"), nullable=False)

    uploaded_at = Column(DateTime(timezone=True), server_default=func.now())

    def __repr__(self):
        return f"<Document(id={self.id}, name='{self.file_name}', status='{self.status}')>"
