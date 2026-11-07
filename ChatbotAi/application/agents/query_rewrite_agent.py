from application.builders.context_builder import ContextBuilder

from application.models.agent_context import AgentContext
from application.models.evidence import Evidence

from application.prompts.rewrite_prompt import (
    REWRITE_PROMPT,
    REWRITE_WITH_FEEDBACK_PROMPT,
    WEB_SEARCH_QUERY_PROMPT,
)

from application.ports.llm_port import LLMPort


class QueryRewriteAgent:

    def __init__(
        self,
        llm: LLMPort,
    ):
        self._llm = llm

    async def rewrite(
        self,
        *,
        context: AgentContext,
        evidence: Evidence | None = None,
        reason: str = "",
        previous_queries: list[str] | None = None,
    ) -> str:
        """
        Viết lại câu hỏi gốc thành 1 truy vấn tối ưu cho Retrieval.

        Có 2 chế độ:

        1. Chạy NGAY SAU Planner, TRƯỚC KHI gọi tool tra cứu nào
           (evidence=None) -> rewrite tổng quát dựa trên câu hỏi gốc.

        2. Chạy khi EvaluationAgent đánh giá Evidence tìm được CHƯA
           ĐỦ (evidence + reason được truyền vào) -> quay lại bước
           này để rewrite lần nữa, có tính đến Evidence hiện có và
           lý do chưa đủ, trước khi tìm kiếm lại (web_search).

           `previous_queries`: các truy vấn đã dùng ở (các) lần retry
           trước, để prompt yêu cầu model không lặp lại/không đánh
           mất chủ thể câu hỏi gốc qua mỗi lần retry.
        """

        if evidence is not None:

            queries_text = (
                "\n".join(f"- {q}" for q in previous_queries)
                if previous_queries
                else "(chưa có, đây là lần retry đầu tiên)"
            )

            prompt = REWRITE_WITH_FEEDBACK_PROMPT.format(
                question=context.message,
                evidence=ContextBuilder.build_context(evidence),
                reason=reason or "Chưa đủ thông tin liên quan.",
                previous_queries=queries_text,
            )

        else:

            prompt = REWRITE_PROMPT.format(
                question=context.message,
            )

        query = await self._llm.generate_text(
            prompt=prompt,
        )

        return query.strip()

    async def rewrite_for_web_search(
        self,
        *,
        context: AgentContext,
        evidence: Evidence | None = None,
        reason: str = "",
    ) -> str:
        """
        Viết lại câu hỏi thành 1 truy vấn TỔNG QUÁT, NGẮN GỌN riêng
        cho Web Search (Tavily) — khác với `rewrite()` vốn tạo truy
        vấn chi tiết (giữ số Điều, số Nghị định...) tối ưu cho
        Retrieval nội bộ trên kho văn bản luật.

        Web search engine tổng quát tìm hiệu quả và NHANH hơn với
        câu ngắn đi thẳng chủ đề, thay vì câu hỏi dài liệt kê nhiều
        văn bản/điều khoản cụ thể (vốn hiếm khi khớp đúng với cách
        các trang web viết) — câu dài cũng khiến Tavily xử lý lâu
        hơn, tăng latency.
        """

        extra_context = ""

        if evidence is not None:

            extra_context = (
                "Đã tra cứu nội bộ nhưng CHƯA ĐỦ thông tin, lý do: "
                f"{reason or 'Chưa đủ thông tin liên quan.'}"
            )

        prompt = WEB_SEARCH_QUERY_PROMPT.format(
            question=context.message,
            extra_context=extra_context,
        )

        query = await self._llm.generate_text(
            prompt=prompt,
        )

        return query.strip()
