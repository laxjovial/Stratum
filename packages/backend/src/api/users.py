from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
import uuid
from typing import List

from .. import schemas
from ..crud import user as crud_user
from ..db.database import get_db

router = APIRouter(
    prefix="/users",
    tags=["Users"],
    responses={404: {"description": "Not found"}},
)


@router.get("/", response_model=List[schemas.User])
def read_users(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
):
    users = crud_user.get_users(db, skip=skip, limit=limit)
    return users


@router.get("/{user_id}", response_model=schemas.User)
def read_user(user_id: uuid.UUID, db: Session = Depends(get_db)):
    db_user = crud_user.get_user(db, user_id=user_id)
    if db_user is None:
        raise HTTPException(status_code=404, detail="User not found")
    return db_user

# A more specific endpoint to get users for an organization would be better.
# This could be added later, for example: /organizations/{org_id}/users
# For now, the generic /users endpoint will suffice for the MVP structure.

# Endpoint to assign a role to a user would also go here.
# @router.put("/{user_id}/role", response_model=schemas.User)
# def assign_user_role(...):
#    ...
