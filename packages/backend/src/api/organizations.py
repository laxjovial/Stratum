from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
import uuid
from typing import List

from .. import schemas
from ..crud import user as crud_user, organization as crud_organization
from ..db.database import get_db
from ..core.auth import get_current_user

router = APIRouter(
    prefix="/organizations",
    tags=["Organizations"],
    dependencies=[Depends(get_current_user)], # Protect all routes in this router
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
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """
    Returns only the organization the user belongs to.
    """
    db_user = crud_user.get_user_by_firebase_uid(db, firebase_uid=current_user["uid"])
    if not db_user or not db_user.organization_id:
        return []
    
    org = crud_organization.get_organization(db, org_id=db_user.organization_id)
    return [org] if org else []


@router.get("/{org_id}", response_model=schemas.Organization)
def read_organization(
    org_id: uuid.UUID, 
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    db_user = crud_user.get_user_by_firebase_uid(db, firebase_uid=current_user["uid"])
    if db_user.organization_id != org_id:
        raise HTTPException(status_code=403, detail="You do not have access to this organization.")

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
@router.get("/{org_id}/roles", response_model=List[schemas.Role])
def read_organization_roles(
    org_id: uuid.UUID, 
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    db_user = crud_user.get_user_by_firebase_uid(db, firebase_uid=current_user["uid"])
    if db_user.organization_id != org_id:
        raise HTTPException(status_code=403, detail="Access denied to external organization roles.")

    from ..crud import role as crud_role
    return crud_role.get_roles_by_organization(db, organization_id=org_id)
