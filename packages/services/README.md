# Stratum Services

This package contains auxiliary services that support the main Stratum application, primarily focusing on AI and data processing.

## Architecture

- `rag_pipeline/`: The service responsible for the Retrieval-Augmented Generation (RAG) pipeline. This processes documents, generates embeddings, and handles context-aware search queries.

## External Services & Setup

The RAG pipeline requires external API keys to function. Create a `.env` file in `packages/services/rag_pipeline` and fill out the following keys:

1. **OpenAI API Key** (`OPENAI_API_KEY`):
   - Used for generating embeddings and language models.
   - Obtain from [OpenAI Developer Platform](https://platform.openai.com/api-keys).

2. **Pinecone API Key** (`PINECONE_API_KEY` & `PINECONE_ENVIRONMENT`):
   - Used as the vector database for document search.
   - Obtain from the [Pinecone Console](https://app.pinecone.io/) under "API Keys".

Example `.env`:
```env
OPENAI_API_KEY="sk-your-openai-api-key"
PINECONE_API_KEY="your-pinecone-api-key"
PINECONE_ENVIRONMENT="us-west1-gcp"
```
