import uuid
from sqlalchemy import Column, String, ForeignKey
from sqlalchemy.dialects.postgresql import UUID as pgUUID
from sqlalchemy.orm import relationship

from ..db.base import Base

class Department(Base):
    __tablename__ = "departments"

    id = Column(pgUUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(255), nullable=False)

    organization_id = Column(pgUUID(as_uuid=True), ForeignKey("organizations.id"), nullable=False)
    organization = relationship("Organization", back_populates="departments")

    parent_department_id = Column(pgUUID(as_uuid=True), ForeignKey("departments.id"), nullable=True)
    parent = relationship("Department", remote_side=[id], back_populates="children")
    children = relationship("Department", back_populates="parent")

    def __repr__(self):
        return f"<Department(id={self.id}, name='{self.name}')>"
