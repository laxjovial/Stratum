from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
import uuid
from typing import List

from .. import schemas, models
from ..crud import department as crud_department
from ..db.database import get_db
from ..core.auth import get_current_user
from ..crud import user as crud_user
from ..core.hierarchy import can_manage_department
from .activity import log_activity

router = APIRouter(
    prefix="/departments",
    tags=["Hierarchy & Departments"],
)

@router.post("/{organization_id}", response_model=schemas.Department)
def create_department(
    organization_id: uuid.UUID,
    department: schemas.DepartmentCreate,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    db_user = crud_user.get_user_by_firebase_uid(db, firebase_uid=current_user["uid"])
    
    # Only Org Head or Higher Management can create departments
    # For now, we'll allow anyone with an organization_id, 
    # but in a real app, you'd check if db_user is the Org Head.
    
    new_dept = crud_department.create_department(
        db=db, department=department, organization_id=organization_id
    )
    
    log_activity(db, organization_id=organization_id, user_id=db_user.id, action="CREATE_DEPT", details={"name": new_dept.name})
    return new_dept

@router.get("/{organization_id}", response_model=List[schemas.Department])
def read_departments(organization_id: uuid.UUID, db: Session = Depends(get_db)):
    return crud_department.get_departments_by_organization(db, organization_id=organization_id)

@router.patch("/{department_id}", response_model=schemas.Department)
def update_department(
    department_id: uuid.UUID,
    update: schemas.DepartmentUpdate,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    db_user = crud_user.get_user_by_firebase_uid(db, firebase_uid=current_user["uid"])
    
    # Priority Control: Only the head of the department or its superiors can edit
    if not can_manage_department(db, db_user.id, department_id):
        raise HTTPException(status_code=403, detail="Superior priority required to manage this department")

    db_dept = db.query(models.Department).filter(models.Department.id == department_id).first()
    if not db_dept:
        raise HTTPException(status_code=404, detail="Department not found")

    for key, value in update.model_dump(exclude_unset=True).items():
        setattr(db_dept, key, value)
        
    db.commit()
    db.refresh(db_dept)
    return db_dept

@router.delete("/{department_id}")
def delete_department(
    department_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    db_user = crud_user.get_user_by_firebase_uid(db, firebase_uid=current_user["uid"])
    
    if not can_manage_department(db, db_user.id, department_id):
        raise HTTPException(status_code=403, detail="Superior priority required to delete this department")

    db_dept = db.query(models.Department).filter(models.Department.id == department_id).first()
    if not db_dept:
        raise HTTPException(status_code=404, detail="Department not found")
        
    org_id = db_dept.organization_id
    db.delete(db_dept)
    db.commit()
    
    log_activity(db, organization_id=org_id, user_id=db_user.id, action="DELETE_DEPT", details={"name": db_dept.name})
    return {"message": "Department deleted"}
