from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
import uuid
from typing import List

from .. import schemas
from ..crud import organization as crud_organization
from ..db.database import get_db
# from ..core.firebase import get_current_user # To be used later for protection

router = APIRouter(
    prefix="/organizations",
    tags=["Organizations"],
    # dependencies=[Depends(get_current_user)], # Protect all routes in this router
    responses={404: {"description": "Not found"}},
)

@router.post("/", response_model=schemas.Organization)
def create_organization(
    organization: schemas.OrganizationCreate, db: Session = Depends(get_db)
):
    # In a real app, we'd check if an org with this name already exists
    return crud_organization.create_organization(db=db, organization=organization)


@router.get("/", response_model=List[schemas.Organization])
def read_organizations(
    skip: int = 0, limit: int = 100, db: Session = Depends(get_db)
):
    organizations = crud_organization.get_organizations(db, skip=skip, limit=limit)
    return organizations


@router.get("/{org_id}", response_model=schemas.Organization)
def read_organization(org_id: uuid.UUID, db: Session = Depends(get_db)):
    db_organization = crud_organization.get_organization(db, org_id=org_id)
    if db_organization is None:
        raise HTTPException(status_code=404, detail="Organization not found")
    return db_organization


@router.put("/{org_id}", response_model=schemas.Organization)
def update_organization(
    org_id: uuid.UUID,
    organization: schemas.OrganizationUpdate,
    db: Session = Depends(get_db),
):
    db_organization = crud_organization.update_organization(
        db, org_id=org_id, organization=organization
    )
    if db_organization is None:
        raise HTTPException(status_code=404, detail="Organization not found")
    return db_organization
