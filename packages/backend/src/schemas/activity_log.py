from pydantic import BaseModel
import uuid
from datetime import datetime
from typing import Any, Dict

class ActivityLogBase(BaseModel):
    action: str
    details: Dict[str, Any] | None = None

class ActivityLogCreate(ActivityLogBase):
    organization_id: uuid.UUID
    user_id: uuid.UUID

class ActivityLog(ActivityLogBase):
    id: uuid.UUID
    organization_id: uuid.UUID
    user_id: uuid.UUID
    created_at: datetime

    class Config:
        from_attributes = True
