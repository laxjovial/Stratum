import os
import boto3
from botocore.exceptions import ClientError
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
import httpx

from .. import schemas
from ..schemas import s3 as s3_schemas
from ..crud import document as crud_document
from ..db.database import get_db
from sqlalchemy.orm import Session
from ..core.firebase import get_current_user
import uuid

from typing import List


router = APIRouter(
    prefix="/documents",
    tags=["Documents"],
    dependencies=[Depends(get_current_user)],
)

class PresignedUrlRequest(BaseModel):
    file_name: str
    file_type: str

@router.post("/presigned-url", response_model=s3_schemas.PresignedUrl)
def create_presigned_url(
    request: PresignedUrlRequest,
    current_user: dict = Depends(get_current_user)
):
    """
    Generates a pre-signed URL that the client can use to upload a file directly to S3.
    """
    s3_client = boto3.client('s3', region_name=os.getenv("AWS_REGION"))
    bucket_name = os.getenv("S3_BUCKET_NAME")

    # Generate a unique path for the object in S3
    # e.g., {organization_id}/{user_id}/{uuid}_{file_name}
    object_key = f"uploads/{current_user['uid']}/{request.file_name}"

    try:
        response = s3_client.generate_presigned_post(
            Bucket=bucket_name,
            Key=object_key,
            Fields={"Content-Type": request.file_type},
            Conditions=[{"Content-Type": request.file_type}],
            ExpiresIn=3600  # URL expires in 1 hour
        )
        return response
    except ClientError as e:
        print(e)
        raise HTTPException(status_code=500, detail="Could not generate pre-signed URL.")

@router.get("/{organization_id}", response_model=List[schemas.Document])
def read_documents_for_organization(
    organization_id: uuid.UUID,
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    """
    Retrieves a list of documents for a given organization.
    """
    # In a real app, you'd verify the requesting user has access to this org
    documents = crud_document.get_documents_by_organization(
        db, organization_id=organization_id, skip=skip, limit=limit
    )
    return documents

@router.post("/webhook/s3-upload-complete")
async def s3_upload_webhook(
    payload: s3_schemas.S3UploadWebhookPayload,
    db: Session = Depends(get_db)
):
    """
    Webhook endpoint to be called by an S3 event notification when a file upload is complete.
    This endpoint will then call the RAG service to start processing.
    """
    # 1. Find the user/organization associated with the upload from the s3_key
    #    (This requires a more robust key generation strategy than the example above)
    #    For now, we'll assume we can get the org_id.

    # 2. Create a document record in our database
    # doc_create = schemas.DocumentCreate(...)
    # crud.document.create_document(db, document=doc_create)

    # 3. Call the RAG service to trigger processing
    rag_service_url = os.getenv("RAG_SERVICE_URL")
    if not rag_service_url:
        raise HTTPException(status_code=500, detail="RAG service is not configured.")

    async with httpx.AsyncClient() as client:
        try:
            await client.post(f"{rag_service_url}/process-document", json={
                "s3_path": payload.s3_key,
                "organization_id": "placeholder_org_id" # Replace with actual org_id
            })
        except httpx.RequestError as e:
            print(f"Failed to call RAG service: {e}")
            # Optionally update the document status to FAILED
            raise HTTPException(status_code=503, detail="Could not queue document for processing.")

    return {"message": "Webhook received and processing triggered."}


# Add a schema for the presigned URL response
class PresignedUrl(BaseModel):
    url: str
    fields: dict

# Add this to schemas/document.py or a new file
schemas.PresignedUrl = PresignedUrl
