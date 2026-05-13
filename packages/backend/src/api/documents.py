import os
import boto3
from botocore.exceptions import ClientError
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
import httpx
from sqlalchemy.orm import Session
import uuid
from typing import List, Optional

from .. import schemas, models
from ..schemas import s3 as storage_schemas
from ..crud import document as crud_document
from ..db.database import get_db
from ..core.auth import get_current_user
from ..core.auth import supabase_client
from ..crud import user as crud_user
from ..core.hierarchy import is_superior_of

router = APIRouter(
    prefix="/documents",
    tags=["Documents"],
    dependencies=[Depends(get_current_user)],
)

class PresignedUrlRequest(BaseModel):
    file_name: str
    file_type: str

@router.post("/presigned-url", response_model=storage_schemas.PresignedUrl)
def create_presigned_url(
    request: PresignedUrlRequest,
    current_user: dict = Depends(get_current_user)
):
    aws_key = os.getenv("AWS_ACCESS_KEY_ID")
    bucket_name = os.getenv("S3_BUCKET_NAME", "stratum-docs")
    object_key = f"uploads/{current_user['uid']}/{uuid.uuid4()}_{request.file_name}"

    if aws_key:
        try:
            s3_client = boto3.client('s3', region_name=os.getenv("AWS_REGION", "us-east-1"))
            response = s3_client.generate_presigned_post(
                Bucket=bucket_name,
                Key=object_key,
                Fields={"Content-Type": request.file_type},
                Conditions=[{"Content-Type": request.file_type}],
                ExpiresIn=3600
            )
            return {"url": response["url"], "fields": response["fields"], "provider": "s3"}
        except Exception: pass

    if supabase_client:
        try:
            res = supabase_client.storage.from_("documents").create_signed_upload_url(object_key)
            return {"url": res["signed_url"], "token": res["token"], "fields": {"key": object_key}, "provider": "supabase"}
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Storage provider error: {e}")

    raise HTTPException(status_code=500, detail="No storage provider configured.")

@router.get("/{organization_id}", response_model=List[schemas.Document])
def read_documents(
    organization_id: uuid.UUID,
    section: Optional[str] = None,
    department_id: Optional[uuid.UUID] = None,
    db: Session = Depends(get_db)
):
    query = db.query(models.Document).filter(models.Document.organization_id == organization_id)
    if section: query = query.filter(models.Document.section == section)
    if department_id: query = query.filter(models.Document.department_id == department_id)
    return query.all()

@router.post("/", response_model=schemas.Document)
async def create_document_record(
    document: schemas.DocumentCreate,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    db_document = crud_document.create_document(db, document=document)
    
    rag_service_url = os.getenv("RAG_SERVICE_URL", "http://127.0.0.1:8001")
    async with httpx.AsyncClient() as client:
        try:
            await client.post(f"{rag_service_url}/process-document", json={
                "s3_path": db_document.s3_path,
                "organization_id": str(db_document.organization_id),
                "section": db_document.section
            })
            crud_document.update_document_status(db, db_document.s3_path, "PROCESSING")
        except Exception: pass

    return db_document

@router.patch("/{document_id}", response_model=schemas.Document)
def update_document(
    document_id: uuid.UUID,
    update: schemas.DocumentUpdate,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    db_doc = db.query(models.Document).filter(models.Document.id == document_id).first()
    if not db_doc: raise HTTPException(status_code=404, detail="Document not found")
    
    db_user = crud_user.get_user_by_firebase_uid(db, firebase_uid=current_user["uid"])
    
    # Priority Control: Author or Superior can edit
    if db_doc.uploader_id != db_user.id:
        if not is_superior_of(db, db_user.id, db_doc.uploader_id):
            raise HTTPException(status_code=403, detail="Superior priority required to edit this document")

    if update.section is not None: db_doc.section = update.section
    if update.status is not None: db_doc.status = update.status
    if hasattr(update, 'department_id') and update.department_id is not None:
        db_doc.department_id = update.department_id
        
    db.commit()
    db.refresh(db_doc)
    return db_doc

@router.delete("/{document_id}")
def delete_document(
    document_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    db_doc = db.query(models.Document).filter(models.Document.id == document_id).first()
    if not db_doc: raise HTTPException(status_code=404, detail="Document not found")
    
    db_user = crud_user.get_user_by_firebase_uid(db, firebase_uid=current_user["uid"])
    
    if db_doc.uploader_id != db_user.id:
        if not is_superior_of(db, db_user.id, db_doc.uploader_id):
            raise HTTPException(status_code=403, detail="Superior priority required to delete this document")
    
    db.delete(db_doc)
    db.commit()
    return {"message": "Document deleted"}
