import asyncio
import json
from models import ScriptLine, Session


async def stream_script(session: Session, start_index: int = 0):
    """Yields SSE events for a discussion script, word by word.

    Waits until session.status == 'running' before emitting events.
    Replays already-completed lines (before start_index) instantly, then
    streams the remainder at normal speed while tracking current_line_index.
    """
    # Wait for teacher to start the session
    while session.status == "waiting":
        await asyncio.sleep(0.5)

    # Replay already-completed lines instantly (catch-up for late subscribers)
    for line in session.script[:start_index]:
        yield _sse_event("speaker", {
            "speaker": line.speaker,
            "is_alert": line.is_alert,
            "table_id": line.table_id,
        })
        yield _sse_event("line_complete", {
            "speaker": line.speaker,
            "text": line.text,
            "is_alert": line.is_alert,
            "table_id": line.table_id,
        })

    # Stream remaining lines at normal speed
    for i, line in enumerate(session.script[start_index:], start=start_index):
        yield _sse_event("speaker", {
            "speaker": line.speaker,
            "is_alert": line.is_alert,
            "table_id": line.table_id,
        })
        await asyncio.sleep(0.3)

        words = line.text.split()
        for word in words:
            yield _sse_event("word", {
                "speaker": line.speaker,
                "word": word,
                "table_id": line.table_id,
            })
            await asyncio.sleep(0.12)

        yield _sse_event("line_complete", {
            "speaker": line.speaker,
            "text": line.text,
            "is_alert": line.is_alert,
            "table_id": line.table_id,
        })
        session.current_line_index = i + 1
        await asyncio.sleep(1.5)

    yield _sse_event("done", {})


def _sse_event(event: str, data: dict) -> str:
    return f"event: {event}\ndata: {json.dumps(data)}\n\n"
