from pydantic import BaseModel
import uuid
from datetime import datetime

# Shared properties
class OrganizationBase(BaseModel):
    name: str | None = None

# Properties to receive on item creation
class OrganizationCreate(OrganizationBase):
    name: str

# Properties to receive on item update
class OrganizationUpdate(OrganizationBase):
    pass

# Properties shared by models stored in DB
class OrganizationInDBBase(OrganizationBase):
    id: uuid.UUID
    created_at: datetime

    class Config:
        from_attributes = True

# Properties to return to client
class Organization(OrganizationInDBBase):
    pass

# Properties stored in DB
class OrganizationInDB(OrganizationInDBBase):
    pass
