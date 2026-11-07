import httpx
from httpx import AsyncClient

from application.ports.image_scam_checker_port import (
    ImageScamCheckerPort,
)

from config.settings import settings

from domain.entities.agent_response import AgentResponse


# Nhãn tiếng Việt cho status/level, dùng chung quy ước với
# AntiScamBackendAdapter (ChongLuaDao) trong trường hợp VTrust
# trả về schema tương tự (status/level/risk_score/reason).
STATUS_LABELS = {
    "safe": "An toàn ✅",
    "suspicious": "Nghi ngờ ⚠️",
    "warning": "Cảnh báo ⚠️",
    "malicious": "Nguy hiểm ⚠️",
    "danger": "Nguy hiểm ⚠️",
    "scam": "Có dấu hiệu lừa đảo ⚠️",
    "unknown": "Chưa xác định",
}

LEVEL_LABELS = {
    "Low": "Thấp",
    "Medium": "Trung bình",
    "High": "Cao",
    "Critical": "Rất cao",
}

# riskLevel của VTrust (/api/ai-chat-image) — thường viết thường.
RISK_LEVEL_LABELS = {
    "safe": "An toàn ✅",
    "low": "Thấp",
    "medium": "Trung bình ⚠️",
    "high": "Cao ⚠️",
    "critical": "Nghiêm trọng 🚨",
}


class VtrustImageAdapter(
    ImageScamCheckerPort,
):

    def __init__(self):

        self.client = AsyncClient(
            timeout=settings.VTRUST_IMAGE_TIMEOUT,
        )

        self.api_url = settings.VTRUST_IMAGE_API

    @staticmethod
    def _format_reply(
        data: dict,
    ) -> str:
        """
        Dựng câu trả lời tiếng Việt từ response của VTrust
        (/api/ai-chat-image).

        Schema thật (xác nhận từ VTrust):
        {
          "analysis": "...",
          "riskLevel": "critical" | "high" | "medium" | "low" | "safe",
          "scamSignals": [...],
          "recommendations": [...]
        }
        """

        # Trường hợp 1: schema thật của VTrust (analysis/riskLevel/...)
        if (
            "riskLevel" in data
            or "scamSignals" in data
            or "recommendations" in data
        ):
            return VtrustImageAdapter._format_vtrust_analysis(data)

        # Trường hợp 2: API trả lời trực tiếp bằng văn bản hội thoại
        for key in ("reply", "message", "answer", "result", "analysis"):

            value = data.get(key)

            if isinstance(value, str) and value.strip():
                return value.strip()

        # Trường hợp 3: dạng phân tích giống schema của ChongLuaDao
        # (status/level/risk_score/reason)
        if "status" in data or "level" in data:

            status = data.get("status", "unknown")

            status_label = STATUS_LABELS.get(status, status)

            level = data.get("level")

            level_label = LEVEL_LABELS.get(level, level)

            risk_score = data.get("risk_score")

            reasons = (
                data.get("reason")
                or data.get("reasons")
                or []
            )

            if isinstance(reasons, str):
                reasons = [reasons]

            lines = [
                "### 🔎 Kết quả phân tích ảnh",
            ]

            lines.append(f"\n**Trạng thái:** {status_label}")

            if level_label:

                score_part = (
                    f" ({risk_score}/100)"
                    if risk_score is not None
                    else ""
                )

                lines.append(
                    f"\n**Mức độ rủi ro:** {level_label}{score_part}",
                )

            if reasons:

                lines.append("\n### 🔍 Lý do\n")

                lines.append(
                    "\n".join(f"- {reason}" for reason in reasons),
                )

            return "\n".join(lines)

        # Trường hợp 4: không nhận diện được field nào, trả nguyên JSON
        # để không mất thông tin (tạm thời, chờ xác nhận schema thật).
        return (
            "Đã phân tích xong ảnh, nhưng chưa đọc được định dạng "
            f"phản hồi từ VTrust: {data}"
        )

    @staticmethod
    def _stringify_list_item(item) -> str:
        """
        scamSignals/recommendations có thể là mảng string, hoặc mảng
        object (ví dụ {"signal": "...", "description": "..."}).
        Chuẩn hoá về 1 dòng text dễ đọc.
        """

        if isinstance(item, str):
            return item

        if isinstance(item, dict):

            for key in (
                "text",
                "description",
                "signal",
                "message",
                "recommendation",
                "title",
            ):

                value = item.get(key)

                if isinstance(value, str) and value.strip():
                    return value.strip()

            return str(item)

        return str(item)

    # Emoji riêng theo mức độ rủi ro, dùng cho heading "Mức độ rủi ro"
    # (khác RISK_LEVEL_LABELS vì label chỉ dùng emoji cảnh báo chung).
    _RISK_LEVEL_EMOJI = {
        "critical": "🚨",
        "high": "⚠️",
        "medium": "⚠️",
        "low": "🔍",
        "safe": "✅",
    }

    # Nhãn PHẲNG (không kèm emoji) cho mức độ rủi ro, dùng trong phần
    # in đậm dưới heading — heading đã có emoji riêng (_RISK_LEVEL_EMOJI)
    # nên không lặp lại emoji ở đây.
    _RISK_LEVEL_LABELS_PLAIN = {
        "critical": "Nghiêm trọng",
        "high": "Cao",
        "medium": "Trung bình",
        "low": "Thấp",
        "safe": "An toàn",
    }

    @staticmethod
    def _format_vtrust_analysis(data: dict) -> str:
        """
        Dựng câu trả lời từ schema thật của VTrust:
        {
          "analysis": "...",
          "riskLevel": "critical" | "high" | "medium" | "low" | "safe",
          "scamSignals": [...],
          "recommendations": [...]
        }

        Dùng markdown heading ("### <emoji> Tên mục") thay vì gạch đầu
        dòng thô, đồng bộ phong cách trình bày với các câu trả lời
        khác của chatbot (SCAM_RESPONSE_PROMPT).
        """

        analysis = data.get("analysis")

        risk_level = (data.get("riskLevel") or "").lower()

        risk_label = VtrustImageAdapter._RISK_LEVEL_LABELS_PLAIN.get(
            risk_level,
            data.get("riskLevel") or "Chưa xác định",
        )

        risk_emoji = VtrustImageAdapter._RISK_LEVEL_EMOJI.get(
            risk_level, "🔎",
        )

        scam_signals = data.get("scamSignals") or []

        recommendations = data.get("recommendations") or []

        if isinstance(scam_signals, str):
            scam_signals = [scam_signals]

        if isinstance(recommendations, str):
            recommendations = [recommendations]

        sections = [
            f"### {risk_emoji} Mức độ rủi ro\n\n**{risk_label}**",
        ]

        if analysis:
            sections.append(
                f"### 🔍 Phân tích\n\n{analysis.strip()}",
            )

        if scam_signals:

            signals_text = "\n".join(
                f"- {VtrustImageAdapter._stringify_list_item(item)}"
                for item in scam_signals
            )

            sections.append(
                f"### ⚠️ Dấu hiệu lừa đảo phát hiện được\n\n{signals_text}",
            )

        if recommendations:

            recs_text = "\n".join(
                f"- {VtrustImageAdapter._stringify_list_item(item)}"
                for item in recommendations
            )

            sections.append(
                f"### 💡 Khuyến nghị\n\n{recs_text}",
            )

        return "\n\n".join(sections)

    async def analyze_image(
        self,
        image_base64: str,
        message: str = "",
    ) -> AgentResponse:
        """
        Gửi ảnh (base64) sang VTrust để phân tích dấu hiệu lừa đảo.
        Có xử lý lỗi để không làm sập request khi VTrust lỗi/timeout.
        """

        payload = {
            "imageBase64": image_base64,
            "message": message,
            "language": "vi",
        }

        try:

            response = await self.client.post(
                self.api_url,
                json=payload,
            )

            response.raise_for_status()

            data = response.json()

            return AgentResponse(
                success=True,
                reply=self._format_reply(data),
                metadata=data,
            )

        except httpx.TimeoutException:

            return AgentResponse(
                success=False,
                reply=(
                    "Hệ thống phân tích ảnh đang phản hồi chậm, "
                    "vui lòng thử lại sau ít phút."
                ),
            )

        except httpx.HTTPStatusError as ex:

            return AgentResponse(
                success=False,
                reply=(
                    "Không thể phân tích ảnh này lúc này "
                    f"(mã lỗi {ex.response.status_code}). "
                    "Vui lòng thử lại sau."
                ),
            )

        except (httpx.RequestError, ValueError, KeyError):

            return AgentResponse(
                success=False,
                reply=(
                    "Hệ thống phân tích ảnh hiện không khả dụng. "
                    "Vui lòng thử lại sau."
                ),
            )