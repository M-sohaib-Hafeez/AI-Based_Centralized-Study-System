<div align="center">

# 📚 AI-Based Centralized Study System

**A full-stack academic resource platform powered by AI**
*ADBMS Group Project — Dawood University of Engineering and Technology (DUET), Karachi*

[![React](https://img.shields.io/badge/React-19.2-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev)
[![Spring Boot](https://img.shields.io/badge/Spring_Boot-4.0-6DB33F?style=for-the-badge&logo=springboot&logoColor=white)](https://spring.io/projects/spring-boot)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.115-009688?style=for-the-badge&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![MySQL](https://img.shields.io/badge/MySQL-8.x-4479A1?style=for-the-badge&logo=mysql&logoColor=white)](https://www.mysql.com)
[![JWT](https://img.shields.io/badge/JWT-Auth-black?style=for-the-badge&logo=jsonwebtokens)](https://jwt.io)

</div>

---

## 👥 Team Members

| Name | Roll No | Component | Technologies |
|------|---------|-----------|-------------|
| **Muhammad Sohaib Hafeez** | 24F-CS-085 | FastAPI AI Microservice | Python, FastAPI, Groq LLaMA 3.3-70b, Gemini Vision, PyMuPDF |
| **Mubashir Hafeez** | 24F-CS-074 | Spring Boot Backend | Java 21, Spring Boot, Spring Security, JPA, JWT |
| **Muhammad Haseeb** | 24F-CS-097 | Database | MySQL, JPA Specifications, Hibernate |
| **Shahmeer Imran** | 24F-CS-068 | React Frontend | React 19, Vite, Axios, React Router DOM |

---

## 🧠 What Is This?

The AI-Based Centralized Study System is a university-grade platform where students can **upload, search, and interact with academic documents using AI**. Think of it as Google Drive + Wikipedia + an AI tutor — built specifically for university students.

Students upload their lecture notes, past papers, or textbooks. The AI automatically summarizes them, extracts keywords, rates difficulty, generates practice questions, and checks for plagiarism. Other students can then search and download these resources and ask the AI questions directly about any document.

---

## ✨ Features

### 📤 Document Management
- Upload PDF, Word (.docx/.doc), PowerPoint (.pptx/.ppt), and Image files (JPG, PNG, GIF, WebP, BMP)
- Tag uploads with country, university, and course for discoverability
- View, download, and delete your own uploads
- In-browser document viewer — PDF viewer, image viewer, Google Docs viewer for Office files

### 🔍 Search & Discovery
- Full-text search across all uploaded documents by title
- Filter by country, university, course, and file type
- Paginated results (12 per page), sorted by most recent
- Guest access — browse and search without an account

### 🤖 AI-Powered Analysis (FastAPI + Groq LLaMA + Gemini)

Every uploaded document is automatically analyzed for:

| Feature | Description |
|---------|-------------|
| **Summarization** | 2–4 sentence AI summary of the document |
| **Tags** | 3–6 short topic tags auto-extracted |
| **Keywords** | 5–10 key technical terms identified |
| **Difficulty Rating** | Beginner / Intermediate / Advanced |
| **Quality Score** | 0–100% content quality assessment |
| **Practice Questions** | 5 MCQ + open-ended questions generated |
| **Plagiarism Check** | AI-estimated likelihood of copied content |
| **Topic Recommendations** | 3 related topics students should study |
| **OCR** | Extracts text from images and scanned documents |
| **Language Detection** | Identifies the document language |
| **Suggested Year** | Year 1 / 2 / 3 / 4 / Graduate level |

### 💬 AI Chat ("Ask AI")
- Chat with AI about any document on the platform
- Ask questions, request explanations, get on-demand summaries
- Powered by **Groq LLaMA 3.3-70b** for fast, accurate responses

### 🔐 Authentication & Security
- JWT-based authentication with BCrypt password hashing
- Role-based route protection (authenticated vs. guest)
- Guest mode — limited to Search only
- Auto-logout on token expiry (401 response)
- Rate limiting on FastAPI (30 requests/minute per IP)

---

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        React Frontend                           │
│         (Vite + React 19 + Axios + React Router DOM)            │
│    Pages: Login · Dashboard · Search · Upload · My Files        │
└────────────────────────┬────────────────────────────────────────┘
                         │ HTTP  (JWT Bearer)
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│                   Spring Boot Backend (Port 8080)               │
│          (Java 21 · Spring Security · JPA · MySQL)              │
│                                                                 │
│  Controllers:  Auth · FileStorage · Search · AI · Reference    │
│  Services:     UserService · FileStorageService · AIService     │
│                MetadataService · JwtService                     │
│  Security:     JwtFilter · BCrypt · CORS                        │
└──────────┬──────────────────────────┬───────────────────────────┘
           │ MySQL (JPA/Hibernate)    │ Multipart HTTP
           ▼                          ▼
┌──────────────────┐    ┌─────────────────────────────────────────┐
│   MySQL DB       │    │     FastAPI AI Microservice (Port 8000) │
│                  │    │    (Python · Groq · Gemini · PyMuPDF)   │
│  - users         │    │                                         │
│  - metadata      │    │  POST /api/analyze   (file analysis)    │
│  - country       │    │  POST /api/docx/*    (DOCX operations)  │
│  - course        │    │  POST /app/generate  (AI chat)          │
│                  │    │  GET  /api/health                       │
└──────────────────┘    └──────────────┬──────────────────────────┘
                                       │
                         ┌─────────────┼─────────────┐
                         ▼             ▼             ▼
                    Groq API      Gemini API    Local OCR
                (LLaMA 3.3-70b) (Flash 2.0)  (pytesseract)
```

---

## 📁 Project Structure

```
AI-Based_Centralized-Study-System/
│
├── fastapi-service/                      ← Sohaib's AI Microservice
│   ├── main.py                           ← App entry, CORS, rate limiting
│   ├── requirements.txt
│   ├── .env.example
│   └── app/
│       ├── routers/
│       │   ├── analyze.py                ← POST /api/analyze
│       │   ├── docx.py                   ← POST /api/docx/*
│       │   └── health.py                 ← GET  /api/health
│       ├── services/
│       │   ├── ai_service.py             ← Groq + Gemini API calls
│       │   └── file_service.py           ← PDF/DOCX/PPT/Image pipelines
│       ├── models/
│       │   └── schemas.py                ← Pydantic models
│       └── utils/
│           ├── pdf_utils.py              ← PyMuPDF + pdfplumber
│           ├── docx_utils.py             ← python-docx read & write
│           └── image_utils.py            ← MIME types, OCR
│
├── springboot-backend/                   ← Mubashir's Java Backend
│   ├── pom.xml
│   └── src/main/java/com/mubashir/app/
│       ├── config/
│       │   ├── SecurityConfig.java       ← JWT + BCrypt + CORS
│       │   ├── JwtFilter.java            ← Per-request JWT validation
│       │   ├── DataInitializer.java      ← Seeds countries/courses
│       │   └── RestConfig.java           ← RestTemplate bean
│       ├── controller/
│       │   ├── AuthController.java       ← /app/register, /app/login
│       │   ├── FileStorageController.java
│       │   ├── SearchController.java
│       │   ├── AIController.java         ← /app/files/{id}/generate
│       │   └── ReferenceDataController.java
│       ├── service/
│       │   ├── FileStorageService.java
│       │   ├── MetadataService.java      ← JPA Specification search
│       │   ├── AIService.java            ← Bridges Spring Boot ↔ FastAPI
│       │   └── JwtService.java
│       ├── model/                        ← JPA Entities
│       ├── dto/                          ← Request/Response POJOs
│       └── error/                        ← Global exception handler
│
└── frontend/                             ← Shahmeer's React Frontend
    ├── vite.config.js
    ├── package.json
    └── src/
        ├── App.jsx                       ← Routes + ProtectedRoute guard
        ├── services/
        │   └── api.js                    ← Axios + JWT interceptors
        ├── Components/
        │   └── Navbar.jsx
        └── pages/
            ├── LoginPage.jsx
            ├── Dashboard.jsx
            ├── Search.jsx                ← Search + filter + viewer + AI chat
            ├── Upload.jsx
            └── Myfiles.jsx
```

---

## 🛠️ Tech Stack

### Frontend
| Technology | Version | Purpose |
|-----------|---------|---------|
| React | 19.2 | UI framework |
| Vite | 8.0 | Build tool & dev server |
| React Router DOM | 7.14 | Client-side routing |
| Axios | 1.15 | HTTP client with JWT interceptors |

### Backend (Spring Boot)
| Technology | Version | Purpose |
|-----------|---------|---------|
| Spring Boot | 4.0.5 | Application framework |
| Spring Security | — | JWT auth + BCrypt hashing |
| Spring Data JPA | — | ORM + Hibernate |
| JJWT | 0.12.6 | JWT token generation & validation |
| SpringDoc OpenAPI | 2.5.0 | Swagger UI |
| Lombok | — | Boilerplate reduction |
| Java | 21 | Runtime |

### AI Microservice (FastAPI)
| Technology | Version | Purpose |
|-----------|---------|---------|
| FastAPI | 0.115 | Python web framework |
| Uvicorn | 0.30 | ASGI server |
| OpenAI SDK (Groq) | 1.51 | LLaMA 3.3-70b text analysis |
| Google Generative AI | 0.8.3 | Gemini Flash 2.0 image OCR |
| PyMuPDF | 1.25.5 | Fast PDF text extraction |
| pdfplumber | 0.11.4 | Fallback PDF extraction |
| python-docx | 1.1.2 | DOCX read + manipulation |
| python-pptx | 1.0.2 | PowerPoint text extraction |
| pytesseract + Pillow | — | Local OCR fallback |
| Pydantic | 2.9 | Data validation |

---

## ⚙️ Setup & Installation

### Prerequisites
- Java 21 (JDK)
- Python 3.10+
- Node.js 18+
- MySQL 8.x
- Maven
- A **Groq API key** — free at [console.groq.com](https://console.groq.com)
- A **Gemini API key** — free at [aistudio.google.com](https://aistudio.google.com) *(optional, for image OCR only)*

---

### 1️⃣ Database Setup

```sql
CREATE DATABASE mubashir_app;
```

Hibernate auto-creates all tables on first run. Countries and courses are seeded automatically from bundled `.txt` files.

---

### 2️⃣ Spring Boot Backend

```bash
cd springboot-backend
```

Edit `src/main/resources/application.properties`:

```properties
spring.datasource.url=jdbc:mysql://localhost:3306/mubashir_app?useSSL=false&serverTimezone=UTC
spring.datasource.username=your_mysql_username
spring.datasource.password=your_mysql_password
file.upload-dir=C:/uploads
```

```bash
mvn spring-boot:run
```

Backend → **http://localhost:8080**
Swagger UI → **http://localhost:8080/swagger-ui.html**

---

### 3️⃣ FastAPI AI Microservice

```bash
cd fastapi-service
pip install -r requirements.txt
cp .env.example .env
```

Edit `.env`:

```env
GROQ_API_KEY=gsk_your_key_here
GEMINI_API_KEY=AIza_your_key_here
```

```bash
uvicorn main:app --reload --port 8000
```

AI Service → **http://localhost:8000**
Interactive Docs → **http://localhost:8000/docs**

> **No API keys?** The service returns `[MOCK]` tagged responses so you can still test the full flow without any cost.

---

### 4️⃣ React Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend → **http://localhost:5173**

---

## 🔌 API Reference

### Auth
| Method | Endpoint | Auth Required | Description |
|--------|----------|:---:|-------------|
| `POST` | `/app/register` | ❌ | Register new user |
| `POST` | `/app/login` | ❌ | Login, returns JWT |

### Files
| Method | Endpoint | Auth Required | Description |
|--------|----------|:---:|-------------|
| `POST` | `/app/files` | ✅ | Upload file (multipart) |
| `GET` | `/app/files/{id}` | ✅ | Download file |
| `DELETE` | `/app/files/{id}` | ✅ | Delete own file |
| `POST` | `/app/files/{id}/generate` | ✅ | AI chat about file |

### Search & Reference
| Method | Endpoint | Auth Required | Description |
|--------|----------|:---:|-------------|
| `POST` | `/app/search?page=0` | ❌ | Search with filters |
| `GET` | `/app/my-files` | ✅ | Get my uploaded files |
| `GET` | `/app/countries` | ❌ | List all countries |
| `GET` | `/app/courses` | ❌ | List all courses |

### FastAPI AI Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/health` | Health check |
| `POST` | `/api/analyze` | Analyze file (PDF/DOCX/PPT/Image) |
| `POST` | `/api/analyze/batch` | Analyze up to 10 files |
| `POST` | `/api/docx/analyze` | Full DOCX analysis |
| `POST` | `/api/docx/add-summary` | Embed AI summary into DOCX |
| `POST` | `/api/docx/add-tags` | Append tags to DOCX |
| `POST` | `/api/docx/add-toc` | Generate Table of Contents |
| `POST` | `/api/docx/add-watermark` | Add DRAFT/CONFIDENTIAL watermark |
| `POST` | `/api/docx/replace-text` | Find & replace text in DOCX |
| `POST` | `/api/docx/add-ai-report` | Embed full AI report into DOCX |
| `POST` | `/app/generate` | File + prompt → AI chat response |

---

## 🗄️ Database Schema

```
users
  ├── id (UUID, PK)
  ├── username (unique)
  ├── password (BCrypt)
  └── created_at

metadata
  ├── id (UUID, PK)
  ├── title
  ├── file_type  (WORD / PDF / PRESENTATION / IMAGE)
  ├── extension
  ├── file_stored_path
  ├── university
  ├── country_id  → country(id)
  ├── course_id   → course(id)
  ├── uploaded_by → users(id)
  └── uploaded_at

country
  ├── id (UUID, PK)
  └── name  — 195 countries pre-seeded

course
  ├── id (UUID, PK)
  └── name  — 200+ courses pre-seeded
```

Files are stored on disk at `{upload-dir}/{date}/{uuid}.{ext}` — not in the database.

---

## ⚠️ Security Notes

Before pushing to GitHub, make sure these files are **NOT committed**:

- `fastapi-service/.env` — contains your Groq and Gemini API keys
- `springboot-backend/src/main/resources/application.properties` — contains your MySQL password

Use environment variables in production:

```properties
spring.datasource.password=${DB_PASSWORD}
jwt.secret=${JWT_SECRET}
```

---

## 📄 License

This project was developed for academic purposes as part of the ADBMS course at DUET, Karachi.
All rights reserved by the team.
