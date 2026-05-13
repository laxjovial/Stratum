import os
import boto3
from botocore.exceptions import NoCredentialsError
from langchain_community.document_loaders import (
    PyPDFLoader, 
    Docx2txtLoader, 
    TextLoader, 
    UnstructuredMarkdownLoader,
    UnstructuredExcelLoader,
    UnstructuredWordDocumentLoader
)
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_google_genai import GoogleGenerativeAIEmbeddings, ChatGoogleGenerativeAI
from pinecone import Pinecone, ServerlessSpec
from langchain_core.prompts import PromptTemplate
from langchain_core.runnables import RunnablePassthrough
from langchain_core.output_parsers import StrOutputParser
import httpx

# Fallback Supabase Storage
from supabase import create_client, Client

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")
supabase: Client = None
if SUPABASE_URL and SUPABASE_KEY:
    supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

def download_from_storage(bucket_name: str, s3_path: str, local_path: str) -> bool:
    """
    Downloads from S3 or Supabase Storage depending on availability.
    """
    os.makedirs(os.path.dirname(local_path), exist_ok=True)
    
    # 1. Try S3
    aws_key = os.getenv("AWS_ACCESS_KEY_ID")
    if aws_key:
        try:
            s3_client = boto3.client('s3', region_name=os.getenv("AWS_REGION", "us-east-1"))
            s3_client.download_file(bucket_name, s3_path, local_path)
            return True
        except Exception as e:
            print(f"S3 Download Error: {e}")

    # 2. Try Supabase
    if supabase:
        try:
            # We use 'documents' bucket by default
            with open(local_path, "wb+") as f:
                res = supabase.storage.from_("documents").download(s3_path)
                f.write(res)
            return True
        except Exception as e:
            print(f"Supabase Download Error: {e}")

    return False

def load_and_chunk_document(file_path: str) -> list:
    _, extension = os.path.splitext(file_path)
    extension = extension.lower()
    try:
        if extension == '.pdf':
            loader = PyPDFLoader(file_path)
        elif extension == '.docx' or extension == '.doc':
            loader = Docx2txtLoader(file_path)
        elif extension == '.md':
            loader = UnstructuredMarkdownLoader(file_path)
        elif extension == '.txt':
            loader = TextLoader(file_path)
        elif extension in ['.xls', '.xlsx']:
            loader = UnstructuredExcelLoader(file_path)
        else:
            print(f"Unsupported file type: {extension}")
            return []
        
        documents = loader.load()
        text_splitter = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=200)
        return text_splitter.split_documents(documents)
    except Exception as e:
        print(f"Error chunking {file_path}: {e}")
        return []

def initialize_pinecone():
    api_key = os.getenv("PINECONE_API_KEY")
    if not api_key or api_key == "your-pinecone-api-key":
        return None
    return Pinecone(api_key=api_key)

def process_and_upsert_chunks(chunks: list, organization_id: str, s3_path: str, department_id: str = None, owner_id: str = None, section: str = "General"):
    if not chunks: return
    
    google_api_key = os.getenv("GEMINI_API_KEY")
    embeddings = GoogleGenerativeAIEmbeddings(model="models/embedding-001", google_api_key=google_api_key)
    
    pc_client = initialize_pinecone()
    
    # 1. Use Pinecone if available
    if pc_client:
        index_name = "stratum-index"
        if index_name not in [idx.name for idx in pc_client.list_indexes()]:
            pc_client.create_index(
                name=index_name,
                dimension=768, 
                metric="cosine",
                spec=ServerlessSpec(cloud="aws", region="us-east-1")
            )
        index = pc_client.Index(index_name)

        batch_size = 50
        for i in range(0, len(chunks), batch_size):
            batch_chunks = chunks[i:i + batch_size]
            texts = [chunk.page_content for chunk in batch_chunks]
            vector_embeddings = embeddings.embed_documents(texts)

            vectors_to_upsert = []
            for j, emb in enumerate(vector_embeddings):
                vector_id = f"{organization_id}-{s3_path}-{i+j}"
                vectors_to_upsert.append({
                    "id": vector_id,
                    "values": emb,
                    "metadata": {
                        "text": batch_chunks[j].page_content,
                        "organization_id": organization_id,
                        "department_id": department_id or "root",
                        "owner_id": owner_id or "system",
                        "s3_path": s3_path,
                        "section": section,
                    }
                })
            index.upsert(vectors=vectors_to_upsert)
            print(f"Upserted {len(vectors_to_upsert)} vectors to Pinecone")
    else:
        # 2. Fallback to Supabase pgvector (simplified implementation)
        print("Pinecone not configured. Falling back to Supabase pgvector...")
        # In a full implementation, we would use a 'document_sections' table in Supabase
        # for vector search. For now, we'll log this as a placeholder.
        pass

def process_document(s3_path: str, organization_id: str, department_id: str = None, owner_id: str = None, section: str = "General"):
    bucket_name = os.getenv("S3_BUCKET_NAME", "stratum-docs")
    local_path = os.path.join("/tmp/stratum_docs", os.path.basename(s3_path))
    try:
        if not download_from_storage(bucket_name, s3_path, local_path): 
            print(f"Failed to download {s3_path}")
            return
        chunks = load_and_chunk_document(local_path)
        if not chunks: return
        process_and_upsert_chunks(chunks, organization_id, s3_path, department_id, owner_id, section)
    finally:
        if os.path.exists(local_path): os.remove(local_path)

def get_query_response_stream(query: str, organization_id: str, department_id: str = None, owner_id: str = None, section: str = None, s3_path: str = None):
    google_api_key = os.getenv("GEMINI_API_KEY")
    embeddings = GoogleGenerativeAIEmbeddings(model="models/embedding-001", google_api_key=google_api_key)
    
    query_embedding = embeddings.embed_query(query)
    
    pc_client = initialize_pinecone()
    context = ""

    if pc_client:
        index = pc_client.Index("stratum-index")
        pc_filter = {"organization_id": organization_id}
        if department_id: pc_filter["department_id"] = department_id
        if owner_id: pc_filter["owner_id"] = owner_id
        if section: pc_filter["section"] = section
        if s3_path: pc_filter["s3_path"] = s3_path

        retrieved_docs = index.query(
            vector=query_embedding,
            top_k=5,
            filter=pc_filter,
            include_metadata=True
        )
        context = "\n---\n".join([match['metadata']['text'] for match in retrieved_docs['matches']])
    else:
        # Supabase Fallback Query
        context = "No vector database (Pinecone) configured. Please check your environment variables."

    template = """
    You are Stratum Intelligence. Use the following context to answer.
    Context: {context}
    Question: {question}
    """
    prompt = PromptTemplate.from_template(template)
    llm = ChatGoogleGenerativeAI(model="gemini-1.5-flash", google_api_key=google_api_key, streaming=True)
    
    chain = (
        {"context": lambda x: context, "question": RunnablePassthrough()}
        | prompt
        | llm
        | StrOutputParser()
    )
    return chain.stream(query)
