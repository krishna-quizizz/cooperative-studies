import json
from pathlib import Path
from anthropic import Anthropic
from config import ANTHROPIC_API_KEY, MODEL
from models import Topic, StudentRole, ScriptLine

DATA_DIR = Path(__file__).parent.parent / "data"

client = Anthropic(api_key=ANTHROPIC_API_KEY) if ANTHROPIC_API_KEY else None


async def generate_roles_and_script(
    topic: Topic, group_size: int = 4
) -> tuple[list[StudentRole], list[ScriptLine]]:
    if not client:
        return _load_fallback()

    student_labels = [f"student_{chr(65 + i)}" for i in range(group_size)]

    prompt = f"""You are helping set up a classroom group discussion on the topic: "{topic.title}"

{topic.description}

Generate:
1. {group_size} distinct roles (e.g., Economist, CEO, Environmentalist, Policy Advisor) with a brief task description for each student.
2. A realistic discussion script of 12-18 exchanges between these students and an AI_agent moderator. The AI_agent should keep discussion on track, ask probing questions, and occasionally flag something for the teacher (set is_alert to true for those).

Use these student labels: {', '.join(student_labels)}

Return ONLY valid JSON with this exact schema (no markdown, no explanation):
{{
  "roles": [
    {{"role_name": "Economist", "student_label": "student_A", "task": "Analyze economic implications..."}}
  ],
  "script": [
    {{"speaker": "student_A", "text": "As an economist, I believe...", "is_alert": false}},
    {{"speaker": "AI_agent", "text": "Great point! Let's consider...", "is_alert": false}}
  ]
}}"""

    try:
        response = client.messages.create(
            model=MODEL,
            max_tokens=4096,
            messages=[{"role": "user", "content": prompt}],
        )
        text = response.content[0].text
        data = json.loads(text)
        roles = [StudentRole(**r) for r in data["roles"]]
        script = [ScriptLine(**s) for s in data["script"]]
        return roles, script
    except Exception as e:
        print(f"Claude API error, using fallback: {e}")
        return _load_fallback()


def _load_fallback() -> tuple[list[StudentRole], list[ScriptLine]]:
    roles = [
        StudentRole(role_name="Economist", student_label="student_A", task="Analyze the economic implications and cost-benefit trade-offs."),
        StudentRole(role_name="CEO", student_label="student_B", task="Represent the business perspective and discuss corporate responsibility."),
        StudentRole(role_name="Environmentalist", student_label="student_C", task="Advocate for environmental protection and sustainability."),
        StudentRole(role_name="Policy Advisor", student_label="student_D", task="Propose practical policy frameworks and implementation strategies."),
    ]
    with open(DATA_DIR / "sample_script.json") as f:
        script = [ScriptLine(**s) for s in json.load(f)]
    return roles, script
