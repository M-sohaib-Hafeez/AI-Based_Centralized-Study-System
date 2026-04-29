from fastapi import APIRouter
from app.models.schemas import HealthResponse
from app.services.ai_service import IS_CONFIGURED

router = APIRouter()

@router.get("/health", response_model=HealthResponse)
def health_check():
    """Health check — confirms AI service is running and API keys are configured."""
    return HealthResponse(
        status="ok",
        service="Academic Resource AI Service",
        openai_configured=IS_CONFIGURED,
        version="2.0.0",
        supported_formats=["pdf", "docx", "doc", "ppt", "pptx", "jpg", "jpeg", "png", "gif", "webp", "bmp"]
    )
