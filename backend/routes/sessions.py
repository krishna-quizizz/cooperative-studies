import uuid
from fastapi import APIRouter, HTTPException
from models import Session, CreateSessionRequest, ControlRequest
from routes.topics import load_topics
import store

router = APIRouter(prefix="/api/sessions", tags=["sessions"])


@router.post("", response_model=Session)
async def create_session(req: CreateSessionRequest):
    topics = load_topics()
    topic = next((t for t in topics if t.id == req.topic_id), None)
    if not topic:
        raise HTTPException(status_code=404, detail="Topic not found")

    session_id = str(uuid.uuid4())[:8]
    session = Session(
        id=session_id,
        topic=topic,
        roles=req.roles,
        script=req.script,
        status="waiting",
    )
    store.sessions[session_id] = session
    return session


@router.get("/{session_id}", response_model=Session)
async def get_session(session_id: str):
    session = store.sessions.get(session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    return session


@router.post("/{session_id}/control")
async def control_session(session_id: str, req: ControlRequest):
    session = store.sessions.get(session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")

    if req.action == "start":
        session.status = "running"
    elif req.action == "pause":
        session.status = "waiting"
    elif req.action == "reset":
        session.status = "waiting"
        session.current_line_index = 0
    else:
        raise HTTPException(status_code=400, detail="Invalid action")

    return {"status": session.status}
