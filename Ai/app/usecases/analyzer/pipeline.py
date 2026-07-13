"""
Analyzer Pipeline

Điều phối toàn bộ quá trình phân tích URL.
Không chứa logic nghiệp vụ cụ thể.
"""

from __future__ import annotations

from app.config.logger import logger
from app.usecases.analyzer.ai_analysis_agent import AIAnalysisAgent
from app.usecases.analyzer.collector_agent import CollectorAgent
from app.usecases.analyzer.osint_agent import OSINTAgent
from app.usecases.feature_extraction.extractor import FeatureExtractor
from app.usecases.summary.summary_builder import AISummaryBuilder

# Kết quả OSINT tĩnh — tránh lặp lại dict literal
_OSINT_SAFE = {
    "analysis_type": "OSINT",
    "source": "ChongLuaDao",
    "risk_score": 0,
    "status": "safe",
    "level": "Low",
    "confidence": 1.0,
    "categories": [],
    "indicators": ["Website nằm trong danh sách an toàn"],
    "reason": ["Website nằm trong danh sách an toàn của ChongLuaDao."],
}

_OSINT_MALICIOUS = {
    "analysis_type": "OSINT",
    "source": "ChongLuaDao",
    "risk_score": 100,
    "status": "malicious",
    "level": "High",
    "confidence": 1.0,
    "categories": ["Phishing"],
    "indicators": ["Website nằm trong danh sách cảnh báo"],
    "reason": ["Website nằm trong danh sách cảnh báo của ChongLuaDao."],
}


def _make_fallback(category: str) -> dict:
    return {
        "analysis_type": "Fallback",
        "source": "Fallback",
        "risk_score": 50,
        "status": "malicious",
        "level": "Medium",
        "confidence": 0.30,
        "categories": [category],
        "indicators": ["LLM unavailable"],
        "reason": ["Không thể kết nối AI. Đã sử dụng kết quả dự phòng."],
    }


class AnalyzerService:
    """
    Điều phối toàn bộ pipeline phân tích URL.

    Thứ tự thực thi:
        1. OSINT (ChongLuaDao) — trả về ngay nếu có kết quả
        2. Collector — thu thập HTML, DNS, WHOIS, Network
        3. Feature Extraction — trích xuất đặc trưng
        4. AI Analysis — phân tích bằng Gemini
    """

    def __init__(self):
        self.osint_agent = OSINTAgent()
        self.collector_agent = CollectorAgent()
        self.feature_extractor = FeatureExtractor()
        self.ai_agent = AIAnalysisAgent()
        self.summary_builder = AISummaryBuilder()

    def analyze(self, url: str) -> dict:
        logger.info(f"[Pipeline] Analyze: {url}")

        # --------------------------------------------------
        # Bước 1: OSINT
        # --------------------------------------------------
        osint = self.osint_agent.check(url)
        osint_result = osint["result"]

        if osint_result == "safe":
            logger.info("[Pipeline] OSINT: Safe → early return")
            return {"collector": None, "feature": None, "analysis": _OSINT_SAFE}

        if osint_result == "malicious":
            logger.warning("[Pipeline] OSINT: Malicious → early return")
            return {"collector": None, "feature": None, "analysis": _OSINT_MALICIOUS}

        # --------------------------------------------------
        # Bước 2: Thu thập dữ liệu
        # --------------------------------------------------
        logger.info("[Pipeline] OSINT: No result → starting collector")
        data = self.collector_agent.collect(url)
        collector = data["collector"]
        whois = data["whois"]
        network = data["network"]

        logger.info(
            f"[Pipeline] Collected — domain={collector.domain} "
            f"age={whois.get('domain_age_days')} asn={network.get('asn')}"
        )

        # --------------------------------------------------
        # Bước 3: Trích xuất đặc trưng
        # --------------------------------------------------
        feature = self.feature_extractor.extract(collector)

        logger.info(
            f"[Pipeline] Features — brand={feature.detected_brand} "
            f"category={feature.predicted_category} "
            f"impersonation={feature.brand_impersonation}"
        )

        # --------------------------------------------------
        # Bước 4: Tóm tắt & Phân tích AI
        # --------------------------------------------------
        summary = self.summary_builder.build(
            collector=collector,
            feature=feature,
            whois=whois,
            network=network,
        )

        try:
            analysis = self.ai_agent.analyze(summary=summary)
            analysis["source"] = "AI Analysis"
        except Exception as ex:
            logger.exception(ex)
            logger.warning("[Pipeline] AI failed → fallback")
            analysis = _make_fallback(feature.predicted_category)

        logger.info(
            f"[Pipeline] Done — status={analysis['status']} "
            f"score={analysis['risk_score']} confidence={analysis['confidence']}"
        )

        return {
            "collector": collector,
            "feature": feature,
            "analysis": analysis,
        }
