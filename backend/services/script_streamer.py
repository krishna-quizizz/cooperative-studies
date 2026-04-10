import asyncio
import json
from models import ScriptLine


async def stream_script(script: list[ScriptLine]):
    """Yields SSE events for a discussion script, word by word."""
    for line in script:
        # Announce the speaker
        yield _sse_event("speaker", {
            "speaker": line.speaker,
            "is_alert": line.is_alert,
        })
        await asyncio.sleep(0.3)

        # Stream text word by word
        words = line.text.split()
        for word in words:
            yield _sse_event("word", {
                "speaker": line.speaker,
                "word": word,
            })
            await asyncio.sleep(0.12)

        # Send complete line
        yield _sse_event("line_complete", {
            "speaker": line.speaker,
            "text": line.text,
            "is_alert": line.is_alert,
        })
        await asyncio.sleep(1.5)

    yield _sse_event("done", {})


def _sse_event(event: str, data: dict) -> str:
    return f"event: {event}\ndata: {json.dumps(data)}\n\n"
