from typing import Optional, List, Dict, Any, Union
from uuid import UUID
from datetime import datetime
from pydantic import BaseModel, EmailStr, Field, validator


# User schemas
class UserBase(BaseModel):
    email: EmailStr


class UserCreate(UserBase):
    provider: str = "email"


class UserInDB(UserBase):
    id: UUID
    provider: str
    created_at: datetime
    last_login: Optional[datetime] = None

    class Config:
        orm_mode = True


class User(UserInDB):
    pass


# Token schemas
class Token(BaseModel):
    access_token: str
    token_type: str


class TokenData(BaseModel):
    email: Optional[str] = None
    user_id: Optional[UUID] = None


# Book schemas
class BookBase(BaseModel):
    title: str
    author: Optional[str] = None


class BookCreate(BookBase):
    pass


class BookInDB(BookBase):
    id: UUID
    user_id: UUID
    file_url: str
    file_type: str
    file_size: int
    status: str
    created_at: datetime
    updated_at: datetime

    class Config:
        orm_mode = True


class Book(BookInDB):
    pass


# Guide schemas
class ChapterContent(BaseModel):
    title: str
    summary: str
    questions: List[str]
    task: str


class SynthesisContent(BaseModel):
    key_takeaways: List[str]
    action_plan: str


class QuizQuestion(BaseModel):
    question: str
    options: List[str]
    correct_answer: int


class GuideContent(BaseModel):
    title: str
    author: Optional[str] = None
    toc: List[str]
    chapters: List[ChapterContent]
    synthesis: SynthesisContent
    quiz: List[QuizQuestion]


class GuideProgress(BaseModel):
    completed_chapters: List[int] = Field(default_factory=list)
    completed_tasks: List[int] = Field(default_factory=list)
    quiz_results: Optional[Dict[str, Any]] = None


class GuideBase(BaseModel):
    json_content: GuideContent
    progress: GuideProgress = Field(default_factory=GuideProgress)


class GuideCreate(GuideBase):
    book_id: UUID
    user_id: UUID


class GuideInDB(GuideBase):
    id: UUID
    book_id: UUID
    user_id: UUID
    created_at: datetime
    updated_at: datetime

    class Config:
        orm_mode = True


class Guide(GuideInDB):
    pass


class GuideProgressUpdate(BaseModel):
    completed_chapters: Optional[List[int]] = None
    completed_tasks: Optional[List[int]] = None
    quiz_results: Optional[Dict[str, Any]] = None


# Highlight schemas
class HighlightBase(BaseModel):
    content: str
    page_number: Optional[int] = None
    source: str = "manual"


class HighlightCreate(HighlightBase):
    book_id: UUID


class HighlightInDB(HighlightBase):
    id: UUID
    book_id: UUID
    user_id: UUID
    created_at: datetime

    class Config:
        orm_mode = True


class Highlight(HighlightInDB):
    pass


# Chat schemas
class ChatMessage(BaseModel):
    role: str
    content: str
    timestamp: datetime = Field(default_factory=datetime.utcnow)


class ChatBase(BaseModel):
    messages: List[ChatMessage] = Field(default_factory=list)


class ChatCreate(ChatBase):
    book_id: UUID


class ChatInDB(ChatBase):
    id: UUID
    book_id: UUID
    user_id: UUID
    created_at: datetime
    updated_at: datetime

    class Config:
        orm_mode = True


class Chat(ChatInDB):
    pass


class ChatMessageCreate(BaseModel):
    role: str
    content: str


# Export schemas
class ExportBase(BaseModel):
    format: str


class ExportCreate(ExportBase):
    guide_id: UUID


class ExportInDB(ExportBase):
    id: UUID
    guide_id: UUID
    user_id: UUID
    file_url: str
    created_at: datetime

    class Config:
        orm_mode = True


class Export(ExportInDB):
    pass


# File upload schemas
class FileUpload(BaseModel):
    title: str
    author: Optional[str] = None
