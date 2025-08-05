from fastapi import FastAPI, BackgroundTasks, HTTPException
from pydantic import BaseModel
import os
from dotenv import load_dotenv

# Load environment variables from .env file
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

from . import processor

# --- Background Task ---
def process_document_in_background(s3_path: str, organization_id: str):
    """
    This is the core function that will be executed in the background.
    It calls the main orchestrator function from the processor module.
    """
    processor.process_document(s3_path, organization_id)

# --- API Endpoints ---
@app.post("/process-document")
async def trigger_document_processing(request: ProcessRequest, background_tasks: BackgroundTasks):
    """
    Receives a request (likely from the main backend) to process a document
    that has been uploaded to S3.
    """
    background_tasks.add_task(
        process_document_in_background,
        request.s3_path,
        request.organization_id
    )
    return {"message": "Document processing has been successfully queued."}

from starlette.responses import StreamingResponse

class QueryRequest(BaseModel):
    query: str
    organization_id: str

@app.post("/query")
def query_documents(request: QueryRequest):
    """
    Receives a query from the main backend, performs the RAG process,
    and streams the response back.
    """
    try:
        pc = processor.initialize_pinecone()
        index = pc.Index("stratum-index")
        stream = processor.get_query_response_stream(
            pinecone_index=index,
            query=request.query,
            organization_id=request.organization_id
        )
        return StreamingResponse(stream, media_type="text/event-stream")
    except Exception as e:
        print(f"Error during query processing: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/health")
def health_check():
    """A simple health check endpoint to confirm the service is running."""
    return {"status": "ok", "service": "RAG Pipeline"}
