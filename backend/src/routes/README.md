# routes

Defines API endpoints and wires them to controllers.

- `ask.routes.js` – POST `/api/ask` for QnA
- `citations.routes.js` – GET `/api/citations/search` to find sources
- `index.js` – aggregator (optional)

Flow: client -> route -> controller -> services -> response