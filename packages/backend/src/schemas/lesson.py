from pydantic import BaseModel
import uuid
from datetime import datetime

class LessonBase(BaseModel):
    title: str
    content: str | None = None

class LessonCreate(LessonBase):
    pass

class LessonUpdate(LessonBase):
    pass

class Lesson(LessonBase):
    id: uuid.UUID
    organization_id: uuid.UUID
    author_id: uuid.UUID
    created_at: datetime
    updated_at: datetime | None = None

    class Config:
        from_attributes = True
