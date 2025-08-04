from sqlalchemy.orm import Session
import uuid
from .. import models
from ..schemas.department import DepartmentCreate, DepartmentUpdate

def get_department(db: Session, department_id: uuid.UUID):
    return db.query(models.Department).filter(models.Department.id == department_id).first()

def get_departments_by_organization(db: Session, organization_id: uuid.UUID):
    # This will fetch all departments for an org, which can then be structured into a hierarchy
    return db.query(models.Department).filter(models.Department.organization_id == organization_id).all()

def create_department(db: Session, department: DepartmentCreate, organization_id: uuid.UUID):
    db_department = models.Department(
        name=department.name,
        parent_department_id=department.parent_department_id,
        organization_id=organization_id
    )
    db.add(db_department)
    db.commit()
    db.refresh(db_department)
    return db_department

def update_department(db: Session, department_id: uuid.UUID, department: DepartmentUpdate):
    db_dept = get_department(db, department_id)
    if db_dept:
        update_data = department.model_dump(exclude_unset=True)
        for key, value in update_data.items():
            setattr(db_dept, key, value)
        db.commit()
        db.refresh(db_dept)
    return db_dept

def delete_department(db: Session, department_id: uuid.UUID):
    db_dept = get_department(db, department_id)
    if db_dept:
        db.delete(db_dept)
        db.commit()
    return db_dept
