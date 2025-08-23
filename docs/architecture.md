## Architecture

- Frontend: Vue 3 + Vite SPA
  - Component: `ChatPanel.vue` calls backend `/api/ask`
- Backend: Express API
  - Routes: `/api/ask` (QnA), `/api/citations/search` (search sources)
  - Services: OpenAI client, simple citation search filtered by official domains
  - DB: MongoDB (optional) for conversations and caching

## API

POST `/api/ask`
- Body: `{ question: string, sessionId?: string }`
- Response: `{ answer: string, citations: {title, url, domain}[] }`

GET `/api/citations/search?q=...`
- Response: `{ results: {title, url, domain}[] }`

## Flow
1. User asks a question in the UI
2. Backend searches for official sources and passes summaries/links to the model
3. Model generates an answer; backend returns answer + citations
4. Conversation optionally saved to Mongo

## Notes
- The backend enforces a rate limiter and CORS
- Mongo is optional at startup; warnings are logged if unavailable