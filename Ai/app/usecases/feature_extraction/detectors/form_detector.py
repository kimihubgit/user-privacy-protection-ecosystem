"""
Form Detector

Phân tích form HTML để phát hiện dấu hiệu thu thập thông tin.
"""

from __future__ import annotations

from bs4 import BeautifulSoup

# Từ khóa OTP thường xuất hiện trong name/placeholder/id của input
_OTP_HINTS = {"otp", "pin", "passcode", "verification", "mã", "xác minh"}


class FormDetector:
    def detect(self, html: str) -> dict:
        if not html:
            return {
                "has_login_form": False,
                "password_inputs": 0,
                "email_inputs": 0,
                "hidden_inputs": 0,
                "otp_inputs": 0,
                "external_form_action": False,
            }

        soup = BeautifulSoup(html, "lxml")
        forms = soup.find_all("form")

        passwords = soup.find_all("input", {"type": "password"})
        emails = soup.find_all("input", {"type": "email"})
        hidden = soup.find_all("input", {"type": "hidden"})

        # OTP inputs: type=text/number với name/placeholder/id chứa gợi ý OTP
        otp_count = 0
        for inp in soup.find_all("input", {"type": ["text", "number", "tel"]}):
            attrs = " ".join(
                str(inp.get(a, "")).lower()
                for a in ("name", "placeholder", "id", "aria-label")
            )
            if any(hint in attrs for hint in _OTP_HINTS):
                otp_count += 1

        # External form action: action bắt đầu bằng http khác domain
        external = any(form.get("action", "").startswith("http") for form in forms)

        return {
            "has_login_form": len(forms) > 0,
            "password_inputs": len(passwords),
            "email_inputs": len(emails),
            "hidden_inputs": len(hidden),
            "otp_inputs": otp_count,
            "external_form_action": external,
        }
