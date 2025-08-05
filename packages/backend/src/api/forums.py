from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
import uuid
from typing import List

from .. import schemas
from ..crud import forum as crud_forum, user as crud_user
from ..db.database import get_db
from ..core.firebase import get_current_user

router = APIRouter(
    prefix="/forums",
    tags=["Forums"],
    dependencies=[Depends(get_current_user)],
)

@router.post("/threads", response_model=schemas.ForumThread)
def create_new_thread(
    thread: schemas.ForumThreadCreate,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    db_user = crud_user.get_user_by_firebase_uid(db, firebase_uid=current_user["uid"])
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")

    # TODO: Add permission check to ensure user can post in the specified department_id

    return crud_forum.create_thread(
        db=db, thread=thread, author_id=db_user.id, organization_id=db_user.organization_id
    )

@router.get("/threads/{thread_id}", response_model=schemas.ForumThread)
def read_thread(thread_id: uuid.UUID, db: Session = Depends(get_db)):
    db_thread = crud_forum.get_thread(db, thread_id=thread_id)
    if db_thread is None:
        raise HTTPException(status_code=404, detail="Thread not found")
    # TODO: Add permission check to ensure user can view this thread
    return db_thread

@router.post("/posts/{thread_id}", response_model=schemas.ForumPost)
def create_new_post(
    thread_id: uuid.UUID,
    post: schemas.ForumPostCreate,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    db_user = crud_user.get_user_by_firebase_uid(db, firebase_uid=current_user["uid"])
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")

    # TODO: Add permission check here too

    return crud_forum.create_post(
        db=db, post=post, thread_id=thread_id, author_id=db_user.id
    )

@router.get("/organization/{org_id}/threads", response_model=List[schemas.ForumThread])
def read_threads_for_organization(
    org_id: uuid.UUID,
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
):
    # This is a simplified listing. A real implementation would filter based on
    # the requesting user's department memberships.
    return crud_forum.get_threads_by_organization(
        db, organization_id=org_id, skip=skip, limit=limit
    )
