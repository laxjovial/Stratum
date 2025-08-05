from sqlalchemy.orm import Session
import uuid
from .. import models
from ..schemas.document import DocumentCreate, DocumentUpdate

def create_document(db: Session, document: DocumentCreate):
    db_document = models.Document(**document.model_dump())
    db.add(db_document)
    db.commit()
    db.refresh(db_document)
    return db_document

def get_document_by_s3_path(db: Session, s3_path: str):
    return db.query(models.Document).filter(models.Document.s3_path == s3_path).first()

def get_documents_by_organization(db: Session, organization_id: uuid.UUID, skip: int = 0, limit: int = 100):
    return db.query(models.Document).filter(
        models.Document.organization_id == organization_id
    ).offset(skip).limit(limit).all()

def update_document_status(db: Session, s3_path: str, status: models.DocumentStatus):
    db_document = get_document_by_s3_path(db, s3_path)
    if db_document:
        db_document.status = status
        db.commit()
        db.refresh(db_document)
    return db_document
