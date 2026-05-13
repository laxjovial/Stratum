from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from .. import schemas
from ..crud import user as crud_user
from ..db.database import get_db
from ..core.auth import get_current_user

router = APIRouter(
    prefix="/auth",
    tags=["Authentication"],
    responses={404: {"description": "Not found"}},
)

@router.post("/register", response_model=schemas.User)
def register_user(
    user_in: schemas.UserCreate,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    """
    Register a new user in the database after they have signed up with Firebase/Supabase.
    """
    if current_user["uid"] != user_in.firebase_uid:
        raise HTTPException(
            status_code=403, detail="Authenticated user does not match registration request."
        )

    db_user = crud_user.get_user_by_firebase_uid(db, firebase_uid=user_in.firebase_uid)
    if db_user:
        raise HTTPException(status_code=400, detail="User already registered in our database.")

    return crud_user.create_user(db=db, user=user_in)

@router.get("/me", response_model=schemas.User)
def get_me(
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    """
    Get the currently authenticated user's profile from the database.
    """
    db_user = crud_user.get_user_by_firebase_uid(db, firebase_uid=current_user["uid"])
    if not db_user:
        raise HTTPException(status_code=404, detail="User profile not found in database.")
    return db_user
