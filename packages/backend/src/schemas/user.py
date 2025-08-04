from pydantic import BaseModel, EmailStr
import uuid
from datetime import datetime

# Shared properties
class UserBase(BaseModel):
    email: EmailStr | None = None
    full_name: str | None = None

# Properties to receive on item creation
class UserCreate(UserBase):
    email: EmailStr
    firebase_uid: str
    organization_id: uuid.UUID
    full_name: str | None = None


# Properties to receive on item update
class UserUpdate(UserBase):
    pass


# Properties shared by models stored in DB
class UserInDBBase(UserBase):
    id: uuid.UUID
    firebase_uid: str
    organization_id: uuid.UUID
    role_id: uuid.UUID | None = None
    created_at: datetime

    class Config:
        from_attributes = True


# Properties to return to client
class User(UserInDBBase):
    pass


# Properties stored in DB
class UserInDB(UserInDBBase):
    pass
