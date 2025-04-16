from typing import List, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from uuid import UUID
from datetime import datetime

from app.db.session import get_db
from app.models import models, schemas
from app.core.auth import get_current_active_user
from app.services.book_service import generate_chat_response

router = APIRouter()

@router.get("/{book_id}/messages", response_model=List[schemas.ChatMessage])
def get_messages(
    book_id: UUID,
    current_user: models.User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Get all chat messages for a specific book.
    """
    # Check if book exists and belongs to user
    book = db.query(models.Book).filter(
        models.Book.id == book_id,
        models.Book.user_id == current_user.id
    ).first()
    
    if not book:
        raise HTTPException(status_code=404, detail="Book not found")
    
    # Get or create chat
    chat = db.query(models.Chat).filter(
        models.Chat.book_id == book_id,
        models.Chat.user_id == current_user.id
    ).first()
    
    if not chat:
        # Create new chat
        chat = models.Chat(
            book_id=book_id,
            user_id=current_user.id,
            messages=[]
        )
        db.add(chat)
        db.commit()
        db.refresh(chat)
    
    return chat.messages

@router.post("/{book_id}/messages", response_model=schemas.ChatMessage)
async def send_message(
    book_id: UUID,
    message: schemas.ChatMessageCreate,
    current_user: models.User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Send a message in the chat for a specific book and get AI response.
    """
    # Check if book exists and belongs to user
    book = db.query(models.Book).filter(
        models.Book.id == book_id,
        models.Book.user_id == current_user.id
    ).first()
    
    if not book:
        raise HTTPException(status_code=404, detail="Book not found")
    
    # Get or create chat
    chat = db.query(models.Chat).filter(
        models.Chat.book_id == book_id,
        models.Chat.user_id == current_user.id
    ).first()
    
    if not chat:
        # Create new chat
        chat = models.Chat(
            book_id=book_id,
            user_id=current_user.id,
            messages=[]
        )
        db.add(chat)
        db.commit()
        db.refresh(chat)
    
    # Add user message to chat
    user_message = {
        "role": message.role,
        "content": message.content,
        "timestamp": datetime.utcnow().isoformat()
    }
    
    messages = chat.messages
    messages.append(user_message)
    chat.messages = messages
    db.commit()
    
    # Get book text (in a real implementation, you would retrieve the actual book text)
    # For simplicity, we'll use a placeholder
    book_text = "This is a placeholder for the book text. In a real implementation, you would retrieve the actual text from the book file."
    
    # Generate AI response
    ai_response = generate_chat_response(book_text, chat.messages)
    
    # Add AI response to chat
    ai_message = {
        "role": "assistant",
        "content": ai_response,
        "timestamp": datetime.utcnow().isoformat()
    }
    
    messages = chat.messages
    messages.append(ai_message)
    chat.messages = messages
    db.commit()
    
    return ai_message
