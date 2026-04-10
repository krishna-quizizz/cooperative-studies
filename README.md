# Cooperative Studies

AI-powered cooperative learning platform — FastAPI backend + React (Vite) frontend.

## Prerequisites

- Python 3.10+
- Node.js 18+
- An [Anthropic API key](https://console.anthropic.com/)

## Setup & Run

### Backend

```bash
cd backend
cp .env.example .env        # then edit .env with your real Anthropic key
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload
```

Runs on `http://localhost:8000`.

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Runs on `http://localhost:5173`. API calls are proxied to the backend automatically.

## Project Structure

```
backend/
  main.py            # FastAPI app entrypoint
  config.py          # Env var loading
  models.py          # Pydantic models
  routes/            # API route modules
  services/          # Claude / streaming services
  data/              # Sample data (topics, scripts)
frontend/
  src/
    pages/           # Teacher dashboard, student panel, topic setup
    components/      # Reusable UI components
    api.js           # API client
```
