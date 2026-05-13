# Stratum Intelligence: The Robotic Butler 🤖

This service is the "Brain" of Stratum. It is a standalone **FastAPI** service dedicated to RAG (Retrieval-Augmented Generation) and Organizational Auditing.

---

## 🧠 The "Robotic Butler" Concept

The Butler is more than a chatbot. Its goal is **Proactive Organizational Maintenance**. It uses the "Superior Priority" context to provide intelligent assistance:

- **Contextual Retrieval**: When a user asks a question, the Butler doesn't just search "the database." It searches the user's **Hierarchical Sandbox**. It only retrieves documents the user has the "Priority" to see.
- **Structural Auditing**: (Upcoming Feature) The AI scans the "Organizational Web" to find inefficiencies, such as:
    - *Under-managed departments.*
    - *Lack of documentation for key technical roles.*
    - *Overloaded managers with too many direct reports.*

---

## 🛠️ The Tech Stack

- **Orchestration**: LangChain.
- **Model**: Google Gemini (Flash 1.5) for high-speed, cost-effective reasoning.
- **Embeddings**: Google Generative AI Embeddings.
- **Vector Storage**: 
    - **Pinecone**: For large-scale production indexing.
    - **Supabase pgvector**: For localized, organization-specific lookups.

---

## ⚡ The Pipeline

1. **Ingestion**: Documents are uploaded via the Backend, then passed to this service.
2. **Chunking**: Uses `RecursiveCharacterTextSplitter` to maintain semantic meaning.
3. **Vectorization**: Documents are converted into 768-dimensional vectors.
4. **Upsert**: Vectors are stored in Pinecone with metadata including `organization_id` and `department_id` to enforce the hierarchy during retrieval.

---

## 📡 Endpoints

- `POST /ingest`: Processes raw documents into the vector store.
- `POST /query`: The main entry point for the chat. Supports streaming responses.
- `GET /health`: Checks connection to Pinecone and the Gemini API.

---

## 🚀 Running Locally

1. **Virtual Env**: `python -m venv venv && source venv/bin/activate`
2. **Install**: `pip install -r requirements.txt`
3. **Run**: `uvicorn main:app --reload --port 8001`

*The Robotic Butler ensures that your organization is not just structured, but intelligent.*
