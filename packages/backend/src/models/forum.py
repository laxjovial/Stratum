import uuid
from sqlalchemy import Column, String, Text, DateTime, func, ForeignKey
from sqlalchemy.dialects.postgresql import UUID as pgUUID
from sqlalchemy.orm import relationship
from packages.backend.src.db.base import Base

class ForumThread(Base):
    __tablename__ = "forum_threads"

    id = Column(pgUUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    title = Column(String(255), nullable=False, index=True)

    organization_id = Column(pgUUID(as_uuid=True), ForeignKey("organizations.id"), nullable=False)
    author_id = Column(pgUUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    department_id = Column(pgUUID(as_uuid=True), ForeignKey("departments.id"), nullable=True) # For scoping to departments

    created_at = Column(DateTime(timezone=True), server_default=func.now())

    posts = relationship("ForumPost", back_populates="thread", cascade="all, delete-orphan", order_by="ForumPost.created_at")

    def __repr__(self):
        return f"<ForumThread(id={self.id}, title='{self.title}')>"

class ForumPost(Base):
    __tablename__ = "forum_posts"

    id = Column(pgUUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    content = Column(Text, nullable=False)

    thread_id = Column(pgUUID(as_uuid=True), ForeignKey("forum_threads.id"), nullable=False)
    author_id = Column(pgUUID(as_uuid=True), ForeignKey("users.id"), nullable=False)

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    thread = relationship("ForumThread", back_populates="posts")

    def __repr__(self):
        return f"<ForumPost(id={self.id}, thread_id='{self.thread_id}')>"
