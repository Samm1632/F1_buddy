## Local setup

Prereqs
- Node.js 18+ and npm
- MongoDB running locally (optional; server will start without it)

Steps
1) Backend env
   - Copy `backend/.env.example` to `backend/.env`
   - Set `OPENAI_API_KEY` and adjust ports if needed
2) Install dependencies
   ```bash
   cd backend && npm install
   cd ../frontend && npm install
   ```
3) Run dev (two terminals or ./scripts/dev.sh)
   ```bash
   # Terminal 1
   cd backend
   npm run dev

   # Terminal 2
   cd frontend
   npm run dev
   ```
   - Backend: http://localhost:3001/health
   - Frontend: http://localhost:5173

Troubleshooting
- Port in use (EADDRINUSE): stop any existing process on port 3001, or set `PORT=3002` in `backend/.env`
- Mongo not running: the app continues without DB; to enable DB features, start Mongo and set `MONGODB_URI`
- OpenAI errors: ensure `OPENAI_API_KEY` is valid and `OPENAI_MODEL` exists