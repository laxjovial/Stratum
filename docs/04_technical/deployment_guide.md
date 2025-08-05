
# Deployment Guide

This document provides detailed instructions for deploying the Stratum application.

## 1. Architecture Overview

The Stratum platform is a multi-service application orchestrated with Docker. It consists of three main services:

1.  **Frontend (Next.js)**
2.  **Backend (FastAPI)**
3.  **RAG Service (Python)**


A PostgreSQL database is required for the backend. For local development, these services are managed by the `docker-compose.yml` file in the root directory.

## 2. Local Development & Prerequisites

Before deploying, ensure you can run the application stack locally.

**Prerequisites:**
*   Docker and Docker Compose
*   An `.env` file in the root directory containing all necessary API keys (Pinecone, OpenAI, AWS, Stripe).

**To run locally:**
```bash
docker-compose up --build
```
This command will build the images for all services and start them.
*   Frontend will be accessible at `http://localhost:3000`
*   Backend API will be at `http://localhost:8000`
*   RAG Service will be at `http://localhost:8001`

## 3. Production Deployment Strategy

The recommended production deployment strategy involves deploying the services to cloud providers that specialize in container hosting.

*   **Frontend:** Vercel (for its first-class Next.js support)
*   **Backend & RAG Service:** Railway or Fly.io (for their ease of use with Docker containers)
*   **Database:** A managed PostgreSQL provider (e.g., Railway Postgres, AWS RDS, Supabase).

## 4. Step-by-Step Deployment

### Step 4.1: Deploying the Backend & RAG Service

These two services should be deployed together on a platform like Railway.

1.  **Create a new project** on Railway and link it to your GitHub repository.
2.  **Define the Services:**
    *   Create a **"Backend"** service. In its settings, point it to the `packages/backend/Dockerfile`. Railway will automatically build and deploy from this Dockerfile.
    *   Create a **"RAG Service"** service. Point it to the `packages/services/rag_pipeline/Dockerfile`.
3.  **Provision a PostgreSQL Database:**
    *   Add a new PostgreSQL database service within your Railway project.
    *   Railway will provide a `DATABASE_URL` connection string.
4.  **Configure Environment Variables:**
    *   In the "Variables" tab for your Railway project, add all the necessary secrets:
        *   `DATABASE_URL` (from the Postgres service)
        *   `RAG_SERVICE_URL` (this will be the internal URL provided by Railway for your RAG service, e.g., `rag-service.railway.internal`)
        *   `STRIPE_SECRET_KEY` & `STRIPE_WEBHOOK_SECRET`
        *   `GOOGLE_APPLICATION_CREDENTIALS` (the content of your service account JSON file)
        *   `PINECONE_API_KEY`, `OPENAI_API_KEY`, AWS keys, etc.
    *   These variables will be available to both the Backend and RAG services.
5.  **Deploy:** Trigger a deployment. Railway will build your containers and start the services. Note the public URL for your backend service (e.g., `https://stratum-backend-prod.up.railway.app`).

### Step 4.2: Deploying the Frontend

1.  **Create a new project** on Vercel and link it to your GitHub repository.
2.  **Configure Project Settings:**
    *   **Framework Preset:** Next.js
    *   **Root Directory:** `packages/frontend`
3.  **Configure Environment Variables:**
    *   In the Vercel project settings, add the following environment variables:
        *   `NEXT_PUBLIC_API_URL`: The public URL of your deployed backend service from Railway.
        *   `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`: Your Stripe publishable key.
        *   `NEXT_PUBLIC_FIREBASE_*`: All the necessary Firebase client-side configuration keys.
4.  **Deploy:** Vercel will automatically deploy the application. Any subsequent push to the `main` branch will trigger a new production deployment.

---
*This guide provides a high-level overview. Specific configurations may vary slightly based on the chosen cloud provider's UI and features.*
