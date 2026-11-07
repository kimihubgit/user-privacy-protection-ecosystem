from application.builders.context_builder import ContextBuilder

from application.models.evidence import Evidence
from application.models.llm_result import LLMResult

from application.ports.llm_port import LLMPort

from application.prompts.validation_prompt import (
    VALIDATION_PROMPT,
)

from domain.entities.agent_response import AgentResponse

from infrastructure.parsers.validation_parser import (
    ValidationParser,
)

from observability.logger import logger


class AnswerValidationAgent:
    """
    Validate câu trả lời (Response Agent sinh ra) trước khi trả về
    cho người dùng — kiểm tra groundedness (câu trả lời có được
    Evidence hỗ trợ hay không, có bịa thêm thông tin không).

    Hiện tại CHỈ ĐO và ghi log/metadata, KHÔNG tự động chặn hay yêu
    cầu Response Agent sinh lại câu trả lời khi phát hiện chưa
    grounded — reply vẫn được trả về nguyên vẹn cho người dùng để
    tránh thay đổi hành vi hệ thống ngoài dự kiến. Kết quả kiểm tra
    nằm trong `AgentResponse.metadata` để observability/eval harness
    đọc lại (xem scripts/eval/run_eval.py).
    """

    def __init__(
        self,
        llm: LLMPort,
        parser: ValidationParser,
    ):
        self._llm = llm
        self._parser = parser

    async def validate(
        self,
        question: str,
        llm_result: LLMResult,
        evidence: Evidence | None = None,
    ) -> AgentResponse:

        metadata: dict = {}

        if evidence is not None and not evidence.empty:

            try:

                evidence_text = ContextBuilder.build_context(
                    evidence,
                )

                prompt = VALIDATION_PROMPT.format(
                    question=question,
                    evidence=evidence_text,
                    answer=llm_result.reply,
                )

                raw = await self._llm.generate_text(
                    prompt=prompt,
                )

                result = self._parser.parse(raw)

                metadata["grounded"] = result.grounded
                metadata["groundedness_confidence"] = result.confidence
                metadata["unsupported_claims"] = result.unsupported_claims

                if not result.grounded:

                    logger.warning(
                        "[answer-validation] Câu trả lời có thể chứa "
                        f"thông tin không được Evidence hỗ trợ: "
                        f"{result.unsupported_claims}",
                    )

            except Exception as ex:

                logger.warning(
                    f"[answer-validation] Lỗi khi kiểm tra groundedness, "
                    f"bỏ qua (không chặn câu trả lời): {ex}",
                )

        return AgentResponse(
            success=llm_result.success,
            reply=llm_result.reply,
            metadata=metadata,
        )
