import uuid
from fastapi import HTTPException
from sqlalchemy.orm import Session
from ..models.user import User
from ..models.department import Department

def is_superior_of(db: Session, superior_id: uuid.UUID, subordinate_id: uuid.UUID) -> bool:
    """
    Checks if superior_id is a superior (manager or ancestor manager) of subordinate_id.
    """
    if superior_id == subordinate_id:
        return True
        
    current_sub = db.query(User).filter(User.id == subordinate_id).first()
    while current_sub and current_sub.manager_id:
        if current_sub.manager_id == superior_id:
            return True
        current_sub = db.query(User).filter(User.id == current_sub.manager_id).first()
        
    return False

def can_manage_department(db: Session, user_id: uuid.UUID, department_id: uuid.UUID) -> bool:
    """
    Checks if a user is the head of a department or an ancestor department.
    """
    dept = db.query(Department).filter(Department.id == department_id).first()
    while dept:
        if dept.head_id == user_id:
            return True
        if not dept.parent_department_id:
            break
        dept = db.query(Department).filter(Department.id == dept.parent_department_id).first()
        
    return False

def raise_superior_priority_error(action: str = "this action"):
    """
    Returns a user-friendly, descriptive error for hierarchy violations.
    """
    raise HTTPException(
        status_code=403,
        detail={
            "error": "Superior Priority Required",
            "message": f"To perform '{action}', you must have a higher hierarchical rank than the target user.",
            "guideline": "As per Stratum security guidelines, management power trickles down. You can only manage data for members within your own reporting line or department."
        }
    )

def check_role_permission(user: User, permission_key: str) -> bool:
    """
    Checks if the user's role has the specified permission.
    """
    if not user.role or not user.role.permissions:
        return False
        
    perms = user.role.permissions
    # Admin override or specific permission check
    return perms.get("admin") == "all" or perms.get(permission_key, False) is True
