from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
import uuid
from typing import List

from .. import schemas
from ..crud import lesson as crud_lesson
from ..db.database import get_db
from ..core.firebase import get_current_user

router = APIRouter(
    prefix="/lessons",
    tags=["Lessons"],
    dependencies=[Depends(get_current_user)],
)

@router.post("/", response_model=schemas.Lesson)
def create_lesson(
    lesson: schemas.LessonCreate,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    # In a real app, we'd get the user's org_id from our DB
    # For now, we'll require it to be part of the request or use a placeholder
    # Let's assume we can get it from the user object for now
    # user_id = current_user['uid'] -> need to map to our internal user id
    # organization_id = ...
    # This part needs more robust logic to map firebase UID to our internal user and org IDs

    # Placeholder IDs for now
    author_id = uuid.uuid4()
    organization_id = uuid.uuid4()

    return crud_lesson.create_lesson(
        db=db, lesson=lesson, author_id=author_id, organization_id=organization_id
    )

@router.get("/{lesson_id}", response_model=schemas.Lesson)
def read_lesson(lesson_id: uuid.UUID, db: Session = Depends(get_db)):
    db_lesson = crud_lesson.get_lesson(db, lesson_id=lesson_id)
    if db_lesson is None:
        raise HTTPException(status_code=404, detail="Lesson not found")
    return db_lesson

@router.get("/organization/{org_id}", response_model=List[schemas.Lesson])
def read_lessons_for_organization(
    org_id: uuid.UUID,
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
):
    return crud_lesson.get_lessons_by_organization(
        db, organization_id=org_id, skip=skip, limit=limit
    )
