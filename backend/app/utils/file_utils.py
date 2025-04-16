import os
import shutil
import uuid
from pathlib import Path
from typing import List, Optional
from fastapi import UploadFile

from app.core.config import UPLOAD_DIR, EXPORT_DIR

async def save_upload_file(file: UploadFile, folder: str = "") -> str:
    """
    Save an uploaded file to the specified folder and return the file path.
    
    Args:
        file: The uploaded file
        folder: Optional subfolder within the upload directory
    
    Returns:
        The path to the saved file
    """
    # Create folder if it doesn't exist
    save_dir = UPLOAD_DIR
    if folder:
        save_dir = save_dir / folder
        os.makedirs(save_dir, exist_ok=True)
    
    # Generate a unique filename
    file_extension = os.path.splitext(file.filename)[1]
    unique_filename = f"{uuid.uuid4()}{file_extension}"
    file_path = save_dir / unique_filename
    
    # Save the file
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    
    return str(file_path)

def get_file_size(file_path: str) -> int:
    """
    Get the size of a file in bytes.
    
    Args:
        file_path: Path to the file
    
    Returns:
        Size of the file in bytes
    """
    return os.path.getsize(file_path)

def get_file_type(file_path: str) -> str:
    """
    Get the file type from the file extension.
    
    Args:
        file_path: Path to the file
    
    Returns:
        File type (extension without the dot)
    """
    return os.path.splitext(file_path)[1][1:].lower()

def is_valid_file_type(file_path: str, allowed_types: List[str]) -> bool:
    """
    Check if the file type is allowed.
    
    Args:
        file_path: Path to the file
        allowed_types: List of allowed file types
    
    Returns:
        True if the file type is allowed, False otherwise
    """
    return get_file_type(file_path) in allowed_types

def create_export_file(content: str, filename: str, format: str = "pdf") -> str:
    """
    Create an export file with the given content and return the file path.
    
    Args:
        content: Content to write to the file
        filename: Base filename (without extension)
        format: File format (extension)
    
    Returns:
        The path to the created file
    """
    # Create export directory if it doesn't exist
    os.makedirs(EXPORT_DIR, exist_ok=True)
    
    # Generate a unique filename
    unique_filename = f"{filename}_{uuid.uuid4()}.{format}"
    file_path = EXPORT_DIR / unique_filename
    
    # Write content to file
    with open(file_path, "w", encoding="utf-8") as f:
        f.write(content)
    
    return str(file_path)

def delete_file(file_path: str) -> bool:
    """
    Delete a file.
    
    Args:
        file_path: Path to the file
    
    Returns:
        True if the file was deleted, False otherwise
    """
    try:
        os.remove(file_path)
        return True
    except (FileNotFoundError, PermissionError):
        return False
