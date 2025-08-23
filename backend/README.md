# Backend

Express + MongoDB API providing QnA and citation search.

Pipeline overview
- Routes receive HTTP requests and map to controllers
- Controllers validate input and orchestrate services
- Services call OpenAI and search for official citations; DB is used for persistence
- Models define MongoDB schemas
- Responses are returned to the frontend

Key entrypoints
- `src/server.js` – app bootstrap
- `src/routes/*` – API endpoints
- `src/controllers/*` – request handling
- `src/services/*` – integration/business logic
- `src/models/*` – data models
- `src/db/*` – Mongo connection
- `src/config/*` – environment config