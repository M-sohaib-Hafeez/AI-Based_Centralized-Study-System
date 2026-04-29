from pydantic import BaseModel
from typing import List, Optional, Dict, Any
from enum import Enum


class ContentType(str, Enum):
    PDF   = "pdf"
    IMAGE = "image"
    PPT   = "ppt"
    DOCX  = "docx"
    VIDEO = "video"
    TEXT  = "text"


class AnalysisType(str, Enum):
    FULL        = "full"
    SUMMARIZE   = "summarize"
    TAG         = "tag"
    KEYWORDS    = "keywords"
    DIFFICULTY  = "difficulty"
    OCR         = "ocr"
    QUESTIONS   = "questions"
    PLAGIARISM  = "plagiarism"


class DifficultyLevel(str, Enum):
    BEGINNER     = "Beginner"
    INTERMEDIATE = "Intermediate"
    ADVANCED     = "Advanced"


class PracticeQuestion(BaseModel):
    question:      str
    options:       Optional[List[str]] = None  # A,B,C,D for MCQ
    answer:        Optional[str]       = None  # Correct answer
    question_type: str                 = "open"  # "mcq" or "open"


class DocxEditRequest(BaseModel):
    action:      str             # "add_summary","add_tags","replace_text","add_watermark","add_toc"
    content:     str             # AI text to insert
    target_text: Optional[str]  = None   # for replace_text
    replacement: Optional[str]  = None   # for replace_text


class AnalysisResponse(BaseModel):
    file_name:    str
    content_type: str

    # Core AI
    summary:    Optional[str] = None
    tags:       List[str]     = []
    keywords:   List[str]     = []
    difficulty: Optional[str] = None
    ocr_text:   Optional[str] = None
    topics:     List[str]     = []
    language:   Optional[str] = None

    # Extended AI (new)
    practice_questions: List[PracticeQuestion] = []
    plagiarism_score:   Optional[float]        = None
    plagiarism_note:    Optional[str]          = None
    recommendations:    List[str]              = []
    quality_score:      Optional[float]        = None
    quality_note:       Optional[str]          = None

    # DOCX-specific (new)
    docx_metadata: Optional[Dict[str, Any]] = None
    headings:      List[str]                = []
    tables_count:  Optional[int]            = None
    images_count:  Optional[int]            = None

    # Meta
    suggested_year: Optional[str] = None
    confidence:     float         = 0.0
    word_count:     Optional[int] = None
    page_count:     Optional[int] = None
    status:         str           = "success"
    error_message:  Optional[str] = None


class DocxManipulationResponse(BaseModel):
    status:           str
    action_performed: str
    file_name:        str
    modified_file:    Optional[str] = None  # base64-encoded modified DOCX
    error_message:    Optional[str] = None


class BatchAnalysisResponse(BaseModel):
    total:      int
    successful: int
    failed:     int
    results:    List[AnalysisResponse]


class HealthResponse(BaseModel):
    status:            str
    service:           str
    openai_configured: bool
    version:           str
    supported_formats: List[str]
