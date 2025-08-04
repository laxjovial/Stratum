from sqlalchemy.orm import Session
import uuid
from .. import models
from ..schemas.organization import OrganizationCreate, OrganizationUpdate

def get_organization(db: Session, org_id: uuid.UUID):
    return db.query(models.Organization).filter(models.Organization.id == org_id).first()

def get_organizations(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.Organization).offset(skip).limit(limit).all()

def create_organization(db: Session, organization: OrganizationCreate):
    db_organization = models.Organization(name=organization.name)
    db.add(db_organization)
    db.commit()
    db.refresh(db_organization)
    return db_organization

def update_organization(db: Session, org_id: uuid.UUID, organization: OrganizationUpdate):
    db_org = get_organization(db, org_id)
    if db_org:
        update_data = organization.model_dump(exclude_unset=True)
        for key, value in update_data.items():
            setattr(db_org, key, value)
        db.commit()
        db.refresh(db_org)
    return db_org

def delete_organization(db: Session, org_id: uuid.UUID):
    db_org = get_organization(db, org_id)
    if db_org:
        db.delete(db_org)
        db.commit()
    return db_org
