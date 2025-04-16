import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.exc import SQLAlchemyError

from app.api.api import api_router
from app.core.config import PROJECT_NAME, API_V1_STR, CORS_ORIGINS
from app.db.session import engine, Base

# Create tables in the database
try:
    Base.metadata.create_all(bind=engine)
except SQLAlchemyError as e:
    print(f"Error creating database tables: {e}")

app = FastAPI(
    title=PROJECT_NAME,
    description="API for BookPilot - Transform book reading into structured, actionable learning through AI",
    version="0.1.0",
)

# Set up CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API router
app.include_router(api_router, prefix=API_V1_STR)

@app.get("/")
def root():
    return {
        "message": "Welcome to BookPilot API",
        "docs": "/docs",
        "version": "0.1.0"
    }

if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=True)
