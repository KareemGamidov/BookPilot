import os
from pydantic import BaseSettings
from typing import Optional, Dict, Any, List

class Settings(BaseSettings):
    PROJECT_NAME: str = "BookPilot"
    API_V1_STR: str = "/api/v1"
    SECRET_KEY: str = os.getenv("SECRET_KEY", "your-secret-key-here")
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days
    
    # OpenAI API
    OPENAI_API_KEY: str = os.getenv("OPENAI_API_KEY", "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")
    OPENAI_MODEL: str = "gpt-4"
    
    # Database
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./bookpilot.db")
    
    # CORS
    BACKEND_CORS_ORIGINS: List[str] = ["*"]
    
    # Supported languages
    SUPPORTED_LANGUAGES: List[str] = ["en", "es", "zh", "hi", "ru"]
    
    # Subscription plans
    SUBSCRIPTION_PLANS: Dict[str, Dict[str, Any]] = {
        "free": {
            "name": "Free",
            "price": 0,
            "book_limit": 3,
            "features": ["Basic guides", "Limited chat", "Web access"]
        },
        "standard": {
            "name": "Standard",
            "price": 9.99,
            "book_limit": 20,
            "features": ["Advanced guides", "Full chat", "PDF export", "Web & mobile access"]
        },
        "premium": {
            "name": "Premium",
            "price": 19.99,
            "book_limit": -1,  # Unlimited
            "features": ["Expert guides", "Priority chat", "PDF & EPUB export", "Knowledge maps", "All platforms", "Priority support"]
        }
    }
    
    class Config:
        env_file = ".env"
        case_sensitive = True

settings = Settings()
