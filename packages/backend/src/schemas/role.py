from pydantic import BaseModel
import uuid
from typing import Any

# Shared properties
class RoleBase(BaseModel):
    name: str | None = None
    permissions: dict[str, Any] | None = None

# Properties to receive on item creation
class RoleCreate(RoleBase):
    name: str

# Properties to receive on item update
class RoleUpdate(RoleBase):
    pass

# Properties shared by models stored in DB
class RoleInDBBase(RoleBase):
    id: uuid.UUID
    organization_id: uuid.UUID

    class Config:
        from_attributes = True

# Properties to return to client
class Role(RoleInDBBase):
    pass

# Properties stored in DB
class RoleInDB(RoleInDBBase):
    pass
