from sqlalchemy.orm import Session
import uuid
from .. import models
from ..schemas.user import UserCreate

def get_user(db: Session, user_id: uuid.UUID):
    return db.query(models.User).filter(models.User.id == user_id).first()

def get_user_by_email(db: Session, email: str):
    return db.query(models.User).filter(models.User.email == email).first()

def get_user_by_firebase_uid(db: Session, firebase_uid: str):
    return db.query(models.User).filter(models.User.firebase_uid == firebase_uid).first()

def get_users(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.User).offset(skip).limit(limit).all()

def create_user(db: Session, user: UserCreate):
    db_user = models.User(
        email=user.email,
        firebase_uid=user.firebase_uid,
        organization_id=user.organization_id,
        full_name=user.full_name,
        role_id=user.role_id,
        department_id=user.department_id,
        manager_id=user.manager_id,
        status=user.status,
        is_root=user.is_root,
        onboarding_completed=user.onboarding_completed
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

def update_user(db: Session, user_id: uuid.UUID, update_data: dict):
    db_user = get_user(db, user_id)
    if db_user:
        for key, value in update_data.items():
            setattr(db_user, key, value)
        db.commit()
        db.refresh(db_user)
    return db_user

def get_user_by_token(db: Session, token: str):
    return db.query(models.User).filter(models.User.invitation_token == token).first()
