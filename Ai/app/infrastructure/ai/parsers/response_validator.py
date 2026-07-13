"""
Response Validator

Chuẩn hóa và kiểm tra kết quả trả về từ LLM.
Đảm bảo các trường đúng kiểu và nằm trong phạm vi hợp lệ.
"""

from __future__ import annotations


def _clamp(value, lo, hi):
    return max(lo, min(value, hi))


class ResponseValidator:
    ALLOWED_STATUS = {"safe", "malicious"}
    ALLOWED_LEVEL = {"Low", "Medium", "High"}

    def validate(self, result: dict) -> dict:
        # --- risk_score ---
        try:
            score = _clamp(int(result.get("risk_score", 50)), 0, 100)
        except (TypeError, ValueError):
            score = 50
        result["risk_score"] = score

        # --- status — phải nhất quán với score ---
        status = str(result.get("status", "")).lower()
        if status not in self.ALLOWED_STATUS:
            status = "safe" if score <= 20 else "malicious"
        result["status"] = status

        # --- level — phải nhất quán với score ---
        level = result.get("level", "")
        if level not in self.ALLOWED_LEVEL:
            if score <= 20:
                level = "Low"
            elif score <= 60:
                level = "Medium"
            else:
                level = "High"
        result["level"] = level

        # --- confidence ---
        try:
            confidence = _clamp(float(result.get("confidence", 0.5)), 0.0, 1.0)
        except (TypeError, ValueError):
            confidence = 0.5
        result["confidence"] = confidence

        # --- categories ---
        categories = result.get("categories", [])
        result["categories"] = (
            [str(categories)] if not isinstance(categories, list) else categories
        )

        # --- indicators ---
        indicators = result.get("indicators", [])
        result["indicators"] = (
            [str(indicators)] if not isinstance(indicators, list) else indicators
        )

        # --- reason — giữ tối đa 1 câu ---
        reason = result.get("reason", [])
        if isinstance(reason, str):
            reason = [reason]
        elif not isinstance(reason, list):
            reason = []
        result["reason"] = reason[:1]

        # --- analysis_type ---
        result.setdefault("analysis_type", "LLM")

        return result
