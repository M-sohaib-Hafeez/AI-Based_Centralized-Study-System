import logging
from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from typing import Optional

from app.models.schemas import DocxManipulationResponse
from app.utils.docx_utils import (
    add_summary_to_docx,
    add_tags_to_docx,
    add_keywords_to_docx,
    replace_text_in_docx,
    add_watermark_text_to_docx,
    add_table_of_contents_to_docx,
    add_ai_analysis_report_to_docx,
    bytes_to_base64,
)
from app.services.file_service import _process_docx

logger = logging.getLogger(__name__)
router = APIRouter()


# ─────────────────────────────────────────────────────────────────────────────
# POST /api/docx/analyze
# Analyze a DOCX file — same as /api/analyze but dedicated for DOCX
# ─────────────────────────────────────────────────────────────────────────────

@router.post("/docx/analyze")
async def analyze_docx(
    file: UploadFile = File(..., description="DOCX file to analyze"),
):
    """
    ## Analyze a DOCX File

    Extracts text, headings, tables, metadata from the DOCX,
    then runs full AI analysis: summary, tags, keywords, difficulty,
    practice questions, plagiarism check, quality score.

    Returns all results as JSON — same shape as /api/analyze.
    """
    if not file.filename or not file.filename.lower().endswith((".doc", ".docx")):
        raise HTTPException(status_code=400, detail="File must be a .docx or .doc file")

    file_bytes = await file.read()
    if not file_bytes:
        raise HTTPException(status_code=400, detail="Uploaded file is empty")

    return _process_docx(file_bytes, file.filename)


# ─────────────────────────────────────────────────────────────────────────────
# POST /api/docx/add-summary
# Insert AI summary at the TOP of the DOCX
# ─────────────────────────────────────────────────────────────────────────────

@router.post("/docx/add-summary", response_model=DocxManipulationResponse)
async def docx_add_summary(
    file:    UploadFile = File(..., description="Original DOCX file"),
    summary: str        = Form(..., description="AI-generated summary text to insert"),
):
    """
    ## Add Summary to DOCX

    Inserts a formatted 'AI-Generated Summary' section
    at the very top of the document.

    Spring Boot workflow:
    1. Call /api/analyze to get the summary text
    2. Call this endpoint with the file + summary
    3. Receive base64-encoded modified DOCX
    4. Save the modified DOCX to storage
    """
    file_bytes = await file.read()
    modified   = add_summary_to_docx(file_bytes, summary)
    return _build_response(modified, file.filename, "add_summary")


# ─────────────────────────────────────────────────────────────────────────────
# POST /api/docx/add-tags
# Append AI tags section at the END of the DOCX
# ─────────────────────────────────────────────────────────────────────────────

@router.post("/docx/add-tags", response_model=DocxManipulationResponse)
async def docx_add_tags(
    file: UploadFile = File(..., description="Original DOCX file"),
    tags: str        = Form(..., description="Comma-separated tags e.g. 'Machine Learning,AI,Python'"),
):
    """
    ## Add Tags to DOCX

    Appends a formatted tags section at the end of the document.
    Pass tags as a comma-separated string.
    """
    file_bytes = await file.read()
    tag_list   = [t.strip() for t in tags.split(",") if t.strip()]
    modified   = add_tags_to_docx(file_bytes, tag_list)
    return _build_response(modified, file.filename, "add_tags")


# ─────────────────────────────────────────────────────────────────────────────
# POST /api/docx/add-keywords
# Append keywords section at the END of the DOCX
# ─────────────────────────────────────────────────────────────────────────────

@router.post("/docx/add-keywords", response_model=DocxManipulationResponse)
async def docx_add_keywords(
    file:     UploadFile = File(..., description="Original DOCX file"),
    keywords: str        = Form(..., description="Comma-separated keywords"),
):
    """
    ## Add Keywords to DOCX

    Appends an 'AI-Extracted Keywords' section at the end of the document.
    """
    file_bytes   = await file.read()
    keyword_list = [k.strip() for k in keywords.split(",") if k.strip()]
    modified     = add_keywords_to_docx(file_bytes, keyword_list)
    return _build_response(modified, file.filename, "add_keywords")


# ─────────────────────────────────────────────────────────────────────────────
# POST /api/docx/replace-text
# Find and replace text throughout the DOCX
# ─────────────────────────────────────────────────────────────────────────────

@router.post("/docx/replace-text", response_model=DocxManipulationResponse)
async def docx_replace_text(
    file:        UploadFile = File(..., description="Original DOCX file"),
    find_text:   str        = Form(..., description="Text to find"),
    replace_with: str       = Form(..., description="Text to replace with"),
):
    """
    ## Find & Replace Text in DOCX

    Finds all occurrences of a phrase throughout the document
    (including inside tables) and replaces with new text.

    Useful for: updating university name, correcting typos,
    anonymizing student names before sharing, etc.
    """
    file_bytes = await file.read()
    modified   = replace_text_in_docx(file_bytes, find_text, replace_with)
    return _build_response(modified, file.filename, "replace_text")


# ─────────────────────────────────────────────────────────────────────────────
# POST /api/docx/add-watermark
# Add DRAFT / CONFIDENTIAL watermark header to each page
# ─────────────────────────────────────────────────────────────────────────────

@router.post("/docx/add-watermark", response_model=DocxManipulationResponse)
async def docx_add_watermark(
    file:           UploadFile    = File(..., description="Original DOCX file"),
    watermark_text: Optional[str] = Form(default="DRAFT", description="Watermark text e.g. DRAFT, CONFIDENTIAL"),
):
    """
    ## Add Watermark to DOCX

    Adds a visible text watermark (e.g. DRAFT, CONFIDENTIAL, SAMPLE)
    in the header of every page in the document.
    """
    file_bytes = await file.read()
    modified   = add_watermark_text_to_docx(file_bytes, watermark_text or "DRAFT")
    return _build_response(modified, file.filename, "add_watermark")


# ─────────────────────────────────────────────────────────────────────────────
# POST /api/docx/add-toc
# Generate Table of Contents from headings
# ─────────────────────────────────────────────────────────────────────────────

@router.post("/docx/add-toc", response_model=DocxManipulationResponse)
async def docx_add_toc(
    file: UploadFile = File(..., description="Original DOCX file"),
):
    """
    ## Add Table of Contents to DOCX

    Reads all Heading-styled paragraphs and inserts a clean static
    Table of Contents at the top of the document.

    No headings found → returns original file unchanged.
    """
    file_bytes = await file.read()
    modified   = add_table_of_contents_to_docx(file_bytes)
    return _build_response(modified, file.filename, "add_toc")


# ─────────────────────────────────────────────────────────────────────────────
# POST /api/docx/add-ai-report
# Append a full AI Analysis Report at the end of the DOCX
# ─────────────────────────────────────────────────────────────────────────────

@router.post("/docx/add-ai-report", response_model=DocxManipulationResponse)
async def docx_add_ai_report(
    file:       UploadFile    = File(..., description="Original DOCX file"),
    summary:    str           = Form(...),
    tags:       str           = Form(..., description="Comma-separated tags"),
    keywords:   str           = Form(..., description="Comma-separated keywords"),
    difficulty: str           = Form(default="Intermediate"),
    quality:    Optional[str] = Form(default="0.8", description="Quality score 0.0 to 1.0"),
):
    """
    ## Add Full AI Analysis Report to DOCX

    Appends a complete formatted AI Analysis Report at the END of the document,
    including: summary, difficulty, quality score, tags, keywords, and
    practice questions (if provided).

    **Spring Boot workflow:**
    1. Call /api/analyze to get all AI results
    2. Call this endpoint to embed them into the DOCX itself
    3. Store the enriched DOCX — students get AI insights inside the file
    """
    file_bytes   = await file.read()
    tag_list     = [t.strip() for t in tags.split(",")     if t.strip()]
    keyword_list = [k.strip() for k in keywords.split(",") if k.strip()]

    try:
        quality_score = float(quality or "0.8")
    except ValueError:
        quality_score = 0.8

    modified = add_ai_analysis_report_to_docx(
        file_bytes      = file_bytes,
        summary         = summary,
        tags            = tag_list,
        keywords        = keyword_list,
        difficulty      = difficulty,
        quality_score   = quality_score,
        practice_questions = [],
    )
    return _build_response(modified, file.filename, "add_ai_report")


# ─── HELPER ──────────────────────────────────────────────────────────────────

def _build_response(modified: bytes, file_name: str, action: str) -> DocxManipulationResponse:
    """Build the standard DocxManipulationResponse."""
    if modified:
        return DocxManipulationResponse(
            status="success",
            action_performed=action,
            file_name=file_name,
            modified_file=bytes_to_base64(modified),
        )
    return DocxManipulationResponse(
        status="error",
        action_performed=action,
        file_name=file_name,
        error_message=f"Action '{action}' failed. Check server logs."
    )
