import io
import logging
from typing import Optional

logger = logging.getLogger(__name__)


def extract_text_from_pdf(file_bytes: bytes) -> Optional[str]:
    """
    Extract all text from a PDF file.
    Uses PyMuPDF (fitz) as primary, falls back to pdfplumber.
    Returns extracted text or None if extraction fails.
    """
    # --- Method 1: PyMuPDF (faster, handles most PDFs) ---
    try:
        import fitz  # PyMuPDF
        doc = fitz.open(stream=file_bytes, filetype="pdf")
        full_text = ""
        for page in doc:
            full_text += page.get_text()
        doc.close()

        if full_text.strip():
            logger.info(f"PyMuPDF extracted {len(full_text)} characters")
            return full_text.strip()
    except ImportError:
        logger.warning("PyMuPDF not installed, trying pdfplumber...")
    except Exception as e:
        logger.warning(f"PyMuPDF failed: {e}, trying pdfplumber...")

    # --- Method 2: pdfplumber (better for tables/structured PDFs) ---
    try:
        import pdfplumber
        full_text = ""
        with pdfplumber.open(io.BytesIO(file_bytes)) as pdf:
            for page in pdf.pages:
                text = page.extract_text()
                if text:
                    full_text += text + "\n"

        if full_text.strip():
            logger.info(f"pdfplumber extracted {len(full_text)} characters")
            return full_text.strip()
    except ImportError:
        logger.warning("pdfplumber not installed either.")
    except Exception as e:
        logger.error(f"pdfplumber also failed: {e}")

    return None


def get_pdf_metadata(file_bytes: bytes) -> dict:
    """Extract PDF metadata like page count, author, title."""
    try:
        import fitz
        doc = fitz.open(stream=file_bytes, filetype="pdf")
        meta = doc.metadata
        page_count = doc.page_count
        doc.close()
        return {
            "page_count": page_count,
            "author": meta.get("author", ""),
            "title": meta.get("title", ""),
            "subject": meta.get("subject", ""),
        }
    except Exception as e:
        logger.error(f"Could not get PDF metadata: {e}")
        return {}
