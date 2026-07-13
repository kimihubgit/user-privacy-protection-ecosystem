from __future__ import annotations

from app.usecases.analyzer.ai_analysis_agent import AIAnalysisAgent
from app.usecases.analyzer.collector_agent import CollectorAgent
from app.usecases.analyzer.osint_agent import OSINTAgent
from app.usecases.summary.evidence_builder import EvidenceBuilder
from app.presentation.api.schemas.llm_result import LLMResult
from app.presentation.api.schemas.indicator import Indicator
from app.config.logger import logger
from app.infrastructure.cache.ttl_cache import TTLCache


class AnalyzerService:
    """Analyzer Service.

    Điều phối toàn bộ pipeline.

    Không chứa logic:
    - Collector
    - Evidence
    - OSINT
    - AI
    """

    # TTL 30 phút, tối đa 500 URL trong cache. Domain phổ biến bị
    # nhiều user quét trùng trong thời gian ngắn sẽ không phải chạy
    # lại OSINT + Collector + WHOIS + Network + Gemini mỗi lần.
    CACHE_TTL_SECONDS = 1800

    CACHE_MAX_SIZE = 500

    def __init__(self):
        self.osint_agent = OSINTAgent()
        self.collector_agent = CollectorAgent()
        self.evidence_builder = EvidenceBuilder()
        self.ai_agent = AIAnalysisAgent()
        self.cache = TTLCache(
            ttl_seconds=self.CACHE_TTL_SECONDS,
            max_size=self.CACHE_MAX_SIZE,
        )

    @staticmethod
    def _cache_key(url: str) -> str:
        return url.strip().lower()

    def analyze(self, url: str) -> dict:
        logger.info("=" * 80)
        logger.info(f"Analyze : {url}")

        cache_key = self._cache_key(url)

        cached = self.cache.get(cache_key)

        if cached is not None:

            logger.info("Cache Hit -> Bỏ qua toàn bộ pipeline")
            logger.info("=" * 80)

            return cached

        result = self._analyze_uncached(url)

        self.cache.set(cache_key, result)

        return result

    def _analyze_uncached(self, url: str) -> dict:
        logger.info("OSINT First Lookup")
        osint = self.osint_agent.check(url)
        logger.info(f"OSINT Result : {osint['result']}")

        # ==================================================
        # SAFE
        # ==================================================
        if osint["result"] == "safe":
            logger.info("Website nằm trong Allowlist.")
            logger.info("=" * 80)

            analysis = LLMResult(
                analysis_type="OSINT",
                risk_score=0,
                status="safe",
                level="Low",
                confidence=1.0,
                categories=[],
                indicators=[
                    Indicator(
                        indicator="Website nằm trong danh sách an toàn",
                        reason="Website đã được xác minh trong cơ sở dữ liệu ChongLuaDao.",
                        severity="Low",
                    )
                ],
                summary="Website nằm trong danh sách an toàn.",
                reason=[
                    "Website đã được xác minh trong danh sách an toàn của ChongLuaDao."
                ],
            )

            return {
                "collector": None,
                "evidences": None,
                "analysis": analysis,
            }

        # ==================================================
        # MALICIOUS
        # ==================================================
        if osint["result"] == "malicious":
            logger.warning("Website nằm trong Denylist.")
            logger.info("=" * 80)

            analysis = LLMResult(
                analysis_type="OSINT",
                risk_score=100,
                status="malicious",
                level="High",
                confidence=1.0,
                categories=["Phishing"],
                indicators=[
                    Indicator(
                        indicator="Website nằm trong danh sách cảnh báo",
                        reason="Website đã được xác định là độc hại trong cơ sở dữ liệu ChongLuaDao.",
                        severity="High",
                    )
                ],
                summary="Website đã được xác định là độc hại.",
                reason=[
                    "Website nằm trong danh sách cảnh báo của ChongLuaDao."
                ],
            )

            return {
                "collector": None,
                "evidences": None,
                "analysis": analysis,
            }

        # ==================================================
        # NO RESULT
        # ==================================================
        logger.info("Không tìm thấy trên ChongLuaDao.")
        logger.info("Collector Started...")

        data = self.collector_agent.collect(url)
        collector = data["collector"]
        whois = data["whois"]
        network = data["network"]

        logger.info("Collector Agent Finished")
        logger.info(f"Domain       : {collector.domain}")
        logger.info(f"Title        : {collector.title}")
        logger.info(f"Domain Age   : {whois.get('domain_age_days')}")
        logger.info(f"Registrar    : {whois.get('registrar')}")
        logger.info(f"ASN          : {network.get('asn')}")
        logger.info(f"Organization : {network.get('organization')}")

        # ==================================================
        # STEP 3: EVIDENCE BUILDING
        # ==================================================
        logger.info("Evidence Building...")

        evidences = self.evidence_builder.build(collector)

        logger.info("Evidence Builder Finished")
        logger.info(f"Group Count    : {evidences.group_count}")
        logger.info(f"Evidence Count : {evidences.evidence_count}")

        # ==================================================
        # STEP 4: AI ANALYSIS
        # ==================================================
        logger.info("=" * 80)
        logger.info("AI Analysis Started")
        logger.info(f"Website : {collector.domain}")
        logger.info(f"Domain Age : {whois.get('domain_age_days')}")
        logger.info("Sending data to AI Analysis Agent...")

        try:
            analysis = self.ai_agent.analyze(
                collector=collector,
                evidences=evidences,
            )

        # Gemini lỗi
        except Exception as ex:
            logger.exception(ex)
            logger.warning("AI Analysis Failed -> Fallback")

            analysis = LLMResult(
                analysis_type="Fallback",
                risk_score=50,
                status="unknown",
                level="Medium",
                confidence=0.0,
                categories=["Unknown"],
                indicators=[
                    Indicator(
                        indicator="Không thể phân tích bằng AI",
                        reason="Không thể kết nối dịch vụ AI nên hệ thống sử dụng kết quả dự phòng.",
                        severity="Low",
                    )
                ],
                summary="Không thể kết nối AI.",
                reason=[
                    "Không thể kết nối dịch vụ AI nên hệ thống chỉ cung cấp kết quả dự phòng."
                ],
            )

        # ==================================================
        # STEP 5: RESULT
        # ==================================================
        logger.info("=" * 80)
        logger.info("AI Analysis Finished")
        logger.info(f"Analysis Type : {analysis.analysis_type}")
        logger.info(f"Risk Score    : {analysis.risk_score}")
        logger.info(f"Status        : {analysis.status}")
        logger.info(f"Level         : {analysis.level}")
        logger.info(f"Confidence    : {analysis.confidence}")
        logger.info(f"Categories    : {analysis.categories}")
        logger.info(f"Indicators    : {analysis.indicators}")
        logger.info(f"Reason        : {analysis.reason}")
        logger.info("=" * 80)

        return {
            "collector": collector,
            "evidences": evidences,
            "analysis": analysis,
        }