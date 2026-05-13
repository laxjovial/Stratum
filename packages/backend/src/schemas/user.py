from pydantic import BaseModel, EmailStr
import uuid
from datetime import datetime

# Shared properties
class UserBase(BaseModel):
    email: EmailStr | None = None
    full_name: str | None = None
    status: str | None = "active"
    is_root: bool = False
    onboarding_completed: bool = False

# Properties to receive on item creation
class UserCreate(UserBase):
    email: EmailStr
    firebase_uid: str | None = None # Nullable for invitations
    organization_id: uuid.UUID
    full_name: str | None = None
    role_id: uuid.UUID | None = None
    department_id: uuid.UUID | None = None
    manager_id: uuid.UUID | None = None

# Properties to receive on item update
class UserUpdate(UserBase):
    role_id: uuid.UUID | None = None
    department_id: uuid.UUID | None = None
    manager_id: uuid.UUID | None = None

class UserInvitation(BaseModel):
    email: EmailStr
    role_id: uuid.UUID
    department_id: uuid.UUID | None = None
    manager_id: uuid.UUID | None = None
    expires_in_hours: int = 48

class UserClaim(BaseModel):
    token: str
    firebase_uid: str
    full_name: str


# Properties shared by models stored in DB
class UserInDBBase(UserBase):
    id: uuid.UUID
    firebase_uid: str | None = None
    organization_id: uuid.UUID
    role_id: uuid.UUID | None = None
    department_id: uuid.UUID | None = None
    manager_id: uuid.UUID | None = None
    created_at: datetime

    class Config:
        from_attributes = True


# Properties to return to client
class User(UserInDBBase):
    pass


# Properties stored in DB
class UserInDB(UserInDBBase):
    pass
