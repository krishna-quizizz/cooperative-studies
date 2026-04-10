import asyncio
import json
from collections import defaultdict
from models import ScriptLine, Session


def _interleave_by_table(script: list[ScriptLine]) -> list[ScriptLine]:
    """Reorder script lines round-robin by table_id so all tables progress simultaneously."""
    buckets: dict[int, list[ScriptLine]] = defaultdict(list)
    for line in script:
        buckets[line.table_id].append(line)

    interleaved: list[ScriptLine] = []
    table_ids = sorted(buckets.keys())
    max_len = max((len(b) for b in buckets.values()), default=0)
    for i in range(max_len):
        for tid in table_ids:
            if i < len(buckets[tid]):
                interleaved.append(buckets[tid][i])
    return interleaved


async def stream_script(session: Session, start_index: int = 0):
    """Yields SSE events for a discussion script, word by word.

    Waits until session.status == 'running' before emitting events.
    Replays already-completed lines (before start_index) instantly, then
    streams the remainder at normal speed while tracking current_line_index.

    Lines are interleaved by table_id so all tables progress in parallel.
    """
    interleaved = _interleave_by_table(session.script)

    while session.status == "waiting":
        await asyncio.sleep(0.5)

    for line in interleaved[:start_index]:
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

    for i, line in enumerate(interleaved[start_index:], start=start_index):
        yield _sse_event("speaker", {
            "speaker": line.speaker,
            "is_alert": line.is_alert,
            "table_id": line.table_id,
        })
        await asyncio.sleep(0.25)

        words = line.text.split()
        for word in words:
            yield _sse_event("word", {
                "speaker": line.speaker,
                "word": word,
                "table_id": line.table_id,
            })
            await asyncio.sleep(0.1)

        yield _sse_event("line_complete", {
            "speaker": line.speaker,
            "text": line.text,
            "is_alert": line.is_alert,
            "table_id": line.table_id,
        })
        session.current_line_index = i + 1
        await asyncio.sleep(0.8)

    yield _sse_event("done", {})


def _sse_event(event: str, data: dict) -> str:
    return f"event: {event}\ndata: {json.dumps(data)}\n\n"
