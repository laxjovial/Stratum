import os
import boto3
from botocore.exceptions import NoCredentialsError

def download_from_s3(bucket_name: str, s3_path: str, local_path: str) -> bool:
    """
    Downloads a file from an S3 bucket to a specified local path.
    Reads AWS credentials from environment variables.
    """
    s3_client = boto3.client(
        's3',
        aws_access_key_id=os.getenv("AWS_ACCESS_KEY_ID"),
        aws_secret_access_key=os.getenv("AWS_SECRET_ACCESS_KEY"),
        region_name=os.getenv("AWS_REGION")
    )
    try:
        # Ensure the local directory exists
        os.makedirs(os.path.dirname(local_path), exist_ok=True)

        s3_client.download_file(bucket_name, s3_path, local_path)
        print(f"Successfully downloaded s3://{bucket_name}/{s3_path} to {local_path}")
        return True
    except NoCredentialsError:
        print("Error: AWS credentials not found. Please configure AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY.")
        return False
    except Exception as e:
        print(f"An unexpected error occurred while downloading from S3: {e}")
        return False

from langchain_community.document_loaders import PyPDFLoader, Docx2txtLoader
from langchain.text_splitter import RecursiveCharacterTextSplitter

def load_and_chunk_document(file_path: str) -> list:
    """
    Loads a document from a file path and splits it into chunks.
    Supports PDF and DOCX files.
    """
    file_name, extension = os.path.splitext(file_path)
    extension = extension.lower()

    if extension == '.pdf':
        loader = PyPDFLoader(file_path)
    elif extension == '.docx':
        loader = Docx2txtLoader(file_path)
    else:
        print(f"Unsupported file type: {extension}")
        return []

    try:
        documents = loader.load()
        text_splitter = RecursiveCharacterTextSplitter(
            chunk_size=1000,
            chunk_overlap=200,
        )
        chunks = text_splitter.split_documents(documents)
        print(f"Successfully loaded and chunked '{os.path.basename(file_name)}' into {len(chunks)} chunks.")
        return chunks
    except Exception as e:
        print(f"Error loading or chunking document: {e}")
        return []


from langchain_openai import OpenAIEmbeddings
from pinecone import Pinecone, ServerlessSpec

def initialize_pinecone():
    """Initializes and returns a Pinecone client, checking for API key."""
    pinecone_api_key = os.getenv("PINECONE_API_KEY")
    if not pinecone_api_key:
        raise ValueError("PINECONE_API_KEY environment variable not set.")
    return Pinecone(api_key=pinecone_api_key)

def process_and_upsert_chunks(pinecone_client: Pinecone, chunks: list, organization_id: str, s3_path: str):
    """
    Generates embeddings for document chunks and upserts them into a specified Pinecone index.
    """
    if not chunks:
        print("No chunks to process.")
        return

    index_name = "stratum-index"  # Centralized index name
    if index_name not in pinecone_client.list_indexes().names():
        print(f"Index '{index_name}' not found. Creating new index...")
        pinecone_client.create_index(
            name=index_name,
            dimension=1536,  # Dimension for OpenAI's text-embedding-ada-002
            metric="cosine",
            spec=ServerlessSpec(cloud="aws", region="us-east-1") # Example spec
        )
        print("Index created successfully.")
    index = pinecone_client.Index(index_name)

    openai_api_key = os.getenv("OPENAI_API_KEY")
    if not openai_api_key:
        raise ValueError("OPENAI_API_KEY environment variable not set.")
    embeddings = OpenAIEmbeddings(openai_api_key=openai_api_key)

    # Process in batches to respect API limits and improve efficiency
    batch_size = 100
    for i in range(0, len(chunks), batch_size):
        batch_chunks = chunks[i:i + batch_size]
        texts = [chunk.page_content for chunk in batch_chunks]

        vector_embeddings = embeddings.embed_documents(texts)

        vectors_to_upsert = []
        for j, chunk in enumerate(batch_chunks):
            vector_id = f"{organization_id}-{s3_path}-{i+j}"
            vector = {
                "id": vector_id,
                "values": vector_embeddings[j],
                "metadata": {
                    "text": chunk.page_content,
                    "organization_id": organization_id,
                    "s3_path": s3_path,
                    **chunk.metadata,
                }
            }
            vectors_to_upsert.append(vector)

        index.upsert(vectors=vectors_to_upsert)
        print(f"Upserted batch {i//batch_size + 1} with {len(vectors_to_upsert)} vectors to Pinecone.")

def process_document(s3_path: str, organization_id: str):
    """
    Main orchestrator function that ties everything together.
    Downloads, chunks, embeds, and upserts a single document.
    """
    bucket_name = os.getenv("S3_BUCKET_NAME")
    if not bucket_name:
        print("Error: S3_BUCKET_NAME environment variable is not set.")
        return

    # Use a temporary directory for downloads
    local_dir = "/tmp/stratum_docs"
    # Create a unique local path to avoid conflicts
    local_path = os.path.join(local_dir, os.path.basename(s3_path))

    try:
        # 1. Download
        if not download_from_s3(bucket_name, s3_path, local_path):
            return

        # 2. Load and Chunk
        chunks = load_and_chunk_document(local_path)
        if not chunks:
            return

        # 3. Initialize Pinecone
        pc = initialize_pinecone()

        # 4. Process and Upsert
        process_and_upsert_chunks(pc, chunks, organization_id, s3_path)

        print(f"Successfully completed processing for document: {s3_path}")

    except Exception as e:
        print(f"A critical error occurred during document processing for {s3_path}: {e}")
    finally:
        # 5. Cleanup the downloaded file
        if os.path.exists(local_path):
            os.remove(local_path)
            print(f"Cleaned up temporary file: {local_path}")

from langchain_openai import ChatOpenAI
from langchain.prompts import PromptTemplate
from langchain.schema.runnable import RunnablePassthrough
from langchain.schema.output_parser import StrOutputParser

def get_query_response_stream(pinecone_index, query: str, organization_id: str):
    """
    Performs the RAG chain: retrieve context, create prompt, get model response.
    Returns a stream generator.
    """
    embeddings = OpenAIEmbeddings(openai_api_key=os.getenv("OPENAI_API_KEY"))

    # 1. Retrieve relevant documents from Pinecone
    query_embedding = embeddings.embed_query(query)
    retrieved_docs = pinecone_index.query(
        vector=query_embedding,
        top_k=5,
        filter={"organization_id": organization_id}
    )
    context = " ".join([match['metadata']['text'] for match in retrieved_docs['matches']])

    # 2. Define the prompt template
    template = """
    You are an assistant for answering questions about company documents.
    Use the following pieces of retrieved context to answer the question.
    If you don't know the answer, just say that you don't know.
    Use three sentences maximum and keep the answer concise and helpful.

    Question: {question}

    Context: {context}

    Answer:
    """
    prompt = PromptTemplate.from_template(template)

    # 3. Define the LLM
    llm = ChatOpenAI(model_name="gpt-3.5-turbo", temperature=0, openai_api_key=os.getenv("OPENAI_API_KEY"))

    # 4. Construct the RAG chain
    rag_chain = (
        {"context": lambda x: context, "question": RunnablePassthrough()}
        | prompt
        | llm
        | StrOutputParser()
    )

    # 5. Return the streaming response
    return rag_chain.stream(query)
