from pydantic import BaseModel
import uuid
from datetime import datetime
from typing import List
from .user import User

# --- ForumPost Schemas ---

class ForumPostBase(BaseModel):
    content: str

class ForumPostCreate(ForumPostBase):
    pass

class ForumPostInDB(ForumPostBase):
    id: uuid.UUID
    thread_id: uuid.UUID
    author_id: uuid.UUID
    created_at: datetime

    class Config:
        from_attributes = True

class ForumPost(ForumPostInDB):
    # We might want to populate author details later
    # author: User
    pass


# --- ForumThread Schemas ---

class ForumThreadBase(BaseModel):
    title: str

class ForumThreadCreate(ForumThreadBase):
    # The first post's content is required to create a thread
    first_post_content: str
    department_id: uuid.UUID | None = None

class ForumThreadInDB(ForumThreadBase):
    id: uuid.UUID
    organization_id: uuid.UUID
    author_id: uuid.UUID
    department_id: uuid.UUID | None
    created_at: datetime

    class Config:
        from_attributes = True

class ForumThread(ForumThreadInDB):
    # We will populate these fields in the API router
    # author: User
    posts: List[ForumPost] = []
    pass
