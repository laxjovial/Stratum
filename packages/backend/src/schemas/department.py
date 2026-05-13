from __future__ import annotations
from pydantic import BaseModel
import uuid
from typing import List, Optional

# Shared properties
class DepartmentBase(BaseModel):
    name: Optional[str] = None
    parent_department_id: Optional[uuid.UUID] = None
    head_id: Optional[uuid.UUID] = None

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
Department.model_rebuild()
