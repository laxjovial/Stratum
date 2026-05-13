import uuid
from sqlalchemy import Column, String, DateTime, ForeignKey, JSON, func
from sqlalchemy.dialects.postgresql import UUID as pgUUID
from sqlalchemy.orm import relationship
from ..db.base import Base

class ActivityLog(Base):
    __tablename__ = "activity_logs"

    id = Column(pgUUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    organization_id = Column(pgUUID(as_uuid=True), ForeignKey("organizations.id"), nullable=False)
    user_id = Column(pgUUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    
    action = Column(String(255), nullable=False) # e.g. "UPLOAD_DOC", "CREATE_DEPT"
    details = Column(JSON, nullable=True) # Metadata about the action
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    organization = relationship("Organization")
    user = relationship("User")

    def __repr__(self):
        return f"<ActivityLog(user_id='{self.user_id}', action='{self.action}')>"
