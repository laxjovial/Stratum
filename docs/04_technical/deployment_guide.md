# Deployment Guide (Initial Draft)

This document outlines the strategy and procedures for deploying the Stratum application.

## 1. Overview

The Stratum platform consists of three main deployable components housed in a single monorepo:
1.  **Frontend (Next.js)**
2.  **Backend (FastAPI)**
3.  **RAG Service (Python)**

We will use a multi-container approach, deploying each component to a hosting provider best suited for its needs. Continuous Integration and Continuous Deployment (CI/CD) will be managed via GitHub Actions.

## 2. Local Development

For local development, a `docker-compose.yml` file will be provided in the root of the repository. This will allow developers to spin up the entire stack (frontend, backend, database, and services) with a single command.

**Command:** `docker-compose up`

## 3. Frontend Deployment (Next.js)

*   **Hosting Provider:** **Vercel**
*   **Reasoning:** Vercel offers a seamless, first-class experience for deploying Next.js applications, with features like automatic deployments on git push, preview deployments for pull requests, and a global CDN.

*   **Setup Steps:**
    1.  Create a new project on Vercel.
    2.  Connect the Vercel project to the GitHub repository.
    3.  Configure the **Root Directory** in Vercel's project settings to be `packages/frontend`. This tells Vercel where to find the Next.js application within the monorepo.
    4.  Set up environment variables in the Vercel dashboard.

*   **Required Environment Variables:**
    *   `NEXT_PUBLIC_FIREBASE_CONFIG`: The JSON configuration for the Firebase client SDK.
    *   `NEXT_PUBLIC_API_URL`: The public URL of our deployed backend API (e.g., `https://api.stratum.app/api/v1`).

## 4. Backend & Services Deployment (FastAPI & Python)

*   **Hosting Provider:** **Railway** or **Fly.io**
*   **Reasoning:** These platforms provide excellent support for containerized applications, managed databases, and easy configuration of environment variables. They are developer-friendly and cost-effective for this type of architecture.

*   **Containerization:**
    *   A `Dockerfile` will be created for the FastAPI backend (`packages/backend/Dockerfile`).
    *   A `Dockerfile` will be created for the RAG Service (`packages/services/rag_pipeline/Dockerfile`).

*   **Setup Steps (General):**
    1.  Create a new project on the chosen platform (e.g., Railway).
    2.  Configure the project to deploy from the GitHub repository.
    3.  Define two separate services within the project, pointing each to its respective `Dockerfile` in the monorepo.
    4.  Provision a managed PostgreSQL database service.
    5.  Set up environment variables for both the backend and the RAG service.

*   **Required Environment Variables (Backend):**
    *   `DATABASE_URL`: The connection string for the PostgreSQL database.
    *   `FIREBASE_SERVICE_ACCOUNT_KEY`: The JSON key for the Firebase Admin SDK.
    *   `PINECONE_API_KEY`: API key for Pinecone.
    *   `OPENAI_API_KEY`: API key for OpenAI.
    *   `S3_BUCKET_NAME`, `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`: Credentials for the file storage bucket.

*   **Required Environment Variables (RAG Service):**
    *   (Similar to backend: Pinecone, OpenAI, and AWS credentials).

## 5. CI/CD Pipeline

A workflow will be defined in `.github/workflows/ci_cd.yml`.

*   **On Pull Request:** The workflow will run linters and tests (once implemented) for all packages. It will not deploy.
*   **On Merge to `main`:**
    *   The workflow will trigger Vercel to deploy the `frontend` package.
    *   The workflow will build and push the `backend` and `rag_service` Docker images to a container registry (e.g., Docker Hub or GitHub Container Registry).
    *   The workflow will then trigger a deployment on the hosting provider (e.g., Railway) to pull the new images and restart the services.

---
*(This is an initial guide. Specific commands and configurations will be added as the project is developed.)*
