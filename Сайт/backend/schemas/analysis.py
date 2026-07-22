

from pydantic import BaseModel, Field
from typing import Optional


class AnalysisRequest(BaseModel):
    age: int = Field(..., ge=18, le=100)
    annual_income: float = Field(..., ge=0)
    monthly_inhand_salary: float = Field(..., ge=0)
    credit_history_age: float = Field(default=0, ge=0)
    total_emi_per_month: float = Field(default=0, ge=0)
    num_bank_accounts: int = Field(default=0, ge=0)
    num_credit_card: int = Field(default=0, ge=0)
    interest_rate: float = Field(default=0, ge=0)
    num_of_loan: int = Field(default=0, ge=0)
    delay_from_due_date: float = Field(default=0, ge=0)
    num_of_delayed_payment: int = Field(default=0, ge=0)
    changed_credit_limit: float = Field(default=0)
    num_credit_inquiries: int = Field(default=0, ge=0)
    outstanding_debt: float = Field(default=0, ge=0)
    credit_utilization_ratio: float = Field(default=0, ge=0)
    amount_invested_monthly: float = Field(default=0, ge=0)
    monthly_balance: float = Field(default=0)
    occupation: str = Field(default="Developer")
    credit_mix: str = Field(default="Standard")
    payment_of_min_amount: str = Field(default="No")
    payment_behaviour: str = Field(default="Low_spent_Small_value_payments")
    type_of_loan: list[str] = Field(default_factory=list)


class AnalysisResponse(BaseModel):
    credit_score: int
    approval_probability: int
    recommended_amount: int
    debt_ratio: float
    verdict: str
    recommendations: list[str]
    model_version: str = "random-forest-v1"
    ml_prediction: Optional[str] = None
    ml_probabilities: Optional[dict] = None
