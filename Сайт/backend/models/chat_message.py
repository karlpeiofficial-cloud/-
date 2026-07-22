
from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from datetime import datetime, timezone

from database import Base


class ChatRecord(Base):
    __tablename__ = "chat_records"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    role = Column(String(10), nullable=False)
    content = Column(String(2000), nullable=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
