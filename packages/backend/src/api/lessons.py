import os
import httpx
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
import uuid
from typing import List

from .. import schemas, models
from ..crud import lesson as crud_lesson
from ..crud import user as crud_user
from ..db.database import get_db
from ..core.auth import get_current_user
from ..core.hierarchy import is_superior_of, can_manage_department

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
    db_user = crud_user.get_user_by_firebase_uid(db, firebase_uid=current_user["uid"])
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")

    return crud_lesson.create_lesson(
        db=db, 
        lesson=lesson, 
        author_id=db_user.id, 
        organization_id=db_user.organization_id
    )

@router.get("/", response_model=List[schemas.Lesson])
def read_lessons(
    skip: int = 0, 
    limit: int = 100, 
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    db_user = crud_user.get_user_by_firebase_uid(db, firebase_uid=current_user["uid"])
    return crud_lesson.get_lessons_by_organization(
        db, 
        organization_id=db_user.organization_id, 
        skip=skip, 
        limit=limit
    )

@router.post("/generate", response_model=schemas.Lesson)
async def generate_lesson_content(
    request: schemas.LessonGenerateRequest,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    """
    Uses Gemini and the RAG Pipeline to generate lesson content based on documents.
    """
    db_user = crud_user.get_user_by_firebase_uid(db, firebase_uid=current_user["uid"])
    
    # 1. Ask RAG service for a summary/lesson draft based on docs
    rag_service_url = os.getenv("RAG_SERVICE_URL", "http://127.0.0.1:8001")
    
    # Construct a special prompt for lesson generation
    prompt = f"Create a detailed training lesson about '{request.topic}' for the {request.target_department_id or 'general'} department. Use the provided context to ensure technical accuracy."
    
    generated_content = ""
    async with httpx.AsyncClient(timeout=60.0) as client:
        try:
            payload = {
                "query": prompt,
                "organization_id": str(db_user.organization_id),
                "s3_path": str(request.document_ids[0]) if request.document_ids else None
            }
            response = await client.post(f"{rag_service_url}/query", json=payload)
            if response.status_code == 200:
                # Since /query returns a stream, we need to collect it
                # For simplicity in this demo, we'll assume a non-streaming variant or collect it
                async for chunk in response.aiter_text():
                    generated_content += chunk
            else:
                raise HTTPException(status_code=500, detail="Intelligence service error")
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Generation failed: {str(e)}")

    # 2. Create the lesson record
    new_lesson = models.Lesson(
        title=request.title,
        content=generated_content,
        organization_id=db_user.organization_id,
        author_id=db_user.id,
        target_department_id=request.target_department_id
    )
    db.add(new_lesson)
    db.commit()
    db.refresh(new_lesson)
    return new_lesson

@router.get("/{lesson_id}", response_model=schemas.Lesson)
def read_lesson(lesson_id: uuid.UUID, db: Session = Depends(get_db)):
    db_lesson = crud_lesson.get_lesson(db, lesson_id=lesson_id)
    if db_lesson is None:
        raise HTTPException(status_code=404, detail="Lesson not found")
    return db_lesson

@router.patch("/{lesson_id}", response_model=schemas.Lesson)
def update_lesson(
    lesson_id: uuid.UUID,
    update: schemas.LessonUpdate,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    db_lesson = crud_lesson.get_lesson(db, lesson_id=lesson_id)
    if not db_lesson:
        raise HTTPException(status_code=404, detail="Lesson not found")
        
    db_user = crud_user.get_user_by_firebase_uid(db, firebase_uid=current_user["uid"])
    
    # Priority Control: Author, Superior, or Admin can edit
    if db_lesson.author_id != db_user.id:
        if not is_superior_of(db, db_user.id, db_lesson.author_id):
            raise HTTPException(status_code=403, detail="Superior priority required to edit subordinate content")

    for key, value in update.model_dump(exclude_unset=True).items():
        setattr(db_lesson, key, value)
        
    db.commit()
    db.refresh(db_lesson)
    return db_lesson

@router.delete("/{lesson_id}")
def delete_lesson(
    lesson_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    db_lesson = crud_lesson.get_lesson(db, lesson_id=lesson_id)
    if not db_lesson:
        raise HTTPException(status_code=404, detail="Lesson not found")
        
    db_user = crud_user.get_user_by_firebase_uid(db, firebase_uid=current_user["uid"])
    
    if db_lesson.author_id != db_user.id:
        if not is_superior_of(db, db_user.id, db_lesson.author_id):
            raise HTTPException(status_code=403, detail="Superior priority required to delete subordinate content")

    db.delete(db_lesson)
    db.commit()
    return {"message": "Lesson deleted"}
