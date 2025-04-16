from typing import List, Dict, Any, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from uuid import UUID

from app.db.session import get_db
from app.models import models, schemas
from app.core.auth import get_current_active_user

router = APIRouter()

@router.get("/{book_id}", response_model=schemas.Guide)
def get_guide(
    book_id: UUID,
    current_user: models.User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Get the guide for a specific book.
    """
    # Check if book exists and belongs to user
    book = db.query(models.Book).filter(
        models.Book.id == book_id,
        models.Book.user_id == current_user.id
    ).first()
    
    if not book:
        raise HTTPException(status_code=404, detail="Book not found")
    
    # Get guide
    guide = db.query(models.Guide).filter(
        models.Guide.book_id == book_id,
        models.Guide.user_id == current_user.id
    ).first()
    
    if not guide:
        raise HTTPException(status_code=404, detail="Guide not found")
    
    return guide

@router.patch("/{book_id}/progress", response_model=schemas.Guide)
def update_guide_progress(
    book_id: UUID,
    progress_update: schemas.GuideProgressUpdate,
    current_user: models.User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Update the progress for a guide.
    """
    # Check if book exists and belongs to user
    book = db.query(models.Book).filter(
        models.Book.id == book_id,
        models.Book.user_id == current_user.id
    ).first()
    
    if not book:
        raise HTTPException(status_code=404, detail="Book not found")
    
    # Get guide
    guide = db.query(models.Guide).filter(
        models.Guide.book_id == book_id,
        models.Guide.user_id == current_user.id
    ).first()
    
    if not guide:
        raise HTTPException(status_code=404, detail="Guide not found")
    
    # Update progress
    current_progress = guide.progress
    
    if progress_update.completed_chapters is not None:
        current_progress["completed_chapters"] = progress_update.completed_chapters
    
    if progress_update.completed_tasks is not None:
        current_progress["completed_tasks"] = progress_update.completed_tasks
    
    if progress_update.quiz_results is not None:
        current_progress["quiz_results"] = progress_update.quiz_results
    
    guide.progress = current_progress
    db.commit()
    db.refresh(guide)
    
    return guide

@router.get("/{book_id}/quiz", response_model=List[schemas.QuizQuestion])
def get_quiz(
    book_id: UUID,
    current_user: models.User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Get the quiz for a specific book.
    """
    # Check if book exists and belongs to user
    book = db.query(models.Book).filter(
        models.Book.id == book_id,
        models.Book.user_id == current_user.id
    ).first()
    
    if not book:
        raise HTTPException(status_code=404, detail="Book not found")
    
    # Get guide
    guide = db.query(models.Guide).filter(
        models.Guide.book_id == book_id,
        models.Guide.user_id == current_user.id
    ).first()
    
    if not guide:
        raise HTTPException(status_code=404, detail="Guide not found")
    
    # Return quiz from guide content
    return guide.json_content.get("quiz", [])

@router.post("/{book_id}/quiz/results", response_model=schemas.Guide)
def submit_quiz_results(
    book_id: UUID,
    results: Dict[str, Any],
    current_user: models.User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Submit quiz results for a guide.
    """
    # Check if book exists and belongs to user
    book = db.query(models.Book).filter(
        models.Book.id == book_id,
        models.Book.user_id == current_user.id
    ).first()
    
    if not book:
        raise HTTPException(status_code=404, detail="Book not found")
    
    # Get guide
    guide = db.query(models.Guide).filter(
        models.Guide.book_id == book_id,
        models.Guide.user_id == current_user.id
    ).first()
    
    if not guide:
        raise HTTPException(status_code=404, detail="Guide not found")
    
    # Update progress with quiz results
    current_progress = guide.progress
    current_progress["quiz_results"] = results
    
    guide.progress = current_progress
    db.commit()
    db.refresh(guide)
    
    return guide

@router.post("/{book_id}/export", response_model=schemas.Export)
def export_guide(
    book_id: UUID,
    export_data: schemas.ExportCreate,
    current_user: models.User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Export a guide to PDF or other format.
    """
    # Check if book exists and belongs to user
    book = db.query(models.Book).filter(
        models.Book.id == book_id,
        models.Book.user_id == current_user.id
    ).first()
    
    if not book:
        raise HTTPException(status_code=404, detail="Book not found")
    
    # Get guide
    guide = db.query(models.Guide).filter(
        models.Guide.book_id == book_id,
        models.Guide.user_id == current_user.id
    ).first()
    
    if not guide:
        raise HTTPException(status_code=404, detail="Guide not found")
    
    # TODO: Implement actual PDF generation
    # For now, just create a placeholder export record
    
    export = models.Export(
        guide_id=guide.id,
        user_id=current_user.id,
        format=export_data.format,
        file_url="/path/to/exported/file.pdf"  # Placeholder
    )
    
    db.add(export)
    db.commit()
    db.refresh(export)
    
    return export
