

import warnings
warnings.filterwarnings("ignore")

import pickle
import numpy as np
import pandas as pd
from pathlib import Path


class ModelLoader:
    MODEL_PATH = Path(__file__).parent.parent / "models" / "credit_model_complete.pkl2"

    SCORE_MAP = {0: "Poor", 1: "Standard", 2: "Good"}

    def __init__(self):
        self.model = None
        self.scaler = None
        self.onehot_encoder = None
        self.mlb = None
        self.feature_names = None
        self.is_loaded = False

    def load(self) -> bool:
        if not self.MODEL_PATH.exists():
            return False
        try:
            with open(self.MODEL_PATH, "rb") as f:
                bundle = pickle.load(f)
            self.model = bundle["model"]
            self.scaler = bundle["scaler"]
            self.onehot_encoder = bundle["onehot_encoder"]
            self.mlb = bundle["mlb"]
            self.feature_names = bundle["feature_names"]
            self.is_loaded = True
            return True
        except Exception:
            return False

    def predict(self, data: dict) -> dict | None:
        if not self.is_loaded:
            return None
        try:
            features = self._build_features(data)
            prediction = self.model.predict(features)[0]
            probabilities = self.model.predict_proba(features)[0]
            score_label = self.SCORE_MAP.get(int(prediction), "Standard")
            return {
                "prediction": int(prediction),
                "label": score_label,
                "probabilities": {
                    "poor": round(float(probabilities[0]) * 100, 1),
                    "standard": round(float(probabilities[1]) * 100, 1),
                    "good": round(float(probabilities[2]) * 100, 1),
                },
            }
        except Exception:
            return None

    def _build_features(self, data: dict) -> np.ndarray:
        numeric_cols = [
            "age", "annual_income", "monthly_inhand_salary",
            "credit_history_age", "total_emi_per_month",
            "num_bank_accounts", "num_credit_card", "interest_rate",
            "num_of_loan", "delay_from_due_date", "num_of_delayed_payment",
            "changed_credit_limit", "num_credit_inquiries",
            "outstanding_debt", "credit_utilization_ratio",
            "amount_invested_monthly", "monthly_balance",
        ]

        numeric_values = [float(data.get(col, 0)) for col in numeric_cols]

        cat_data = pd.DataFrame([{
            "occupation": data.get("occupation", "Developer"),
            "credit_mix": data.get("credit_mix", "Standard"),
            "payment_of_min_amount": data.get("payment_of_min_amount", "No"),
            "payment_behaviour": data.get("payment_behaviour", "Low_spent_Small_value_payments"),
        }])
        cat_transformed = self.onehot_encoder.transform(cat_data)
        if hasattr(cat_transformed, "toarray"):
            cat_encoded = cat_transformed.toarray().flatten()
        else:
            cat_encoded = np.asarray(cat_transformed).flatten()

        loan_types = data.get("type_of_loan", [])
        if isinstance(loan_types, str):
            loan_types = [loan_types]
        loan_encoded = self.mlb.transform([loan_types]).flatten()

        all_features = np.concatenate([numeric_values, loan_encoded, cat_encoded])
        all_features = all_features.reshape(1, -1)
        all_features = self.scaler.transform(all_features)
        return all_features


model_loader = ModelLoader()
