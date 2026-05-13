from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
import uuid

from .. import schemas, models
from ..db.database import get_db
from ..core.auth import get_current_user
from ..crud import user as crud_user

router = APIRouter(
    prefix="/activity",
    tags=["Activity Logs"],
)

@router.get("/logs", response_model=List[schemas.ActivityLog])
def get_activity_logs(
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """
    Fetch activity logs for the user's organization.
    """
    db_user = crud_user.get_user_by_firebase_uid(db, firebase_uid=current_user["uid"])
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")
    
    if not db_user.organization_id:
        return []

    # In a real app, you might want to restrict this to admins
    logs = db.query(models.ActivityLog).filter(
        models.ActivityLog.organization_id == db_user.organization_id
    ).order_by(models.ActivityLog.created_at.desc()).limit(100).all()
    
    return logs

# Utility function to log activity (to be used across the app)
def log_activity(
    db: Session,
    organization_id: uuid.UUID,
    user_id: uuid.UUID,
    action: str,
    details: dict = None
):
    new_log = models.ActivityLog(
        organization_id=organization_id,
        user_id=user_id,
        action=action,
        details=details
    )
    db.add(new_log)
    db.commit()
    db.refresh(new_log)
    return new_log
