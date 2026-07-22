
from pydantic import BaseModel, Field
from typing import Optional


class UserUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=2, max_length=100)
    phone: Optional[str] = None
    city: Optional[str] = None
    birthdate: Optional[str] = None
