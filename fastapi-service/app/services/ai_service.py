import os
import json
import logging
from typing import Optional, List

from dotenv import load_dotenv
load_dotenv()

from openai import OpenAI
import google.generativeai as genai

logger = logging.getLogger(__name__)

GROQ_API_KEY   = os.getenv("GROQ_API_KEY",   "your-groq-api-key-here")
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "your-gemini-api-key-here")

GROQ_CONFIGURED   = GROQ_API_KEY   != "your-groq-api-key-here"
GEMINI_CONFIGURED = GEMINI_API_KEY != "your-gemini-api-key-here"
IS_CONFIGURED     = GROQ_CONFIGURED or GEMINI_CONFIGURED

groq_client = OpenAI(
    api_key=GROQ_API_KEY,
    base_url="https://api.groq.com/openai/v1",
)

if GEMINI_CONFIGURED:
    genai.configure(api_key=GEMINI_API_KEY)


def _call_groq(prompt: str, max_tokens: int = 800) -> Optional[dict]:
    try:
        resp = groq_client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.3,
            max_tokens=max_tokens,
        )
        raw = resp.choices[0].message.content.strip()
        raw = raw.replace("```json", "").replace("```", "").strip()
        return json.loads(raw)
    except json.JSONDecodeError as e:
        logger.error(f"Groq returned invalid JSON: {e}")
        return None
    except Exception as e:
        logger.error(f"Groq API call failed: {e}")
        return None


def analyze_text_content(text: str, file_name: str) -> dict:
    if not GROQ_CONFIGURED:
        return _mock_text_response(file_name)

    truncated = text[:4000]
    prompt = f"""
You are an academic content analyzer for a university study material platform.

Analyze the following study material and return a JSON object with EXACTLY these fields:

{{
  "summary":          "2-4 sentence summary of what this document covers",
  "tags":             ["tag1", "tag2", "tag3"],
  "keywords":         ["keyword1", "keyword2", "keyword3", "keyword4", "keyword5"],
  "difficulty":       "Beginner" or "Intermediate" or "Advanced",
  "language":         "English" or detected language,
  "topics":           ["Main Subject Area", "Sub-topic"],
  "suggested_year":   "Year 1" or "Year 2" or "Year 3" or "Year 4" or "Graduate",
  "confidence":       0.0 to 1.0,
  "quality_score":    0.0 to 1.0,
  "quality_note":     "One sentence explaining the quality score",
  "recommendations":  ["Related topic 1", "Related topic 2", "Related topic 3"]
}}

Rules:
- tags: 3-6 short topic tags
- keywords: 5-10 important technical terms
- quality_score: 1.0 = excellent well-structured content, 0.0 = poor/incomplete
- recommendations: suggest 3 related topics a student should also study
- Return ONLY valid JSON, no extra text or markdown

File: {file_name}
Content:
{truncated}
"""
    result = _call_groq(prompt, max_tokens=800)
    return result if result else _mock_text_response(file_name)


def generate_practice_questions(text: str, file_name: str, count: int = 5) -> List[dict]:
    if not GROQ_CONFIGURED:
        return _mock_questions()

    truncated = text[:3500]
    prompt = f"""
You are an academic quiz generator for university students.

Generate {count} practice questions from the following study material.
Mix of MCQ (multiple choice) and open-ended questions.

Return a JSON array with EXACTLY this structure:
[
  {{
    "question":      "The full question text",
    "question_type": "mcq",
    "options":       ["A) option1", "B) option2", "C) option3", "D) option4"],
    "answer":        "A) option1"
  }},
  {{
    "question":      "An open-ended question",
    "question_type": "open",
    "options":       null,
    "answer":        "A model answer in 2-3 sentences"
  }}
]

Rules:
- Mix MCQ and open-ended (roughly 60/40)
- MCQ must have exactly 4 options (A, B, C, D)
- Return ONLY the JSON array, no extra text or markdown

Content from file: {file_name}
{truncated}
"""
    result = _call_groq(prompt, max_tokens=1200)
    if isinstance(result, list):
        return result
    return _mock_questions()


def check_plagiarism(text: str, file_name: str) -> dict:
    if not GROQ_CONFIGURED:
        return {"plagiarism_score": 0.0, "plagiarism_note": "[MOCK] Configure GROQ_API_KEY for real analysis."}

    truncated = text[:2500]
    prompt = f"""
You are an academic integrity checker.

Analyze the following text and estimate the likelihood it contains copied/plagiarized content.

Return a JSON object:
{{
  "plagiarism_score": 0.0 to 1.0,
  "plagiarism_note":  "One clear explanation"
}}

Score guide:
- 0.0-0.2: Looks original
- 0.2-0.5: Some generic patterns
- 0.5-0.8: Many textbook-style phrases
- 0.8-1.0: Appears directly copied

Return ONLY valid JSON.

Text from: {file_name}
{truncated}
"""
    result = _call_groq(prompt, max_tokens=200)
    if result and "plagiarism_score" in result:
        return result
    return {"plagiarism_score": 0.0, "plagiarism_note": "Could not assess plagiarism."}


def analyze_image_content(image_bytes: bytes, file_name: str, mime_type: str = "image/jpeg") -> dict:
    if not GEMINI_CONFIGURED:
        return _mock_image_response(file_name)

    prompt = """
You are analyzing an academic study material image.

Extract all visible text (OCR) and analyze the content.
Return a JSON object with EXACTLY these fields:

{
  "ocr_text":      "All text visible in the image",
  "summary":       "2-3 sentence description",
  "tags":          ["tag1", "tag2", "tag3"],
  "keywords":      ["keyword1", "keyword2", "keyword3"],
  "difficulty":    "Beginner" or "Intermediate" or "Advanced",
  "topics":        ["Subject Area"],
  "quality_score": 0.0 to 1.0,
  "confidence":    0.0 to 1.0
}

Return ONLY valid JSON, no markdown fences.
"""
    try:
        model = genai.GenerativeModel("gemini-2.0-flash")
        image_part = {"mime_type": mime_type, "data": image_bytes}
        response = model.generate_content([prompt, image_part])
        raw = response.text.strip().replace("```json", "").replace("```", "").strip()
        return json.loads(raw)
    except json.JSONDecodeError as e:
        logger.error(f"Gemini returned invalid JSON: {e}")
        return _mock_image_response(file_name)
    except Exception as e:
        logger.error(f"Gemini Vision API failed: {e}")
        return _mock_image_response(file_name)


def _mock_text_response(file_name: str) -> dict:
    return {
        "summary":         f"[MOCK] '{file_name}' contains academic study material. Set GROQ_API_KEY for real analysis.",
        "tags":            ["Study Material", "Academic", "University"],
        "keywords":        ["placeholder", "mock", "development"],
        "difficulty":      "Intermediate",
        "language":        "English",
        "topics":          ["General Studies"],
        "suggested_year":  "Year 2",
        "confidence":      0.0,
        "quality_score":   0.0,
        "quality_note":    "[MOCK] Set GROQ_API_KEY for real quality assessment.",
        "recommendations": ["Topic A", "Topic B", "Topic C"],
    }


def _mock_questions() -> List[dict]:
    return [
        {
            "question":      "[MOCK] What is the main topic of this document?",
            "question_type": "mcq",
            "options":       ["A) Topic A", "B) Topic B", "C) Topic C", "D) Topic D"],
            "answer":        "A) Topic A"
        },
        {
            "question":      "[MOCK] Explain the key concept. (Set GROQ_API_KEY for real questions)",
            "question_type": "open",
            "options":       None,
            "answer":        "[MOCK] A model answer would appear here."
        }
    ]


def _mock_image_response(file_name: str) -> dict:
    return {
        "ocr_text":      f"[MOCK] OCR text from {file_name}. Set GEMINI_API_KEY for real OCR.",
        "summary":       "[MOCK] Image contains academic content. Set GEMINI_API_KEY for real analysis.",
        "tags":          ["Image", "Academic"],
        "keywords":      ["placeholder", "mock"],
        "difficulty":    "Intermediate",
        "topics":        ["General Studies"],
        "quality_score": 0.0,
        "confidence":    0.0,
    }
