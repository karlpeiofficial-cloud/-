
from fastapi import APIRouter, Depends, Request, Form
from fastapi.responses import RedirectResponse, HTMLResponse
from fastapi.templating import Jinja2Templates
from sqlalchemy.orm import Session
from pathlib import Path

from database import get_db
from models.user import User
from models.analysis import AnalysisRecord
from models.chat_message import ChatRecord
from schemas.analysis import AnalysisRequest
from services.credit_scoring import CreditScoringService
from services.chat_service import ChatService
from services.auth_service import get_current_user

router = APIRouter()
templates = Jinja2Templates(directory=str(Path(__file__).parent.parent / "templates"))
scoring_service = CreditScoringService()
chat_service = ChatService()


@router.get("/dashboard", response_class=HTMLResponse)
def dashboard_page(
    request: Request,
    tab: str = "overview",
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    history = (
        db.query(AnalysisRecord)
        .filter(AnalysisRecord.user_id == current_user.id)
        .order_by(AnalysisRecord.created_at.desc())
        .limit(20)
        .all()
    )

    latest = history[0] if history else None

    messages = (
        db.query(ChatRecord)
        .filter(ChatRecord.user_id == current_user.id)
        .order_by(ChatRecord.created_at.asc())
        .limit(50)
        .all()
    )

    return templates.TemplateResponse("dashboard.html", {
        "request": request,
        "user": current_user,
        "tab": tab,
        "history": history,
        "latest": latest,
        "messages": messages,
    })


@router.post("/dashboard/analysis")
def dashboard_analysis(
    age: int = Form(...),
    occupation: str = Form(...),
    annual_income: float = Form(...),
    monthly_inhand_salary: float = Form(...),
    credit_history_age: float = Form(0),
    num_bank_accounts: int = Form(0),
    total_emi_per_month: float = Form(0),
    num_credit_card: int = Form(0),
    interest_rate: float = Form(0),
    num_of_loan: int = Form(0),
    outstanding_debt: float = Form(0),
    credit_utilization_ratio: float = Form(0),
    amount_invested_monthly: float = Form(0),
    monthly_balance: float = Form(0),
    delay_from_due_date: float = Form(0),
    num_of_delayed_payment: int = Form(0),
    changed_credit_limit: float = Form(0),
    num_credit_inquiries: int = Form(0),
    credit_mix: str = Form("Standard"),
    payment_of_min_amount: str = Form("No"),
    payment_behaviour: str = Form("Low_spent_Small_value_payments"),
    type_of_loan: str = Form("Personal Loan"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    payload = AnalysisRequest(
        age=age,
        occupation=occupation,
        annual_income=annual_income,
        monthly_inhand_salary=monthly_inhand_salary,
        credit_history_age=credit_history_age,
        num_bank_accounts=num_bank_accounts,
        total_emi_per_month=total_emi_per_month,
        num_credit_card=num_credit_card,
        interest_rate=interest_rate,
        num_of_loan=num_of_loan,
        outstanding_debt=outstanding_debt,
        credit_utilization_ratio=credit_utilization_ratio,
        amount_invested_monthly=amount_invested_monthly,
        monthly_balance=monthly_balance,
        delay_from_due_date=delay_from_due_date,
        num_of_delayed_payment=num_of_delayed_payment,
        changed_credit_limit=changed_credit_limit,
        num_credit_inquiries=num_credit_inquiries,
        credit_mix=credit_mix,
        payment_of_min_amount=payment_of_min_amount,
        payment_behaviour=payment_behaviour,
        type_of_loan=[type_of_loan],
    )

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

    return RedirectResponse(url="/dashboard?tab=overview", status_code=303)


@router.post("/dashboard/chat")
def dashboard_chat(
    message: str = Form(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    user_msg = ChatRecord(user_id=current_user.id, role="user", content=message)
    db.add(user_msg)
    db.commit()

    response_text = chat_service.get_response(message, user_name=current_user.name)
    bot_msg = ChatRecord(user_id=current_user.id, role="bot", content=response_text)
    db.add(bot_msg)
    db.commit()

    return RedirectResponse(url="/dashboard?tab=assistant", status_code=303)


@router.post("/dashboard/profile")
def dashboard_profile(
    name: str = Form(None),
    phone: str = Form(None),
    city: str = Form(None),
    birthdate: str = Form(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if name:
        current_user.name = name
    if phone:
        current_user.phone = phone
    if city:
        current_user.city = city
    if birthdate:
        current_user.birthdate = birthdate

    db.commit()
    return RedirectResponse(url="/dashboard?tab=profile", status_code=303)
