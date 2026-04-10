import json
from pathlib import Path
from anthropic import Anthropic
from config import ANTHROPIC_API_KEY, MODEL
from models import Topic, StudentRole, ScriptLine

DATA_DIR = Path(__file__).parent.parent / "data"

client = Anthropic(api_key=ANTHROPIC_API_KEY) if ANTHROPIC_API_KEY else None


def _assign_tables(
    roles: list[StudentRole],
    script: list[ScriptLine],
    num_tables: int,
) -> tuple[list[StudentRole], list[ScriptLine]]:
    """Post-generation split: assign table_id to roles round-robin, then tag script lines to match."""
    num_tables = max(1, num_tables)

    speaker_to_table: dict[str, int] = {}
    for i, role in enumerate(roles):
        tid = (i % num_tables) + 1
        role.table_id = tid
        speaker_to_table[role.student_label] = tid

    for line in script:
        line.table_id = speaker_to_table.get(line.speaker, 1)

    return roles, script


async def generate_roles_and_script(
    topic: Topic, group_size: int = 4, num_tables: int = 3,
) -> tuple[list[StudentRole], list[ScriptLine]]:
    total_students = group_size * num_tables

    if not client:
        return _load_fallback(num_tables)

    student_labels = [f"student_{chr(65 + i)}" for i in range(total_students)]

    prompt = f"""You are helping set up a classroom group discussion on the topic: "{topic.title}"

{topic.description}

Generate:
1. {total_students} distinct roles (e.g., Economist, CEO, Environmentalist, Policy Advisor) with a brief task description for each student.
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
        return _assign_tables(roles, script, num_tables)
    except Exception as e:
        print(f"Claude API error, using fallback: {e}")
        return _load_fallback(num_tables)


def _load_fallback(num_tables: int = 3) -> tuple[list[StudentRole], list[ScriptLine]]:
    base_roles = [
        ("Economist", "Analyze the economic implications and cost-benefit trade-offs."),
        ("CEO", "Represent the business perspective and discuss corporate responsibility."),
        ("Environmentalist", "Advocate for environmental protection and sustainability."),
        ("Policy Advisor", "Propose practical policy frameworks and implementation strategies."),
        ("Journalist", "Investigate and report on the public impact of the issue."),
        ("Data Scientist", "Provide statistical evidence and data-driven insights."),
        ("Community Leader", "Represent grassroots community concerns and needs."),
        ("Legal Expert", "Analyze regulatory frameworks and legal implications."),
        ("Urban Planner", "Consider infrastructure and city planning perspectives."),
        ("Health Specialist", "Assess public health implications and risks."),
        ("Educator", "Focus on awareness and educational outreach strategies."),
        ("Tech Innovator", "Propose technology-based solutions and innovations."),
    ]

    total_students = min(len(base_roles), 4 * num_tables)
    roles = [
        StudentRole(
            role_name=base_roles[i][0],
            student_label=f"student_{chr(65 + i)}",
            task=base_roles[i][1],
        )
        for i in range(total_students)
    ]

    with open(DATA_DIR / "sample_script.json") as f:
        script = [ScriptLine(**s) for s in json.load(f)]

    return _assign_tables(roles, script, num_tables)
