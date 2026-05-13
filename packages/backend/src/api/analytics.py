from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func
import uuid

from .. import models
from ..db.database import get_db
from ..core.auth import get_current_user

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
@router.get("/audit/{organization_id}")
def run_org_audit(organization_id: uuid.UUID, db: Session = Depends(get_db)):
    """
    The Robotic Butler's "Structural Sentinel" Logic.
    Scans the organization for hierarchy health and knowledge coverage.
    """
    
    # 1. "Lonely Employees" (No manager assigned and not the root CEO)
    lonely_users = db.query(models.User).filter(
        models.User.organization_id == organization_id,
        models.User.manager_id == None,
        models.User.is_root == False
    ).all()
    
    # 2. "Span of Control" (Managers with high cognitive load / too many reports)
    # We'll group by manager_id and find counts > 8 (Butler's threshold)
    overloaded_query = db.query(
        models.User.manager_id, 
        func.count(models.User.id).label('report_count')
    ).filter(
        models.User.organization_id == organization_id,
        models.User.manager_id != None
    ).group_by(models.User.manager_id).having(func.count(models.User.id) > 8).all()
    
    overloaded_managers = []
    for manager_id, count in overloaded_query:
        mgr = db.query(models.User).filter(models.User.id == manager_id).first()
        overloaded_managers.append({
            "id": mgr.id,
            "name": mgr.full_name,
            "count": count
        })

    # 3. "Knowledge Silos" (Departments with minimal documentation)
    depts = db.query(models.Department).filter(models.Department.organization_id == organization_id).all()
    knowledge_gaps = []
    
    for dept in depts:
        doc_count = db.query(func.count(models.Document.id)).filter(models.Document.department_id == dept.id).scalar()
        lesson_count = db.query(func.count(models.Lesson.id)).filter(models.Lesson.target_department_id == dept.id).scalar()
        
        if doc_count + lesson_count < 3: # Butler's threshold for a "Silo"
            knowledge_gaps.append({
                "id": dept.id,
                "name": dept.name,
                "coverage": doc_count + lesson_count
            })

    return {
        "status": "Healthy" if not (lonely_users or overloaded_managers or knowledge_gaps) else "Needs Attention",
        "lonely_employees": [{"id": u.id, "name": u.full_name, "email": u.email} for u in lonely_users],
        "overloaded_managers": overloaded_managers,
        "knowledge_gaps": knowledge_gaps,
        "recommendations": generate_butler_recommendations(lonely_users, overloaded_managers, knowledge_gaps)
    }

def generate_butler_recommendations(lonely, overloaded, gaps):
    recs = []
    if lonely:
        recs.append(f"Found {len(lonely)} employees without a reporting line. These 'lonely' nodes risk isolation.")
    if overloaded:
        recs.append(f"Managers like {overloaded[0]['name']} are handling {overloaded[0]['count']} reports. Consider delegating to a Department Head.")
    if gaps:
        recs.append(f"The {gaps[0]['name']} department is a knowledge silo. I suggest generating at least 3 orientation Lessons.")
    
    if not recs:
        recs.append("Organization is balanced. I am standing by for the next structural shift.")
    
    return recs
