# MEVN F‑1 Student Assistant (Local)

A local MEVN (MongoDB, Express, Vue, Node) app that answers F‑1 student visa questions using OpenAI with Retrieval-Augmented Generation (RAG) over official U.S. government sources, and returns citations to the official pages.

## Features

- Backend RAG service (Node/Express + MongoDB)
- Ingestion script to crawl a curated set of official F‑1 sources and store embeddings
- Ask API that returns answers with inline citations [1], [2], ... and a citations list
- Vue 3 + Vite frontend with a chat-like UI
- Local development with Docker (MongoDB) or your own MongoDB
- Fine‑tuning scripts and dataset stub

## Prerequisites

- Node.js 18+
- Docker (optional, for local MongoDB)
- OpenAI API key

## Quick Start

1) Start MongoDB locally (Docker Compose):

```bash
docker compose up -d
```

2) Configure environment variables:

- Copy `backend/.env.example` to `backend/.env` and fill in values.
- Copy `frontend/.env.example` to `frontend/.env` (optional; defaults are fine).

3) Install dependencies and ingest sources:

```bash
cd backend && npm install && npm run ingest
```

4) Start backend:

```bash
npm run dev
```

5) In a new terminal, install and start frontend:

```bash
cd ../frontend && npm install && npm run dev
```

6) Open the UI:

- Visit `http://localhost:5173`

## Folder Structure

```
backend/
  src/
    index.js           # Express server
    config.js          # Env config
    db.js              # MongoDB connection
    embedding.js       # OpenAI embeddings helper
    vectorStore.js     # Simple in-memory vector index backed by MongoDB
    rag.js             # RAG orchestration
    ingest.js          # Source ingestion + chunking + embeddings
    routes/
      ask.js           # /api/ask endpoint
      admin.js         # /api/admin tools (reload index)
    finetune/
      buildDataset.js  # Create JSONL dataset stub
      runFineTune.js   # Start fine-tuning job

frontend/
  src/
    main.js
    App.vue
    components/
      ChatUI.vue
      CitationList.vue
    api.js
    styles.css
  index.html
  vite.config.js
```

## Environment

Backend `.env`:

```
PORT=3001
MONGODB_URI=mongodb://localhost:27017/f1_assistant
OPENAI_API_KEY=sk-...
EMBEDDING_MODEL=text-embedding-3-small
CHAT_MODEL=gpt-4o-mini
ORIGINS=http://localhost:5173
```

Frontend `.env` (optional):

```
VITE_API_BASE=http://localhost:3001
```

## RAG Ingestion

Run:

```bash
cd backend
npm run ingest
```

This fetches and chunks selected official pages (e.g., travel.state.gov, ice.gov, dhs.gov/studyinthestates), creates embeddings, and stores them in MongoDB.

## Fine‑tuning

There are scripts under `backend/src/finetune` to prepare a training dataset and start a fine‑tuning job with OpenAI. These are optional and provided as a starting point.

## Local MongoDB via Docker

```bash
docker compose up -d
```

Mongo runs on `mongodb://localhost:27017` by default.

## Security

- Keep your `OPENAI_API_KEY` secret; never commit it.
- CORS is limited to the local dev origin(s) by default.

## License

MIT

# F1_buddy
Your international buddy
