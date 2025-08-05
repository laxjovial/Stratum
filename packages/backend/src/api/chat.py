import os
import httpx
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from starlette.responses import StreamingResponse
from sqlalchemy.orm import Session

from ..core.firebase import get_current_user
from ..crud import user as crud_user
from ..db.database import get_db

router = APIRouter(
    prefix="/chat",
    tags=["Chat"],
    dependencies=[Depends(get_current_user)],
)

class ChatRequest(BaseModel):
    query: str

@router.post("/")
async def stream_chat_response(
    request: ChatRequest,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    This endpoint is the primary interface for the user-facing chat.
    It takes a user's query, retrieves their organization context,
    forwards the request to the dedicated RAG service, and then
    streams the response back to the client.
    """
    rag_service_url = os.getenv("RAG_SERVICE_URL")
    if not rag_service_url:
        raise HTTPException(status_code=503, detail="Chat service is not configured.")

    # Get the user's organization ID from our database
    db_user = crud_user.get_user_by_firebase_uid(db, firebase_uid=current_user["uid"])
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found in database.")

    organization_id = str(db_user.organization_id)

    async def stream_generator():
        """
        A generator function that streams the response from the RAG service.
        """
        async with httpx.AsyncClient(timeout=300.0) as client:
            try:
                async with client.stream(
                    "POST",
                    f"{rag_service_url}/query",
                    json={"query": request.query, "organization_id": organization_id}
                ) as response:
                    response.raise_for_status()
                    async for chunk in response.aiter_bytes():
                        yield chunk
            except httpx.RequestError as e:
                print(f"Error calling RAG service: {e}")
                # Yield a user-friendly error message through the stream
                yield b"data: {\"error\": \"The chat service is currently unavailable. Please try again later.\"}\n\n"

    return StreamingResponse(stream_generator(), media_type="text/event-stream")
