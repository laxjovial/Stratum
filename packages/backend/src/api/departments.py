from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
import uuid
from typing import List

from .. import schemas
from ..crud import department as crud_department
from ..db.database import get_db

router = APIRouter(
    prefix="/departments",
    tags=["Hierarchy & Departments"],
    responses={404: {"description": "Not found"}},
)


@router.post("/{organization_id}", response_model=schemas.Department)
def create_department_for_organization(
    organization_id: uuid.UUID,
    department: schemas.DepartmentCreate,
    db: Session = Depends(get_db),
):
    # In a real app, we'd verify the user has permission to do this in the specified org
    return crud_department.create_department(
        db=db, department=department, organization_id=organization_id
    )


@router.get("/{organization_id}", response_model=List[schemas.Department])
def read_departments_for_organization(
    organization_id: uuid.UUID, db: Session = Depends(get_db)
):
    # This returns a flat list. The frontend will be responsible for building the hierarchy view.
    departments = crud_department.get_departments_by_organization(
        db, organization_id=organization_id
    )
    return departments


@router.put("/{department_id}", response_model=schemas.Department)
def update_department(
    department_id: uuid.UUID,
    department: schemas.DepartmentUpdate,
    db: Session = Depends(get_db),
):
    db_department = crud_department.update_department(
        db, department_id=department_id, department=department
    )
    if db_department is None:
        raise HTTPException(status_code=404, detail="Department not found")
    return db_department
