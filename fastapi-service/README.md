# 🤖 Academic Resource AI Service (FastAPI)

**ADBMS Group Project - Python AI Component**  
Handles AI analysis of study materials: PDF summarization, keyword extraction, difficulty rating, and image OCR.

---

## 📁 Project Structure

```
fastapi-ai-service/
├── main.py                         ← App entry point, CORS, router registration
├── requirements.txt                ← All Python dependencies
├── .env                            ← API keys (DO NOT commit to GitHub!)
│
└── app/
    ├── routers/
    │   ├── analyze.py              ← POST /api/analyze  (main endpoint)
    │   └── health.py               ← GET  /api/health   (Spring Boot checks this)
    │
    ├── services/
    │   ├── ai_service.py           ← All OpenAI API calls (GPT-4o, Vision)
    │   └── file_service.py         ← Orchestrates PDF/Image/PPT pipelines
    │
    ├── models/
    │   └── schemas.py              ← Request/Response Pydantic models
    │
    └── utils/
        ├── pdf_utils.py            ← PDF text extraction (PyMuPDF + pdfplumber)
        └── image_utils.py          ← Image helpers, MIME types, local OCR fallback
```

---

## ⚙️ Setup & Run

### 1. Install Python dependencies
```bash
pip install -r requirements.txt
```

### 2. Set your OpenAI API key
Open `.env` file and replace the placeholder:
```
OPENAI_API_KEY=sk-proj-your-actual-key-here
```

### 3. Run the server
```bash
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

### 4. Open API documentation
Visit: **http://localhost:8000/docs**  
(Interactive Swagger UI — you can test endpoints directly from browser)

---

## 🔌 Endpoints

### `GET /api/health`
Spring Boot calls this to check if FastAPI is alive.

**Response:**
```json
{
  "status": "ok",
  "service": "Academic Resource AI Service",
  "openai_configured": true,
  "version": "1.0.0"
}
```

---

### `POST /api/analyze`
Main endpoint — called by Spring Boot after student uploads a file.

**Request (multipart/form-data):**
| Field         | Type   | Required | Description                          |
|---------------|--------|----------|--------------------------------------|
| file          | File   | ✅       | The uploaded file (PDF, image, PPT)  |
| content_type  | string | ❌       | "pdf", "image", "ppt" (default: pdf) |
| analysis_type | string | ❌       | "full", "summarize", etc.            |

**Response:**
```json
{
  "file_name": "Machine_Learning_Notes.pdf",
  "content_type": "pdf",
  "summary": "This document covers supervised learning algorithms including linear regression, decision trees, and neural networks. It discusses model evaluation techniques and overfitting prevention strategies.",
  "tags": ["Machine Learning", "AI", "Neural Networks"],
  "keywords": ["supervised learning", "gradient descent", "overfitting", "cross-validation"],
  "difficulty": "Advanced",
  "language": "English",
  "topics": ["Computer Science", "Artificial Intelligence"],
  "suggested_year": "Year 3",
  "confidence": 0.94,
  "word_count": 2450,
  "ocr_text": null,
  "status": "success",
  "error_message": null
}
```

---

### `POST /api/analyze/batch`
Analyze up to 10 files at once (for batch processing).

---

## 🏗️ How Spring Boot Should Call This (OpenFeign)

```java
// Spring Boot OpenFeign interface
@FeignClient(name = "ai-service", url = "http://localhost:8000")
public interface AIServiceClient {

    @PostMapping(value = "/api/analyze", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    AIAnalysisResponse analyzeFile(
        @RequestPart("file") MultipartFile file,
        @RequestParam("content_type") String contentType
    );

    @GetMapping("/api/health")
    HealthResponse checkHealth();
}
```

---

## 🤖 AI Models Used

| Task              | Model              | Why                                      |
|-------------------|--------------------|------------------------------------------|
| Text Analysis     | GPT-4o-mini        | Fast, cheap, great for structured output |
| Image OCR         | GPT-4o (Vision)    | Best OCR + understanding of diagrams     |
| Local OCR fallback| pytesseract        | Free, works offline (less accurate)      |
| PDF Extraction    | PyMuPDF + pdfplumber| Fast native PDF text extraction         |

---

## 💰 OpenAI Cost Estimates

| File Type | Approx Cost per File |
|-----------|----------------------|
| PDF (text analysis) | ~$0.001 - $0.003 |
| Image (vision OCR)  | ~$0.005 - $0.015 |

For a student project, $5 in OpenAI credits can analyze ~1000+ files.

---

## 🔧 Without OpenAI Key (Development Mode)

If no API key is configured, FastAPI returns **mock responses** so you can still test the full flow end-to-end. The response will have `confidence: 0.0` and `[MOCK]` prefix in the summary.

---

## 👤 Author

**Muhammad Sohaib Hafeez** — DUET, 4th Semester  
ADBMS Group Project (FastAPI AI Service Component)
