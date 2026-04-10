from pydantic import BaseModel


class Topic(BaseModel):
    id: str
    title: str
    description: str
    category: str


class StudentRole(BaseModel):
    role_name: str
    student_label: str
    task: str
    table_id: int = 1


class ScriptLine(BaseModel):
    speaker: str
    text: str
    is_alert: bool = False
    table_id: int = 1


class TableGroup(BaseModel):
    table_id: int
    roles: list[StudentRole]
    script: list[ScriptLine]


class GenerateRequest(BaseModel):
    topic_id: str
    group_size: int = 4
    num_tables: int = 3


class GenerateResponse(BaseModel):
    topic_id: str
    roles: list[StudentRole]
    script: list[ScriptLine]


class Session(BaseModel):
    id: str
    topic: Topic
    roles: list[StudentRole]
    script: list[ScriptLine]
    current_line_index: int = 0
    status: str = "waiting"  # waiting | running | finished


class CreateSessionRequest(BaseModel):
    topic_id: str
    roles: list[StudentRole]
    script: list[ScriptLine]


class ControlRequest(BaseModel):
    action: str  # start | pause | reset
