from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
import uuid
from typing import List, Optional
import secrets
from datetime import datetime, timedelta

from .. import schemas, models
from ..crud import user as crud_user
from ..db.database import get_db
from ..core.auth import get_current_user
from ..core.hierarchy import check_role_permission, raise_superior_priority_error

router = APIRouter(
    prefix="/users",
    tags=["Organizational Web & Users"],
)

@router.get("/me", response_model=schemas.User)
def get_my_profile(
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    db_user = crud_user.get_user_by_firebase_uid(db, firebase_uid=current_user["uid"])
    if not db_user:
        raise HTTPException(status_code=404, detail="Profile not initialized")
    return db_user

@router.get("/network", response_model=List[schemas.User])
def get_my_network(
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """
    Returns a list of all users 'under' the current user in the hierarchy (direct and indirect subordinates).
    This forms the foundation of the organizational 'web' view.
    """
    me = crud_user.get_user_by_firebase_uid(db, firebase_uid=current_user["uid"])
    
    # Simple recursive fetch of subordinates
    network = []
    to_process = [me.id]
    processed = set()
    
    while to_process:
        current_id = to_process.pop()
        if current_id in processed: continue
        processed.add(current_id)
        
        subs = db.query(models.User).filter(models.User.manager_id == current_id).all()
        for s in subs:
            if s.id != me.id:
                network.append(s)
                to_process.append(s.id)
                
    return network

@router.post("/invite", response_model=schemas.User)
def invite_member(
    invite_data: schemas.UserInvitation,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """
    Generates a secure Stratum Key and pre-registers a staff seat.
    """
    me = crud_user.get_user_by_firebase_uid(db, firebase_uid=current_user["uid"])
    
    if not check_role_permission(me, "manage_members"):
        raise HTTPException(status_code=403, detail="Your role does not have 'manage_members' clearance.")

    # 1. Check if email already invited
    existing = crud_user.get_user_by_email(db, email=invite_data.email)
    if existing:
        raise HTTPException(status_code=400, detail="This email is already registered or invited.")

    # 2. Generate Token
    token = secrets.token_urlsafe(32)
    expiry = datetime.now() + timedelta(hours=invite_data.expires_in_hours)

    # 3. Create Pending User
    new_user = models.User(
        email=invite_data.email,
        organization_id=me.organization_id,
        role_id=invite_data.role_id,
        department_id=invite_data.department_id,
        manager_id=invite_data.manager_id,
        status="pending",
        invitation_token=token,
        invitation_expires_at=expiry,
        onboarding_completed=False
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    # In production, send email here with token
    print(f"DEBUG: Generated Stratum Key for {invite_data.email}: {token}")
    
    return new_user

@router.post("/claim-key", response_model=schemas.User)
def claim_invitation(
    claim_data: schemas.UserClaim,
    db: Session = Depends(get_db)
):
    """
    The secure handshake: Validates a Stratum Key and activates the staff account.
    """
    user = crud_user.get_user_by_token(db, token=claim_data.token)
    
    if not user:
        raise HTTPException(status_code=404, detail="Invalid or expired Stratum Key.")
        
    if user.status != "pending":
        raise HTTPException(status_code=400, detail="This invitation has already been claimed.")
        
    if user.invitation_expires_at < datetime.now():
        raise HTTPException(status_code=400, detail="This Stratum Key has expired. Please request a new invite.")

    # Activate User
    user.firebase_uid = claim_data.firebase_uid
    user.full_name = claim_data.full_name
    user.status = "active"
    user.onboarding_completed = True
    user.invitation_token = None # Clear token after use
    
    db.commit()
    db.refresh(user)
    return user

@router.get("/invite/{token}")
def get_invite_details(token: str, db: Session = Depends(get_db)):
    """
    Public endpoint to verify a key and show the welcome message.
    """
    user = crud_user.get_user_by_token(db, token=token)
    if not user or user.status != "pending" or user.invitation_expires_at < datetime.now():
        raise HTTPException(status_code=404, detail="Invalid or expired Stratum Key.")
        
    return {
        "email": user.email,
        "organization_name": user.organization.name if user.organization else "Stratum",
        "role_name": user.role.name if user.role else "Member"
    }

@router.get("/organization/{org_id}", response_model=List[schemas.User])
def get_organization_members(
    org_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    me = crud_user.get_user_by_firebase_uid(db, firebase_uid=current_user["uid"])
    if me.organization_id != org_id:
        raise HTTPException(status_code=403, detail="Access denied to external organization data.")
        
    return db.query(models.User).filter(models.User.organization_id == org_id).all()

@router.patch("/{user_id}", response_model=schemas.User)
def update_user_role(
    user_id: uuid.UUID,
    update: schemas.UserUpdate,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    me = crud_user.get_user_by_firebase_uid(db, firebase_uid=current_user["uid"])
    
    # Only those with 'manage_roles' can change others' roles
    if not check_role_permission(me, "manage_roles"):
        raise_superior_priority_error("modifying user roles")
        
    db_user = db.query(models.User).filter(models.User.id == user_id).first()
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")
        
    if update.role_id:
        db_user.role_id = update.role_id
    if update.department_id:
        db_user.department_id = update.department_id
        
    db.commit()
    db.refresh(db_user)
    return db_user

@router.post("/{user_id}/auto-assign-manager", response_model=schemas.User)
def auto_assign_manager(user_id: uuid.UUID, db: Session = Depends(get_db)):
    """
    Agentic Tool: Automatically repairs a 'lonely' node in the org web.
    """
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
        
    # Find the organization root (CEO)
    root = db.query(models.User).filter(
        models.User.organization_id == user.organization_id,
        models.User.is_root == True
    ).first()
    
    if not root:
        raise HTTPException(status_code=400, detail="No root found for this organization.")

    user.manager_id = root.id
    db.commit()
    db.refresh(user)
    return user
