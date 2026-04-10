from fastapi import APIRouter, HTTPException
from models import GenerateRequest, GenerateResponse
from routes.topics import load_topics
from services.claude_service import generate_roles_and_script

router = APIRouter(prefix="/api", tags=["generate"])


@router.post("/generate-tasks", response_model=GenerateResponse)
async def generate_tasks(req: GenerateRequest):
    topics = load_topics()
    topic = next((t for t in topics if t.id == req.topic_id), None)
    if not topic:
        raise HTTPException(status_code=404, detail="Topic not found")

    roles, script = await generate_roles_and_script(topic, req.group_size)

    return GenerateResponse(
        topic_id=req.topic_id,
        roles=roles,
        script=script,
    )
