# F‑1 Student Visa QnA (MEVN, Local)

Local MEVN chatbot that answers F‑1 visa questions and returns citations to official U.S. government sources.

## Stack
- Backend: Node.js, Express, MongoDB (Mongoose), OpenAI SDK
- Frontend: Vue 3, Vite, Pinia

## Setup
1. Prerequisites: Node 18+, npm, MongoDB running locally
2. Backend env:
   - Copy `backend/.env.example` to `backend/.env` and fill `OPENAI_API_KEY`.
3. Install dependencies:
   ```bash
   cd backend && npm install
   cd ../frontend && npm install
   ```
4. Run dev:
   ```bash
   ./scripts/dev.sh
   ```
   - Backend: http://localhost:3001
   - Frontend: http://localhost:5173

## Endpoints
- POST `/api/ask` { question: string } -> { answer, citations[] }
- GET `/api/citations/search?q=...` -> { results[] }

## Fine‑tuning
Datasets in `data/finetune/*.jsonl`. Prepare messages per OpenAI format.
