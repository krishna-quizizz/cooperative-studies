from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse
from services.script_streamer import stream_script
import store

router = APIRouter(prefix="/api/sessions", tags=["stream"])


@router.get("/{session_id}/stream")
async def stream_session(session_id: str):
    session = store.sessions.get(session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")

    return StreamingResponse(
        stream_script(session.script),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
        },
    )
