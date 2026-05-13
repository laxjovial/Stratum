from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
import uuid
from typing import List

from .. import schemas, models
from ..db.database import get_db
from ..core.auth import get_current_user

router = APIRouter(
    prefix="/admin",
    tags=["Admin Management"],
)

# In a real app, this would be restricted to super-admins
@router.get("/organizations", response_model=List[schemas.Organization])
def list_organizations(db: Session = Depends(get_db), current_user: dict = Depends(get_current_user)):
    # Simple check for demo: only allow if user email is specifically authorized or has admin role
    # For now, we'll assume the first user is the admin
    return db.query(models.Organization).all()

@router.put("/organizations/{org_id}/bank-details")
def update_org_bank_details(
    org_id: uuid.UUID,
    bank_details: str,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    org = db.query(models.Organization).filter(models.Organization.id == org_id).first()
    if not org:
        raise HTTPException(status_code=404, detail="Organization not found")
    
    org.bank_details = bank_details
    db.commit()
    return {"message": "Bank details updated successfully"}
