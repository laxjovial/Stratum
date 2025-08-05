from sqlalchemy.orm import Session, joinedload
import uuid
from .. import models
from ..schemas import forum as forum_schemas

def create_thread(db: Session, thread: forum_schemas.ForumThreadCreate, author_id: uuid.UUID, organization_id: uuid.UUID):
    """
    Creates a new forum thread and its initial post in a single transaction.
    """
    # Create the thread first
    db_thread = models.ForumThread(
        title=thread.title,
        author_id=author_id,
        organization_id=organization_id,
        department_id=thread.department_id
    )
    db.add(db_thread)
    db.flush()  # Use flush to get the ID of the new thread before committing

    # Create the first post for the thread
    db_post = models.ForumPost(
        content=thread.first_post_content,
        thread_id=db_thread.id,
        author_id=author_id
    )
    db.add(db_post)
    db.commit()
    db.refresh(db_thread)
    return db_thread

def create_post(db: Session, post: forum_schemas.ForumPostCreate, thread_id: uuid.UUID, author_id: uuid.UUID):
    """
    Creates a new post (reply) in an existing thread.
    """
    db_post = models.ForumPost(
        content=post.content,
        thread_id=thread_id,
        author_id=author_id
    )
    db.add(db_post)
    db.commit()
    db.refresh(db_post)
    return db_post

def get_thread(db: Session, thread_id: uuid.UUID):
    """
    Retrieves a single thread and all its posts, using joined loading for efficiency.
    """
    return db.query(models.ForumThread).options(
        joinedload(models.ForumThread.posts)
    ).filter(models.ForumThread.id == thread_id).first()

def get_threads_by_organization(db: Session, organization_id: uuid.UUID, skip: int = 0, limit: int = 100):
    """
    Retrieves all threads for a given organization.
    In a real app, this would be further filtered by the user's department access.
    """
    return db.query(models.ForumThread).filter(
        models.ForumThread.organization_id == organization_id
    ).order_by(models.ForumThread.created_at.desc()).offset(skip).limit(limit).all()
