# System Architecture

This document provides a high-level overview of the technical architecture for the Stratum platform.

## 1. Architectural Philosophy

Stratum is built using a modern, scalable, and maintainable architecture based on a **monorepo** structure and a **microservices-oriented approach**. The system is divided into three primary components: a frontend application, a backend API, and a set of specialized services. This separation of concerns allows for independent development, deployment, and scaling of each part of the platform.

## 2. Technology Stack

*   **Frontend:**
    *   Framework: Next.js (React)
    *   Styling: Tailwind CSS
    *   State Management: Zustand / React Context
    *   Authentication: Firebase Client SDK

*   **Backend:**
    *   Framework: FastAPI (Python)
    *   Database: PostgreSQL
    *   ORM: SQLAlchemy
    *   Authentication: Firebase Admin SDK

*   **AI Services:**
    *   Language: Python
    *   Core Library: LangChain
    *   Vector Database: Pinecone
    *   Embeddings Model: OpenAI API

*   **Infrastructure:**
    *   Frontend Hosting: Vercel
    *   Backend & Services Hosting: Railway / Fly.io
    *   File Storage: AWS S3
    *   Payments: Stripe

## 3. System Components Diagram

The following diagram illustrates the flow of requests and data between the various components of the Stratum ecosystem.

```mermaid
graph TD
    subgraph User
        A[Browser]
    end

    subgraph "Frontend (Vercel)"
        B[Next.js App]
    end

    subgraph "Authentication"
        C[Firebase Auth]
    end

    subgraph "Backend (Railway/Fly.io)"
        D[FastAPI Server]
        E[PostgreSQL DB]
        D -- "Reads/Writes" --> E
    end

    subgraph "AI Pipeline"
        F[RAG Service]
        G[File Storage (S3)]
        H[Vector DB (Pinecone)]
        I[OpenAI API]
        F -- "Stores/Retrieves Docs" --> G
        F -- "Generates & Stores Embeddings" --> H
        F -- "Generates Embeddings" --> I
    end

    subgraph "Payments"
        J[Stripe API]
    end

    A -- "Interacts with UI" --> B
    B -- "Auth Requests (Login/Signup)" --> C
    C -- "Returns JWT Token" --> B
    B -- "Authenticated API Calls (with JWT)" --> D
    D -- "Verifies JWT" --> C
    D -- "Triggers Doc Processing" --> F
    D -- "RAG Queries" --> F
    D -- "Manages Subscriptions" --> J
```

## 4. Data Flow Descriptions

*   **User Authentication:** The user signs in via the Next.js frontend using the Firebase Client SDK. Firebase returns a JWT, which is attached to all subsequent API requests to the backend. The FastAPI backend verifies the JWT using the Firebase Admin SDK on protected endpoints.

*   **Document Upload & RAG Pipeline:**
    1.  An admin uploads a document via the frontend.
    2.  The backend API receives the file and securely uploads it to AWS S3.
    3.  The backend sends a message to the RAG Service, notifying it of the new file.
    4.  The RAG Service fetches the document from S3, chunks it into smaller pieces, calls the OpenAI API to generate embeddings for each chunk, and stores these embeddings in the Pinecone vector database, tagged with the organization's ID.

*   **AI-Powered Chat:**
    1.  An employee asks a question in the frontend chat interface.
    2.  The request is sent to the backend.
    3.  The backend queries the RAG Service with the user's question and their `organization_id`.
    4.  The RAG Service generates an embedding for the question, queries Pinecone to find the most relevant document chunks for that organization, and then sends the question and the retrieved context to an OpenAI completion model to generate a natural language answer.
    5.  The answer is streamed back to the user.
