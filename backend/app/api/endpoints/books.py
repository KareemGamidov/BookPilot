import os
import json
from typing import List, Dict, Any, Optional
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, BackgroundTasks, status
from sqlalchemy.orm import Session
from uuid import UUID

from app.db.session import get_db
from app.models import models, schemas
from app.core.auth import get_current_active_user
from app.utils.file_utils import save_upload_file, get_file_size, get_file_type, is_valid_file_type
from app.services.book_service import process_book

router = APIRouter()

@router.post("/", response_model=schemas.Book)
async def upload_book(
    background_tasks: BackgroundTasks,
    title: str = Form(...),
    author: Optional[str] = Form(None),
    file: UploadFile = File(...),
    current_user: models.User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Upload a new book file and create a book record.
    The book processing will be done in the background.
    """
    # Check file type
    if not file.filename:
        raise HTTPException(status_code=400, detail="No file provided")
    
    file_extension = os.path.splitext(file.filename)[1].lower()
    if file_extension not in ['.pdf', '.epub', '.txt']:
        raise HTTPException(status_code=400, detail="Unsupported file type. Only PDF, EPUB, and TXT are supported.")
    
    # Save file
    file_path = await save_upload_file(file, folder=str(current_user.id))
    
    # Get file info
    file_size = get_file_size(file_path)
    file_type = get_file_type(file_path)
    
    # Create book record
    db_book = models.Book(
        user_id=current_user.id,
        title=title,
        author=author,
        file_url=file_path,
        file_type=file_type,
        file_size=file_size,
        status="uploaded"
    )
    
    db.add(db_book)
    db.commit()
    db.refresh(db_book)
    
    # Start processing in background
    background_tasks.add_task(process_book_task, db_book.id, file_path, title, author, db)
    
    return db_book

@router.get("/", response_model=List[schemas.Book])
def get_books(
    current_user: models.User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Get all books for the current user.
    """
    books = db.query(models.Book).filter(models.Book.user_id == current_user.id).all()
    return books

@router.get("/{book_id}", response_model=schemas.Book)
def get_book(
    book_id: UUID,
    current_user: models.User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Get a specific book by ID.
    """
    book = db.query(models.Book).filter(
        models.Book.id == book_id,
        models.Book.user_id == current_user.id
    ).first()
    
    if not book:
        raise HTTPException(status_code=404, detail="Book not found")
    
    return book

@router.delete("/{book_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_book(
    book_id: UUID,
    current_user: models.User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Delete a book by ID.
    """
    book = db.query(models.Book).filter(
        models.Book.id == book_id,
        models.Book.user_id == current_user.id
    ).first()
    
    if not book:
        raise HTTPException(status_code=404, detail="Book not found")
    
    # Delete the book record (cascade will delete related records)
    db.delete(book)
    db.commit()
    
    # Note: We're not deleting the actual file here for simplicity
    # In a production environment, you would also delete the file
    
    return None

@router.post("/{book_id}/process", response_model=schemas.Book)
def process_book_endpoint(
    book_id: UUID,
    background_tasks: BackgroundTasks,
    current_user: models.User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Process a book that was previously uploaded.
    """
    book = db.query(models.Book).filter(
        models.Book.id == book_id,
        models.Book.user_id == current_user.id
    ).first()
    
    if not book:
        raise HTTPException(status_code=404, detail="Book not found")
    
    if book.status == "processing":
        raise HTTPException(status_code=400, detail="Book is already being processed")
    
    if book.status == "processed":
        raise HTTPException(status_code=400, detail="Book has already been processed")
    
    # Update book status
    book.status = "processing"
    db.commit()
    db.refresh(book)
    
    # Start processing in background
    background_tasks.add_task(
        process_book_task, 
        book.id, 
        book.file_url, 
        book.title, 
        book.author, 
        db
    )
    
    return book

async def process_book_task(
    book_id: UUID,
    file_path: str,
    title: str,
    author: Optional[str],
    db: Session
):
    """
    Background task to process a book and generate a guide.
    """
    try:
        # Get book from database
        book = db.query(models.Book).filter(models.Book.id == book_id).first()
        if not book:
            print(f"Book {book_id} not found")
            return
        
        # Update book status
        book.status = "processing"
        db.commit()
        
        # Process book
        guide_content = process_book(file_path, title, author)
        
        # Parse JSON content if it's a string
        if isinstance(guide_content, str):
            guide_content = json.loads(guide_content)
        
        # Create guide record
        db_guide = models.Guide(
            book_id=book_id,
            user_id=book.user_id,
            json_content=guide_content,
            progress={"completed_chapters": [], "completed_tasks": [], "quiz_results": None}
        )
        
        db.add(db_guide)
        
        # Update book status
        book.status = "processed"
        db.commit()
        
    except Exception as e:
        # Update book status to error
        book = db.query(models.Book).filter(models.Book.id == book_id).first()
        if book:
            book.status = "error"
            db.commit()
        
        print(f"Error processing book {book_id}: {e}")
