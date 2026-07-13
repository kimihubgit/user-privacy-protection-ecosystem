"""
HTML Detector

Phân tích cấu trúc HTML để phát hiện các dấu hiệu đáng ngờ.
Không đưa ra kết luận. Không chấm điểm.
"""

from __future__ import annotations

from bs4 import BeautifulSoup


class HTMLDetector:
    def detect(self, html: str) -> dict:
        if not html:
            return {"iframe_count": 0, "script_count": 0, "hidden_elements": 0}

        soup = BeautifulSoup(html, "lxml")

        iframe_count = len(soup.find_all("iframe"))
        script_count = len(soup.find_all("script"))

        # hidden attribute + style="display:none" / "visibility:hidden"
        hidden_count = len(soup.find_all(attrs={"hidden": True}))
        hidden_count += sum(
            1
            for tag in soup.find_all(True)
            if "display:none" in tag.get("style", "").lower().replace(" ", "")
            or "visibility:hidden" in tag.get("style", "").lower().replace(" ", "")
        )

        return {
            "iframe_count": iframe_count,
            "script_count": script_count,
            "hidden_elements": hidden_count,
        }
