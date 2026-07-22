
from sqlalchemy import Column, Integer, String, DateTime
from sqlalchemy.orm import relationship
from datetime import datetime, timedelta, timezone

from database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    email = Column(String(255), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    phone = Column(String(20), nullable=True)
    city = Column(String(100), nullable=True)
    birthdate = Column(String(20), nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    trial_expires_at = Column(DateTime, default=lambda: datetime.now(timezone.utc) + timedelta(days=14))

    analyses = relationship("AnalysisRecord", back_populates="user")

    @property
    def trial_active(self) -> bool:
        if not self.trial_expires_at:
            return False
        expires = self.trial_expires_at
        if expires.tzinfo is None:
            expires = expires.replace(tzinfo=timezone.utc)
        return datetime.now(timezone.utc) < expires
