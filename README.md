## USA Visa Buddy (MEVN + RAG)

USA Visa Buddy is a full-stack MEVN application that acts like a private lawyer and provides guidance on U.S. visa categories. It uses a simple RAG pipeline with OpenAI embeddings and chat completion over a MongoDB knowledge base.

### Stack
- MongoDB (Mongoose)
- Express + Node.js backend
- Vue 3 + Vite frontend
- Single repo with concurrent dev server and Vite proxy

### Prerequisites
- Node.js 18+
- MongoDB running locally (default uri in `.env.example`)
- OpenAI API key

### Setup
1) Copy envs
```bash
cp .env.example .env
```
Fill in `OPENAI_API_KEY` and optionally adjust `MONGO_URI` and `PORT`.

2) Install dependencies
```bash
npm install
```

3) Seed database with example visa docs
```bash
npm run seed
```

4) Run the full app (backend + frontend)
```bash
npm run dev
```
Frontend: http://localhost:5173
Backend: http://localhost:5000

### API
- POST `/api/query` { question: string }
  - Returns `{ answer, sources }`
- POST `/api/seed` { docs?: {title,category,content}[] }
  - Rebuilds the knowledge base with embeddings

### Implementation Notes
- Embeddings model: `text-embedding-3-small`
- Chat model: `gpt-4o-mini`
- Cosine similarity computed via MongoDB aggregation over stored embedding vectors