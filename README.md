# AI-Based Centralized Study System

**ADBMS Group Project — DUET**

| Member | Roll No | Component |
|---|---|---|
| Sohaib Hafeez | 24F-CS-085 | FastAPI AI Service |
| Mubashir Hafeez | 24F-CS-074 | Spring Boot Backend |
| Muhammad Haseeb | 24F-CS-097 | Database |
| Shahmeer Imran | 24F-CS-068 | React Frontend |

## Project Structure

```
├── fastapi-service/    # Python AI microservice (Sohaib)
├── springboot-backend/ # Java REST API (Mubashir)
└── frontend/           # React + Vite UI (Shahmeer)
```

## FastAPI Service

Handles AI-powered file analysis using Groq (LLaMA) and Gemini Vision.

```bash
cd fastapi-service
pip install -r requirements.txt
cp .env.example .env   # add your API keys
uvicorn main:app --reload --port 8000
```

Docs: http://localhost:8000/docs

## Spring Boot Backend

```bash
cd springboot-backend
mvn spring-boot:run
```

## Frontend

```bash
cd frontend
npm install
npm run dev
```
