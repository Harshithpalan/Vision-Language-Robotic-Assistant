from pydantic import BaseModel
from typing import Optional


class ChatMessage(BaseModel):
    role: str
    content: str
    image: Optional[str] = None


class CommandRequest(BaseModel):
    text: str
    image_base64: Optional[str] = None


class RobotStatus(BaseModel):
    position: list[float] = [0.0, 0.0, 0.0]
    state: str = "idle"
    battery: float = 100.0
