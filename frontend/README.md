# Frontend

Vue 3 + Vite single-page app for the QnA chatbot.

Pipeline overview
- Renders chat UI
- Sends questions to backend `/api/ask`
- Displays answers and official citations

Key files
- `index.html` – Vite entry page
- `vite.config.ts` – dev server proxy to backend
- `src/main.ts` – app bootstrap
- `src/App.vue` – layout
- `src/components/ChatPanel.vue` – chat UI and API calls
- `src/styles/main.css` – global styles