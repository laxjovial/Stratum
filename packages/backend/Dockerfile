# Stage 1: Build stage with full build dependencies
FROM python:3.11 as builder

WORKDIR /usr/src/app

# Install build dependencies
RUN apt-get update && apt-get install -y --no-install-recommends build-essential

# Install python dependencies
COPY requirements.txt .
RUN pip wheel --no-cache-dir --wheel-dir /usr/src/app/wheels -r requirements.txt


# Stage 2: Final stage with slim image
FROM python:3.11-slim

WORKDIR /app

# Copy python dependencies from builder stage
COPY --from=builder /usr/src/app/wheels /wheels
RUN pip install --no-cache /wheels/*

# Copy application code
COPY ./src ./src
COPY ./.env ./.env

# The port the application will run on
EXPOSE 8000

# Command to run the application
# Use --reload for development, but not for production
CMD ["uvicorn", "src.main:app", "--host", "0.0.0.0", "--port", "8000"]
