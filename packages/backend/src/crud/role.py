from sqlalchemy.orm import Session
import uuid
from .. import models
from ..schemas.role import RoleCreate

def create_role(db: Session, role: RoleCreate, organization_id: uuid.UUID):
    db_role = models.Role(
        name=role.name,
        permissions=role.permissions,
        organization_id=organization_id
    )
    db.add(db_role)
    db.commit()
    db.refresh(db_role)
    return db_role

def get_role_by_name(db: Session, name: str, organization_id: uuid.UUID):
    return db.query(models.Role).filter(
        models.Role.name == name,
        models.Role.organization_id == organization_id
    ).first()

def assign_role_to_user(db: Session, user_id: uuid.UUID, role_id: uuid.UUID):
    db_user = db.query(models.User).filter(models.User.id == user_id).first()
    if db_user:
        db_user.role_id = role_id
        db.commit()
        db.refresh(db_user)
    return db_user
