from sqlalchemy.orm import Session
import uuid
from .. import models
from ..schemas.lesson import LessonCreate, LessonUpdate

def create_lesson(db: Session, lesson: LessonCreate, author_id: uuid.UUID, organization_id: uuid.UUID):
    db_lesson = models.Lesson(
        **lesson.model_dump(),
        author_id=author_id,
        organization_id=organization_id
    )
    db.add(db_lesson)
    db.commit()
    db.refresh(db_lesson)
    return db_lesson

def get_lesson(db: Session, lesson_id: uuid.UUID):
    return db.query(models.Lesson).filter(models.Lesson.id == lesson_id).first()

def get_lessons_by_organization(db: Session, organization_id: uuid.UUID, skip: int = 0, limit: int = 100):
    return db.query(models.Lesson).filter(
        models.Lesson.organization_id == organization_id
    ).offset(skip).limit(limit).all()

def update_lesson(db: Session, lesson_id: uuid.UUID, lesson: LessonUpdate):
    db_lesson = get_lesson(db, lesson_id)
    if db_lesson:
        update_data = lesson.model_dump(exclude_unset=True)
        for key, value in update_data.items():
            setattr(db_lesson, key, value)
        db.commit()
        db.refresh(db_lesson)
    return db_lesson

def delete_lesson(db: Session, lesson_id: uuid.UUID):
    db_lesson = get_lesson(db, lesson_id)
    if db_lesson:
        db.delete(db_lesson)
        db.commit()
    return db_lesson
