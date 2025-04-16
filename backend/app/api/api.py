from fastapi import APIRouter

from app.api.endpoints import auth, books, guides, chat

api_router = APIRouter()

api_router.include_router(auth.router, prefix="/auth", tags=["auth"])
api_router.include_router(books.router, prefix="/books", tags=["books"])
api_router.include_router(guides.router, prefix="/guides", tags=["guides"])
api_router.include_router(chat.router, prefix="/chat", tags=["chat"])
