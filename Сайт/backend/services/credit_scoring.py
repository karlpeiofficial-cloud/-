

from schemas.analysis import AnalysisRequest
from ml.model_loader import model_loader


class CreditScoringService:

    def __init__(self):
        if not model_loader.is_loaded:
            model_loader.load()

    def predict(self, data: AnalysisRequest) -> dict:
        ml_result = model_loader.predict(data.model_dump()) if model_loader.is_loaded else None

        if ml_result:
            return self._build_ml_response(data, ml_result)
        return self._build_fallback_response(data)

    def _build_ml_response(self, data: AnalysisRequest, ml_result: dict) -> dict:
        label = ml_result["label"]
        probs = ml_result["probabilities"]

        score_map = {"Poor": 30, "Standard": 60, "Good": 85}
        base_score = score_map.get(label, 50)

        good_prob = probs.get("good", 0)
        credit_score = min(100, int(base_score + good_prob * 0.15))

        approval_probability = int(good_prob * 0.7 + probs.get("standard", 0) * 0.3)
        approval_probability = min(95, max(5, approval_probability))

        debt_ratio = 0.0
        if data.monthly_inhand_salary > 0:
            debt_ratio = (data.total_emi_per_month / data.monthly_inhand_salary) * 100

        recommended = self._calculate_recommended(data, credit_score)
        verdict = self._get_verdict(credit_score)
        recommendations = self._get_recommendations(data, credit_score, debt_ratio, label)

        return {
            "credit_score": credit_score,
            "approval_probability": approval_probability,
            "recommended_amount": recommended,
            "debt_ratio": round(debt_ratio, 1),
            "verdict": verdict,
            "recommendations": recommendations,
            "model_version": "random-forest-v1",
            "ml_prediction": label,
            "ml_probabilities": probs,
        }

    def _build_fallback_response(self, data: AnalysisRequest) -> dict:
        score = 50
        if data.credit_mix == "Good":
            score += 20
        elif data.credit_mix == "Bad":
            score -= 15

        if data.num_of_delayed_payment == 0:
            score += 10
        elif data.num_of_delayed_payment > 5:
            score -= 15

        if data.monthly_inhand_salary > 0:
            ratio = data.total_emi_per_month / data.monthly_inhand_salary
            if ratio < 0.3:
                score += 10
            elif ratio > 0.6:
                score -= 10

        score = max(10, min(100, score))
        probability = min(95, max(5, score))
        debt_ratio = 0.0
        if data.monthly_inhand_salary > 0:
            debt_ratio = (data.total_emi_per_month / data.monthly_inhand_salary) * 100

        recommended = self._calculate_recommended(data, score)
        verdict = self._get_verdict(score)
        recommendations = self._get_recommendations(data, score, debt_ratio, "Standard")

        return {
            "credit_score": score,
            "approval_probability": probability,
            "recommended_amount": recommended,
            "debt_ratio": round(debt_ratio, 1),
            "verdict": verdict,
            "recommendations": recommendations,
            "model_version": "rule-based-v1",
            "ml_prediction": None,
            "ml_probabilities": None,
        }

    def _calculate_recommended(self, data: AnalysisRequest, score: int) -> int:
        base = data.monthly_inhand_salary * 6
        factor = score / 100
        recommended = int(base * factor)
        recommended = max(50000, recommended)
        return (recommended // 10000) * 10000

    def _get_verdict(self, score: int) -> str:
        if score >= 70:
            return "Высокая вероятность одобрения"
        elif score >= 40:
            return "Средняя вероятность одобрения"
        return "Низкая вероятность одобрения"

    def _get_recommendations(self, data: AnalysisRequest, score: int, debt_ratio: float, label: str) -> list:
        recs = []

        if debt_ratio > 50:
            recs.append("Снизьте долговую нагрузку — EMI превышает 50% дохода")

        if label == "Poor":
            recs.append("Модель оценила ваш профиль как «Poor». Сосредоточьтесь на погашении просрочек")

        if data.num_of_delayed_payment > 3:
            recs.append("Большое количество просрочек — платите вовремя минимум 6 месяцев")

        if data.credit_utilization_ratio > 70:
            recs.append("Высокая утилизация кредитного лимита — снизьте использование до 30%")

        if data.num_credit_inquiries > 4:
            recs.append("Слишком много кредитных запросов — воздержитесь от новых заявок")

        if data.outstanding_debt > data.annual_income * 0.5:
            recs.append("Непогашенный долг превышает 50% годового дохода — приоритизируйте погашение")

        if not recs:
            recs.append("Ваш профиль выглядит надёжно. Подавайте заявку с уверенностью!")

        return recs
