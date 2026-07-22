
from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, JSON
from sqlalchemy.orm import relationship
from datetime import datetime, timezone

from database import Base


class AnalysisRecord(Base):
    __tablename__ = "analysis_records"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    credit_score = Column(Integer, nullable=False)
    approval_probability = Column(Integer, nullable=False)
    recommended_amount = Column(Integer, nullable=False)
    debt_ratio = Column(Float, nullable=False)
    verdict = Column(String(200), nullable=False)
    input_data = Column(JSON, nullable=True)
    recommendations = Column(JSON, nullable=True)
    model_version = Column(String(50), default="rule-based-v1")
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    user = relationship("User", back_populates="analyses")
