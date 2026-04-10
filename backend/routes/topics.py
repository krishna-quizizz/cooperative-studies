import json
from pathlib import Path
from fastapi import APIRouter, HTTPException
from models import Topic

router = APIRouter(prefix="/api/topics", tags=["topics"])

DATA_DIR = Path(__file__).parent.parent / "data"


def load_topics() -> list[Topic]:
    with open(DATA_DIR / "sample_topics.json") as f:
        return [Topic(**t) for t in json.load(f)]


@router.get("", response_model=list[Topic])
async def list_topics():
    return load_topics()


@router.get("/{topic_id}", response_model=Topic)
async def get_topic(topic_id: str):
    for topic in load_topics():
        if topic.id == topic_id:
            return topic
    raise HTTPException(status_code=404, detail="Topic not found")
