import uuid
from sqlalchemy import Column, String, DateTime, func, ForeignKey, Boolean
from sqlalchemy.dialects.postgresql import UUID as pgUUID
from sqlalchemy.orm import relationship

from ..db.base import Base
class User(Base):
    __tablename__ = "users"

    id = Column(pgUUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    firebase_uid = Column(String(255), nullable=True, unique=True, index=True)
    email = Column(String(255), nullable=False, unique=True, index=True)
    full_name = Column(String(255), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    organization_id = Column(pgUUID(as_uuid=True), ForeignKey("organizations.id"), nullable=False)
    organization = relationship("Organization", back_populates="users")

    role_id = Column(pgUUID(as_uuid=True), ForeignKey("roles.id"), nullable=True)
    role = relationship("Role", back_populates="users")

    # Hierarchy & Department
    department_id = Column(pgUUID(as_uuid=True), ForeignKey("departments.id"), nullable=True)
    manager_id = Column(pgUUID(as_uuid=True), ForeignKey("users.id"), nullable=True)
    
    # Status & Onboarding
    status = Column(String(50), nullable=False, server_default="active") # active, pending, revoked, deactivated
    invitation_token = Column(String(255), nullable=True, unique=True, index=True)
    invitation_expires_at = Column(DateTime(timezone=True), nullable=True)
    
    is_root = Column(Boolean, nullable=False, server_default="false") # True if they started the org/dept
    onboarding_completed = Column(Boolean, nullable=False, server_default="false")

    manager = relationship("User", remote_side=[id], back_populates="subordinates")
    subordinates = relationship("User", back_populates="manager")

    def __repr__(self):
        return f"<User(id={self.id}, email='{self.email}')>"
