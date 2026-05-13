from fastapi import FastAPI, BackgroundTasks, HTTPException
from pydantic import BaseModel
import os
from dotenv import load_dotenv
from typing import Optional

# Load environment variables
load_dotenv()

app = FastAPI(
    title="Stratum RAG Pipeline Service",
    description="A service to process documents and manage the RAG pipeline.",
    version="0.1.0"
)

# --- Pydantic Models ---
class ProcessRequest(BaseModel):
    s3_path: str
    organization_id: str
    department_id: Optional[str] = None
    owner_id: Optional[str] = None
    section: Optional[str] = "General"

class QueryRequest(BaseModel):
    query: str
    organization_id: str
    department_id: Optional[str] = None
    owner_id: Optional[str] = None
    section: Optional[str] = None
    s3_path: Optional[str] = None

import processor

# --- Background Task ---
def process_document_in_background(s3_path: str, organization_id: str, department_id: str, owner_id: str, section: str):
    processor.process_document(s3_path, organization_id, department_id, owner_id, section)

# --- API Endpoints ---
@app.post("/process-document")
async def trigger_document_processing(request: ProcessRequest, background_tasks: BackgroundTasks):
    background_tasks.add_task(
        process_document_in_background,
        request.s3_path,
        request.organization_id,
        request.department_id,
        request.owner_id,
        request.section
    )
    return {"message": "Document processing has been successfully queued."}

from starlette.responses import StreamingResponse

@app.post("/query")
def query_documents(request: QueryRequest):
    try:
        pc = processor.initialize_pinecone()
        index = pc.Index("stratum-index")
        stream = processor.get_query_response_stream(
            query=request.query,
            organization_id=request.organization_id,
            department_id=request.department_id,
            owner_id=request.owner_id,
            section=request.section,
            s3_path=request.s3_path
        )
        return StreamingResponse(stream, media_type="text/event-stream")
    except Exception as e:
        print(f"Error during query processing: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/health")
def health_check():
    return {"status": "ok", "service": "RAG Pipeline"}
