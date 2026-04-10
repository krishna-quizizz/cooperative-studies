import json
from pathlib import Path
from anthropic import Anthropic
from config import ANTHROPIC_API_KEY, MODEL
from models import Topic, StudentRole, ScriptLine

DATA_DIR = Path(__file__).parent.parent / "data"

client = Anthropic(api_key=ANTHROPIC_API_KEY) if ANTHROPIC_API_KEY else None


def _load_expert_cards(topic_id: str) -> list[dict] | None:
    """Return expert card list for a topic if one exists, else None."""
    try:
        with open(DATA_DIR / "expert_cards.json") as f:
            data = json.load(f)
        return data.get(topic_id, {}).get("expert_cards")
    except Exception:
        return None


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


def _roles_from_expert_cards(expert_cards: list[dict], num_tables: int) -> list[StudentRole]:
    """Build StudentRole objects directly from expert card data, one set per table."""
    roles = []
    label_idx = 0
    for table_id in range(1, num_tables + 1):
        for card in expert_cards:
            roles.append(StudentRole(
                role_name=card["title"],
                student_label=f"student_{chr(65 + label_idx)}",
                task=f'{card["persona"]} Primary goal: {card["primary_goal"]}',
                table_id=table_id,
            ))
            label_idx += 1
    return roles


def _replicate_script_for_tables(
    base_script: list[ScriptLine],
    num_cards: int,
    num_tables: int,
) -> list[ScriptLine]:
    """Replicate a single-table script across all tables with remapped student labels."""
    all_lines = []
    for t in range(num_tables):
        offset = t * num_cards
        label_map = {
            f"student_{chr(65 + i)}": f"student_{chr(65 + offset + i)}"
            for i in range(num_cards)
        }
        for line in base_script:
            all_lines.append(ScriptLine(
                speaker=label_map.get(line.speaker, line.speaker),
                text=line.text,
                is_alert=line.is_alert,
                table_id=t + 1,
            ))
    return all_lines


def _build_script_only_prompt(topic: Topic, expert_cards: list[dict]) -> str:
    """Prompt Claude for just the script (roles are pre-built from expert card data)."""
    num_cards = len(expert_cards)
    card_descriptions = "\n".join(
        f'- student_{chr(65 + i)} plays {c["title"]} ({c["name"]}): {c["persona"]} '
        f'Primary goal: {c["primary_goal"]}'
        for i, c in enumerate(expert_cards)
    )
    base_labels = ", ".join(f"student_{chr(65 + i)}" for i in range(num_cards))
    return f"""You are facilitating a Jigsaw II negotiation session titled "{topic.title}".

{topic.description}

The four negotiators are:
{card_descriptions}

Write a realistic negotiation script of 14-18 exchanges using ONLY these speakers: {base_labels} and AI_agent.
- AI_agent opens the session, asks probing questions, and guides toward compromise.
- Each student argues from their expert position using their key data and goals.
- Set is_alert to true for 2-3 pivotal moments where the teacher should intervene or spotlight a key trade-off.

Return ONLY valid JSON — no markdown, no explanation:
{{
  "script": [
    {{"speaker": "AI_agent", "text": "Welcome. Today we negotiate the CETA 2030 lithium tariff...", "is_alert": false}},
    {{"speaker": "student_A", "text": "Our workers need a floor of at least 30%...", "is_alert": false}}
  ]
}}"""


def _build_generic_prompt(topic: Topic, total_students: int, num_tables: int) -> str:
    student_labels = [f"student_{chr(65 + i)}" for i in range(total_students)]
    return f"""You are helping set up a classroom group discussion on the topic: "{topic.title}"

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


async def generate_roles_and_script(
    topic: Topic, group_size: int = 4, num_tables: int = 3,
) -> tuple[list[StudentRole], list[ScriptLine]]:
    total_students = group_size * num_tables

    if not client:
        return _load_fallback(num_tables)

    expert_cards = _load_expert_cards(topic.id)

    if expert_cards:
        # Roles come directly from the JSON — Claude only writes the script
        roles = _roles_from_expert_cards(expert_cards, num_tables)
        prompt = _build_script_only_prompt(topic, expert_cards)
        try:
            response = client.messages.create(
                model=MODEL,
                max_tokens=4096,
                messages=[{"role": "user", "content": prompt}],
            )
            data = json.loads(response.content[0].text)
            base_script = [ScriptLine(**s) for s in data["script"]]
            script = _replicate_script_for_tables(base_script, len(expert_cards), num_tables)
            return roles, script
        except Exception as e:
            print(f"Claude API error on expert script, using fallback: {e}")
            return _load_fallback(num_tables)
    else:
        prompt = _build_generic_prompt(topic, total_students, num_tables)
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
    with open(DATA_DIR / "sample_roles.json") as f:
        all_roles = [StudentRole(**r) for r in json.load(f)]

    with open(DATA_DIR / "sample_script.json") as f:
        all_script = [ScriptLine(**s) for s in json.load(f)]

    # JSON files are pre-built for 3 tables; filter if fewer requested
    valid_tables = set(range(1, num_tables + 1))
    roles = [r for r in all_roles if r.table_id in valid_tables]
    script = [s for s in all_script if s.table_id in valid_tables]

    return roles, script
