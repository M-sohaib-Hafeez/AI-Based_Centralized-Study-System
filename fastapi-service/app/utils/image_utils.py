import base64
import logging
from typing import Optional

logger = logging.getLogger(__name__)


def encode_image_to_base64(file_bytes: bytes) -> str:
    """Convert image bytes to base64 string for OpenAI Vision API."""
    return base64.b64encode(file_bytes).decode("utf-8")


def extract_text_from_image_locally(file_bytes: bytes) -> Optional[str]:
    """
    Fallback OCR using pytesseract (free, local).
    Only used if OpenAI Vision call fails.
    Requires: pip install pytesseract Pillow
    Also requires Tesseract binary installed on system.
    """
    try:
        from PIL import Image
        import pytesseract
        import io

        image = Image.open(io.BytesIO(file_bytes))
        text = pytesseract.image_to_string(image)
        logger.info("Local OCR (pytesseract) succeeded")
        return text.strip() if text.strip() else None
    except ImportError:
        logger.warning("pytesseract or Pillow not installed - local OCR unavailable")
    except Exception as e:
        logger.error(f"Local OCR failed: {e}")
    return None


def get_image_mime_type(filename: str) -> str:
    """Determine MIME type from file extension for OpenAI API."""
    ext = filename.lower().split(".")[-1]
    mime_map = {
        "jpg": "image/jpeg",
        "jpeg": "image/jpeg",
        "png": "image/png",
        "gif": "image/gif",
        "webp": "image/webp",
    }
    return mime_map.get(ext, "image/jpeg")
