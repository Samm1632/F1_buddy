# backend/src

Holds all application code for the API.

- `server.js` – Express server setup, security, CORS, rate limiting
- `routes/` – URL routing to controllers
- `controllers/` – request parsing and service orchestration
- `services/` – external integrations (OpenAI, citations)
- `models/` – Mongo schemas
- `db/` – DB connection utils
- `config/` – environment loader
- `middleware/` – cross-cutting concerns (future)
- `utils/` – small helpers (future)