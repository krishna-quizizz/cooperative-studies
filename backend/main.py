from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routes import topics, generate, sessions, stream

app = FastAPI(title="Cooperative Studies API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(topics.router)
app.include_router(generate.router)
app.include_router(sessions.router)
app.include_router(stream.router)


@app.get("/api/health")
async def health():
    return {"status": "ok"}
