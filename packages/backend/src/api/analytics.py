from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func
import uuid

from .. import models
from ..db.database import get_db
from ..core.firebase import get_current_user

router = APIRouter(
    prefix="/analytics",
    tags=["Analytics"],
    dependencies=[Depends(get_current_user)],
)

@router.get("/summary/{organization_id}")
def get_analytics_summary(organization_id: uuid.UUID, db: Session = Depends(get_db)):
    """
    Provides a summary of key metrics for an organization.
    In a real-world scenario, you would add permission checks to ensure
    the requesting user is an admin of the specified organization.
    """

    # Query for the number of users in the organization
    user_count = db.query(func.count(models.User.id)).filter(
        models.User.organization_id == organization_id
    ).scalar()

    # Query for the number of documents
    document_count = db.query(func.count(models.Document.id)).filter(
        models.Document.organization_id == organization_id
    ).scalar()

    # Query for the number of forum threads
    thread_count = db.query(func.count(models.ForumThread.id)).filter(
        models.ForumThread.organization_id == organization_id
    ).scalar()

    # Query for the number of lessons
    lesson_count = db.query(func.count(models.Lesson.id)).filter(
        models.Lesson.organization_id == organization_id
    ).scalar()

    return {
        "user_count": user_count,
        "document_count": document_count,
        "thread_count": thread_count,
        "lesson_count": lesson_count,
    }
