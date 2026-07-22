
from pydantic import BaseModel, Field
from typing import Optional


class ChatMessage(BaseModel):
    message: str = Field(..., min_length=1, max_length=2000)


class ChatResponse(BaseModel):
    response: str
    context: Optional[str] = None
