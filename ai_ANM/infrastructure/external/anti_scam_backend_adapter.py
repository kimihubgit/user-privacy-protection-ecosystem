import httpx
from httpx import AsyncClient

from application.ports.anti_scam_lookup_port import (
    AntiScamLookupPort,
)

from config.settings import settings

from domain.entities.agent_response import AgentResponse


# Nhãn tiếng Việt cho các giá trị "status"/"level" mà ChongLuaDao trả về.
# Nếu backend trả về giá trị lạ (chưa map), fallback dùng nguyên giá trị gốc.
STATUS_LABELS = {
    "safe": "An toàn ✅",
    "suspicious": "Nghi ngờ ⚠️",
    "warning": "Cảnh báo ⚠️",
    "malicious": "Nguy hiểm ⚠️",
    "danger": "Nguy hiểm ⚠️",
    "unknown": "Chưa xác định",
}

LEVEL_LABELS = {
    "Low": "Thấp",
    "Medium": "Trung bình",
    "High": "Cao",
    "Critical": "Rất cao",
}


class AntiScamBackendAdapter(
    AntiScamLookupPort,
):

    def __init__(self):

        self.client = AsyncClient(
            timeout=settings.REQUEST_TIMEOUT,
        )

        self.base_url = settings.ANTI_SCAM_API

    @staticmethod
    def _format_analyze_reply(
        target: str,
        data: dict,
    ) -> str:
        """
        Dựng câu trả lời tiếng Việt từ response của ChongLuaDao
        /api/v1/analyze, ví dụ:

        {
          "status": "safe",
          "level": "Low",
          "risk_score": 0,
          "reason": ["..."],
          ...
        }
        """

        status = data.get("status", "unknown")

        status_label = STATUS_LABELS.get(
            status,
            status,
        )

        level = data.get("level")

        level_label = LEVEL_LABELS.get(
            level,
            level,
        )

        risk_score = data.get("risk_score")

        reasons = data.get("reason") or []

        lines = [
            f"🔎 Kết quả kiểm tra: {target}",
            f"- Trạng thái: {status_label}",
        ]

        if level_label:

            score_part = (
                f" ({risk_score}/100)"
                if risk_score is not None
                else ""
            )

            lines.append(
                f"- Mức độ rủi ro: {level_label}{score_part}",
            )

        if reasons:

            lines.append("- Lý do:")

            lines.extend(
                f"  • {reason}" for reason in reasons
            )

        return "\n".join(lines)

    async def _analyze(
        self,
        target: str,
        payload: dict,
    ) -> AgentResponse:
        """
        Gọi ChongLuaDao Anti-Scam Backend (/api/v1/analyze), có xử lý lỗi
        để không làm sập toàn bộ request khi service kiểm tra bị lỗi/timeout.
        """

        try:

            response = await self.client.post(
                f"{self.base_url}/api/v1/analyze",
                json=payload,
            )

            response.raise_for_status()

            data = response.json()

            return AgentResponse(
                success=True,
                reply=self._format_analyze_reply(
                    target,
                    data,
                ),
                metadata=data,
            )

        except httpx.TimeoutException:

            return AgentResponse(
                success=False,
                reply=(
                    "Hệ thống kiểm tra lừa đảo đang phản hồi chậm, "
                    "vui lòng thử lại sau ít phút."
                ),
            )

        except httpx.HTTPStatusError as ex:

            return AgentResponse(
                success=False,
                reply=(
                    "Không thể kiểm tra thông tin này lúc này "
                    f"(mã lỗi {ex.response.status_code}). "
                    "Vui lòng thử lại sau."
                ),
            )

        except (httpx.RequestError, ValueError, KeyError):

            return AgentResponse(
                success=False,
                reply=(
                    "Hệ thống kiểm tra lừa đảo hiện không khả dụng. "
                    "Vui lòng thử lại sau."
                ),
            )

    async def check_url(
        self,
        url: str,
    ) -> AgentResponse:

        return await self._analyze(
            url,
            {"url": url},
        )

    async def check_phone(
        self,
        phone: str,
    ) -> AgentResponse:

        # Backend ChongLuaDao hiện chỉ hỗ trợ phân tích URL.
        # Giữ nguyên cấu trúc gọi để dễ bật lại khi có endpoint riêng cho SĐT.
        return await self._analyze(
            phone,
            {"phone": phone},
        )

    async def check_email(
        self,
        email: str,
    ) -> AgentResponse:

        # Backend ChongLuaDao hiện chỉ hỗ trợ phân tích URL.
        # Giữ nguyên cấu trúc gọi để dễ bật lại khi có endpoint riêng cho email.
        return await self._analyze(
            email,
            {"email": email},
        )
