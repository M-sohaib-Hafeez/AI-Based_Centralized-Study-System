from dotenv import load_dotenv
load_dotenv()

from fastapi import FastAPI, Request, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from collections import defaultdict
from typing import Optional
import time
import logging

from app.routers import analyze, health, docx
from app.services.file_service import process_file

logger = logging.getLogger(__name__)

_request_counts: dict = defaultdict(list)
RATE_LIMIT_REQUESTS = 30
RATE_LIMIT_WINDOW   = 60

app = FastAPI(
    title="Academic Resource AI Service",
    description="""
AI-powered content analysis for ADBMS Group Project.

Supports: **PDF, DOCX, PowerPoint, Images**

Features:
- Summarization, Tagging, Keyword Extraction
- Difficulty Rating, Quality Scoring
- Practice Question Generation (MCQ + Open-ended)
- Plagiarism Detection (AI-based)
- Topic Recommendations
- DOCX Manipulation (add summary, tags, watermark, TOC, find/replace)
- OCR for Images
    """,
    version="2.0.0"
)


@app.middleware("http")
async def rate_limit_middleware(request: Request, call_next):
    client_ip = request.client.host if request.client else "unknown"
    now = time.time()
    window_start = now - RATE_LIMIT_WINDOW
    _request_counts[client_ip] = [t for t in _request_counts[client_ip] if t > window_start]
    if len(_request_counts[client_ip]) >= RATE_LIMIT_REQUESTS:
        return JSONResponse(status_code=429, content={"detail": "Too many requests. Slow down."})
    _request_counts[client_ip].append(now)
    return await call_next(request)


app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:8080",
        "http://localhost:3000",
        "http://localhost:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(health.router,  prefix="/api", tags=["Health"])
app.include_router(analyze.router, prefix="/api", tags=["File Analysis"])
app.include_router(docx.router,    prefix="/api", tags=["DOCX Manipulation"])


@app.post("/app/generate")
async def generate_response(
    file: UploadFile = File(...),
    prompt: str = Form(...),
):
    """
    Called by Spring Boot's AIService. Receives a file + prompt,
    runs full AI analysis, and returns {"response": "..."}.
    """
    if not file or not file.filename:
        return JSONResponse(status_code=400, content={"response": "No file provided."})

    file_bytes = await file.read()
    if not file_bytes:
        return JSONResponse(status_code=400, content={"response": "The uploaded file is empty."})

    filename = file.filename.lower()
    if filename.endswith(".pdf"):
        content_type = "pdf"
    elif filename.endswith((".docx", ".doc")):
        content_type = "docx"
    elif filename.endswith((".ppt", ".pptx")):
        content_type = "ppt"
    elif filename.endswith((".jpg", ".jpeg", ".png", ".gif", ".webp", ".bmp")):
        content_type = "image"
    else:
        content_type = "pdf"

    logger.info(f"[/app/generate] File: {file.filename}, prompt: '{prompt[:80]}'")

    try:
        result = process_file(
            file_bytes=file_bytes,
            file_name=file.filename,
            content_type=content_type,
        )

        if result.status == "error":
            return {"response": f"Could not analyze the file: {result.error_message}"}

        parts = []

        if result.ocr_text:
            parts.append(f"**Document Text (OCR):**\n{result.ocr_text[:600]}")
        if result.summary:
            parts.append(f"**Summary:**\n{result.summary}")
        if result.difficulty:
            parts.append(f"**Difficulty:** {result.difficulty}")
        if result.tags:
            parts.append(f"**Tags:** {', '.join(result.tags)}")
        if result.keywords:
            parts.append(f"**Keywords:** {', '.join(result.keywords)}")
        if result.topics:
            parts.append(f"**Topics:** {', '.join(result.topics)}")
        if result.recommendations:
            parts.append(f"**Recommended further study:** {', '.join(result.recommendations)}")
        if result.practice_questions:
            qs = result.practice_questions[:3]
            q_text = "\n".join(
                f"Q{i+1}: {q.question}" + (f"\nAnswer: {q.answer}" if q.answer else "")
                for i, q in enumerate(qs)
            )
            parts.append(f"**Practice Questions:**\n{q_text}")
        if result.quality_score is not None:
            parts.append(f"**Quality Score:** {result.quality_score:.0%}")

        response_text = f'Here\'s what I found about your document based on your prompt: "{prompt}"\n\n'
        response_text += "\n\n".join(parts) if parts else "No analysis results available."

        return {"response": response_text}

    except Exception as e:
        logger.error(f"/app/generate error: {e}")
        return {"response": f"An error occurred while analyzing the file: {str(e)}"}


@app.get("/")
def root():
    return {
        "service": "Academic Resource AI Service v2.0",
        "status":  "running",
        "endpoints": {
            "spring_boot": "POST /app/generate",
            "analyze":     "POST /api/analyze",
            "batch":       "POST /api/analyze/batch",
            "docx":        "POST /api/docx/analyze",
            "health":      "GET  /api/health",
            "docs":        "GET  /docs",
        }
    }
