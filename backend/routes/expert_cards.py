import json
from pathlib import Path
from fastapi import APIRouter, HTTPException

router = APIRouter(prefix="/api/expert-cards", tags=["expert_cards"])

DATA_DIR = Path(__file__).parent.parent / "data"


@router.get("/{topic_id}")
async def get_expert_cards(topic_id: str):
    try:
        with open(DATA_DIR / "expert_cards.json") as f:
            data = json.load(f)
    except FileNotFoundError:
        raise HTTPException(status_code=404, detail="Expert cards file not found")

    topic_data = data.get(topic_id)
    if not topic_data:
        raise HTTPException(status_code=404, detail="No expert cards for this topic")

    return topic_data
