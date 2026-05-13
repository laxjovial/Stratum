from pydantic import BaseModel
import uuid
from datetime import datetime
from typing import Optional

class LessonBase(BaseModel):
    title: str
    content: Optional[str] = None
    target_department_id: Optional[uuid.UUID] = None

class LessonCreate(LessonBase):
    pass

class LessonUpdate(BaseModel):
    title: Optional[str] = None
    content: Optional[str] = None
    target_department_id: Optional[uuid.UUID] = None

class Lesson(LessonBase):
    id: uuid.UUID
    organization_id: uuid.UUID
    author_id: uuid.UUID
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class LessonGenerateRequest(BaseModel):
    title: str
    target_department_id: Optional[uuid.UUID] = None
    document_ids: Optional[list[uuid.UUID]] = None
    topic: str
