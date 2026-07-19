from application.ports.anti_scam_lookup_port import (
    AntiScamLookupPort,
)
from domain.entities.agent_response import AgentResponse
from domain.services.regex_detector import RegexDetector

class FastPath:

    def __init__(
        self,
        detector: RegexDetector,
        lookup: AntiScamLookupPort,
    ):

        self.detector = detector

        self.lookup = lookup

    async def execute(
        self,
        message: str,
    ) -> AgentResponse | None:

        entities = self.detector.detect(message)

        if not entities:
            return None

        # ==========================================
        # Anti-Scam Backend hiện tại chỉ hỗ trợ
        # kiểm tra URL (/api/v1/check/url).
        # Phone/Email chưa có endpoint tương ứng nên
        # để rơi xuống Intent Classification -> Agent
        # trả lời tư vấn chung, thay vì báo lỗi.
        # ==========================================

        url_entity = next(
            (e for e in entities if e.type == "url"),
            None,
        )

        if url_entity is not None:

            url = url_entity.value

            if not url.startswith(("http://", "https://")):
                url = f"https://{url}"

            return await self.lookup.check_url(url)

        return None