import os
import httpx
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from starlette.responses import StreamingResponse
from sqlalchemy.orm import Session
from typing import Optional, List

from ..core.auth import get_current_user
from ..crud import user as crud_user
from ..db.database import get_db

router = APIRouter(
    prefix="/chat",
    tags=["Chat"],
    dependencies=[Depends(get_current_user)],
)

class ChatRequest(BaseModel):
    query: str
    section: Optional[str] = None
    document_id: Optional[str] = None

@router.post("/")
async def stream_chat_response(
    request: ChatRequest,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Relays the chat query to the RAG service for context-aware response generation.
    """
    # 1. Get user profile
    db_user = crud_user.get_user_by_firebase_uid(db, firebase_uid=current_user["uid"])
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")

    # 2. Call RAG service
    rag_service_url = os.getenv("RAG_SERVICE_URL", "http://localhost:8001")
    
    async def stream_generator():
        async with httpx.AsyncClient(timeout=60.0) as client:
            try:
                # Prepare payload for RAG service
                payload = {
                    "query": request.query,
                    "organization_id": str(db_user.organization_id),
                    "section": request.section,
                    "s3_path": request.document_id # In the RAG service we use s3_path as unique doc ID
                }
                
                async with client.stream("POST", f"{rag_service_url}/query", json=payload) as response:
                    if response.status_code != 200:
                        yield f"Error: RAG service returned {response.status_code}"
                        return
                        
                    async for chunk in response.aiter_text():
                        yield chunk
            except Exception as e:
                print(f"Chat Relay Error: {e}")
                yield f"Error connecting to intelligence service: {str(e)}"

    return StreamingResponse(stream_generator(), media_type="text/plain")
