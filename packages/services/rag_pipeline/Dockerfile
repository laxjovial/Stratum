# Stage 1: Build stage with full build dependencies
FROM python:3.11-slim as builder

WORKDIR /usr/src/app

# Install build dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

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
COPY . .

# Create a non-root user and switch to it
RUN useradd -m stratum && chown -R stratum:stratum /app
USER stratum

# The port the application will run on
EXPOSE 8001

# Command to run the application
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8001"]
