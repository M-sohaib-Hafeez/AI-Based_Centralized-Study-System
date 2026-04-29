import logging
import re
from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from typing import Optional, List

from app.models.schemas import AnalysisResponse, BatchAnalysisResponse, ContentType
from app.services.file_service import process_file

logger = logging.getLogger(__name__)
router = APIRouter()

ALLOWED_EXTENSIONS = {"pdf", "docx", "doc", "ppt", "pptx", "jpg", "jpeg", "png", "gif"}


def _sanitize_filename(name: str) -> str:
    import os
    name = os.path.basename(name)
    name = name.replace("\0", "")
    name = re.sub(r"[^\w\s.\-]", "_", name)
    return name or "upload"


def _validate_extension(filename: str) -> bool:
    ext = filename.rsplit(".", 1)[-1].lower() if "." in filename else ""
    return ext in ALLOWED_EXTENSIONS


@router.post("/analyze", response_model=AnalysisResponse)
async def analyze_file(
    file: UploadFile = File(...),
    content_type: Optional[str] = Form(default="pdf"),
    analysis_type: Optional[str] = Form(default="full"),
):
    """
    Main AI Analysis Endpoint — called by Spring Boot after a student uploads a file.
    Extracts text (PDF) or runs OCR (image), then returns AI-generated metadata.
    """
    if not file or not file.filename:
        raise HTTPException(status_code=400, detail="No file provided")

    file.filename = _sanitize_filename(file.filename)

    if not _validate_extension(file.filename):
        raise HTTPException(
            status_code=415,
            detail=f"Unsupported file type. Allowed: {', '.join(sorted(ALLOWED_EXTENSIONS))}"
        )

    MAX_SIZE = 20 * 1024 * 1024
    file_bytes = await file.read()

    if len(file_bytes) == 0:
        raise HTTPException(status_code=400, detail="Uploaded file is empty")

    if len(file_bytes) > MAX_SIZE:
        raise HTTPException(
            status_code=413,
            detail=f"File too large. Maximum 20MB. Your file: {len(file_bytes) / 1024 / 1024:.1f}MB"
        )

    allowed_types = ["pdf", "image", "ppt", "video", "text"]
    if content_type not in allowed_types:
        content_type = "pdf"

    logger.info(f"Analyzing: {file.filename} | type={content_type} | size={len(file_bytes)} bytes")

    return process_file(
        file_bytes=file_bytes,
        file_name=file.filename,
        content_type=content_type,
    )


@router.post("/analyze/batch", response_model=BatchAnalysisResponse)
async def analyze_batch(
    files: List[UploadFile] = File(...),
    content_type: Optional[str] = Form(default="pdf"),
):
    """Analyze multiple files in one request. Max 10 files per batch."""
    if len(files) > 10:
        raise HTTPException(status_code=400, detail="Maximum 10 files per batch request")

    results = []
    successful = 0
    failed = 0

    for upload_file in files:
        try:
            file_bytes = await upload_file.read()
            result = process_file(
                file_bytes=file_bytes,
                file_name=upload_file.filename,
                content_type=content_type,
            )
            results.append(result)
            if result.status == "success":
                successful += 1
            else:
                failed += 1
        except Exception as e:
            logger.error(f"Batch processing failed for {upload_file.filename}: {e}")
            failed += 1
            results.append(AnalysisResponse(
                file_name=upload_file.filename or "unknown",
                content_type=content_type,
                status="error",
                error_message="Processing failed.",
                confidence=0.0
            ))

    return BatchAnalysisResponse(total=len(files), successful=successful, failed=failed, results=results)
