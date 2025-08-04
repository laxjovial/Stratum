from fastapi import FastAPI
from . import models
from .db.database import engine
from .api import auth, organizations, users, departments, setup

# This creates all the tables defined as models in the database.
# In a production environment, you would use a migration tool like Alembic.
models.Base.metadata.create_all(bind=engine)


app = FastAPI(
    title="Stratum API",
    description="The backend API for the Stratum B2B SaaS platform.",
    version="0.1.0",
)

# Include API routers
app.include_router(auth.router)
app.include_router(organizations.router)
app.include_router(users.router)
app.include_router(departments.router)
app.include_router(setup.router)


@app.get("/")
def read_root():
    """A simple endpoint to confirm the API is running."""
    return {"message": "Welcome to the Stratum API"}

@app.get("/health")
def health_check():
    """Health check endpoint for monitoring."""
    return {"status": "ok"}
