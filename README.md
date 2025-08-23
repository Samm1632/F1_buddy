# F‑1 Student Visa QnA (MEVN, Local)

Local MEVN chatbot that answers F‑1 visa questions and returns citations to official U.S. government sources.

## Stack
- Backend: Node.js, Express, MongoDB (Mongoose), OpenAI SDK
- Frontend: Vue 3, Vite, Pinia

## Setup
See `docs/setup.md` for detailed local instructions.

Quickstart:
1. Prereqs: Node 18+, npm, MongoDB (optional)
2. Backend env: copy `backend/.env.example` to `backend/.env` and set `OPENAI_API_KEY`
3. Install deps: `cd backend && npm install && cd ../frontend && npm install`
4. Run dev: `./scripts/dev.sh`
   - Backend: http://localhost:3001/health
   - Frontend: http://localhost:5173

## Endpoints
- POST `/api/ask` { question: string } -> { answer, citations[] }
- GET `/api/citations/search?q=...` -> { results[] }

## Fine‑tuning
Datasets in `data/finetune/*.jsonl`. Prepare messages per OpenAI format. See `docs/finetune.md`.

## Documentation
- Supported queries: `docs/queries.md`
- Architecture & API: `docs/architecture.md`
- Citations & whitelist: `docs/citations.md`
- Setup: `docs/setup.md`
