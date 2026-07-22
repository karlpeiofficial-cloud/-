
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from database import get_db
from models.user import User
from models.analysis import AnalysisRecord
from schemas.analysis import AnalysisRequest, AnalysisResponse
from services.credit_scoring import CreditScoringService
from services.auth_service import get_current_user

router = APIRouter()
scoring_service = CreditScoringService()


@router.post("/predict", response_model=AnalysisResponse)
def predict(
    payload: AnalysisRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if not current_user.trial_active:
        raise HTTPException(status_code=403, detail="Пробный период истёк. Оформите подписку для продолжения.")

    result = scoring_service.predict(payload)

    record = AnalysisRecord(
        user_id=current_user.id,
        credit_score=result["credit_score"],
        approval_probability=result["approval_probability"],
        recommended_amount=result["recommended_amount"],
        debt_ratio=result["debt_ratio"],
        verdict=result["verdict"],
        input_data=payload.model_dump(),
        recommendations=result["recommendations"],
        model_version=result["model_version"],
    )
    db.add(record)
    db.commit()

    return AnalysisResponse(**result)


@router.get("/history")
def get_history(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    records = (
        db.query(AnalysisRecord)
        .filter(AnalysisRecord.user_id == current_user.id)
        .order_by(AnalysisRecord.created_at.desc())
        .limit(20)
        .all()
    )
    return [
        {
            "id": r.id,
            "credit_score": r.credit_score,
            "approval_probability": r.approval_probability,
            "recommended_amount": r.recommended_amount,
            "debt_ratio": r.debt_ratio,
            "verdict": r.verdict,
            "created_at": r.created_at.isoformat() if r.created_at else None,
        }
        for r in records
    ]
