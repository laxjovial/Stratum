from __future__ import annotations
from pydantic import BaseModel
import uuid
from typing import List

# Shared properties
class DepartmentBase(BaseModel):
    name: str | None = None
    parent_department_id: uuid.UUID | None = None

# Properties to receive on item creation
class DepartmentCreate(DepartmentBase):
    name: str

# Properties to receive on item update
class DepartmentUpdate(DepartmentBase):
    pass

# Properties shared by models stored in DB
class DepartmentInDBBase(DepartmentBase):
    id: uuid.UUID
    organization_id: uuid.UUID

    class Config:
        from_attributes = True

# Properties to return to client
class Department(DepartmentInDBBase):
    children: List[Department] = []

# Properties stored in DB
class DepartmentInDB(DepartmentInDBBase):
    pass

# This allows Pydantic to process the forward reference to `Department`
# within the `Department` model itself.
Department.model_rebuild()
