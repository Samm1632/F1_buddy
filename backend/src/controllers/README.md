# controllers

Controller modules coordinate handling of a request.

- Validate input and shape errors
- Call services (OpenAI, citation search)
- Persist to DB when needed
- Return `{ answer, citations }` for QnA

Files
- `ask.controller.js` – main QnA flow
- `citations.controller.js` – citations search API