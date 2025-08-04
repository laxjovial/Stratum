from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel

from .. import schemas
from ..crud import user as crud_user, organization as crud_organization
from ..db.database import get_db
from ..core.firebase import get_current_user

router = APIRouter(
    prefix="/setup",
    tags=["Onboarding Setup"],
    responses={404: {"description": "Not found"}},
)


class FirstUserSetupPayload(BaseModel):
    organization_name: str
    user_full_name: str | None = None


@router.post("/first-user", response_model=schemas.User)
def setup_first_user_and_organization(
    payload: FirstUserSetupPayload,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    """
    Handles the "First Run" experience for the very first user of an organization.
    This endpoint should be called once, immediately after signup.
    It transactionally creates the organization and the first user (owner/admin).
    """
    firebase_uid = current_user.get("uid")
    user_email = current_user.get("email")

    if not firebase_uid or not user_email:
        raise HTTPException(status_code=403, detail="Invalid Firebase token.")

    # 1. Check if user already exists in our DB
    if crud_user.get_user_by_firebase_uid(db, firebase_uid=firebase_uid):
        raise HTTPException(
            status_code=400, detail="This user account has already completed setup."
        )

    # 2. Create the organization
    org_create = schemas.OrganizationCreate(name=payload.organization_name)
    new_org = crud_organization.create_organization(db, organization=org_create)

    # 3. Create the user record
    user_create = schemas.UserCreate(
        firebase_uid=firebase_uid,
        email=user_email,
        full_name=payload.user_full_name,
        organization_id=new_org.id,
    )
    new_user = crud_user.create_user(db, user=user_create)

    # 4. TODO: Create a default "Admin" or "Owner" role for this organization
    # 5. TODO: Assign that role to this new user

    # The full user object is returned
    return new_user
