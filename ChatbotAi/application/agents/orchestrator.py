import asyncio
import time
from typing import AsyncIterator

from application.models.agent_context import AgentContext
from domain.entities.agent_response import AgentResponse

from application.agents.planner_agent import PlannerAgent
from application.agents.memory_agent import MemoryAgent
from application.agents.retrieval_agent import RetrievalAgent
from application.agents.evaluation_agent import EvaluationAgent
from application.agents.query_rewrite_agent import QueryRewriteAgent
from application.agents.risk_analysis_agent import RiskAnalysisAgent
from application.agents.response_agent import ResponseAgent
from application.agents.answer_validation_agent import AnswerValidationAgent
from application.agents.outside_scope_agent import OutsideScopeAgent
from application.tools.tool_registry import ToolRegistry
from observability import token_tracker
from observability.logger import (
    log_request_start,
    log_step,
    log_request_complete,
)


class AgentOrchestrator:

    def __init__(
        self,
        planner: PlannerAgent,
        memory: MemoryAgent,
        retrieval: RetrievalAgent,
        evaluation: EvaluationAgent,
        rewrite: QueryRewriteAgent,
        risk: RiskAnalysisAgent,
        response: ResponseAgent,
        validator: AnswerValidationAgent,
        outside_scope: OutsideScopeAgent,
        tool_registry: ToolRegistry,
    ):
        self._planner = planner
        self._memory = memory
        self._retrieval = retrieval
        self._evaluation = evaluation
        self._rewrite = rewrite
        self._risk = risk
        self._response = response
        self._validator = validator
        self._outside_scope = outside_scope
        self._tool_registry = tool_registry

    async def execute(
        self,
        context: AgentContext,
    ) -> AgentResponse:

        start_time = time.perf_counter()

        # =========================
        # Reset Token Tracker (mỗi request 1 phiên đếm riêng)
        # =========================
        token_tracker.reset()

        # =========================
        # Lưu câu hỏi gốc & Ghi log bắt đầu
        # =========================
        original_question = context.message
        log_request_start(original_question)

        # =========================
        # Planner
        # =========================
        plan = await self._planner.plan(
            context=context,
        )

        tools_desc = [t.tool for t in plan.tools] if plan.tools else ["none"]
        log_step(1, 5, "Planner", f"Intent: '{plan.intent}' | Công cụ: {tools_desc}")

        # =========================
        # Outside Scope Check
        # =========================
        if plan.intent == "out_of_scope":

            outside = await self._outside_scope.execute(
                question=original_question,
            )

            log_step(2, 5, "OutsideScope", "Nội dung ngoài phạm vi ANM -> Phản hồi từ chối khéo léo")
            token_tracker.print_table()
            log_request_complete(time.perf_counter() - start_time, token_tracker.get_summary())

            return AgentResponse(
                success=True,
                reply=outside.message,
            )

        # =========================
        # Memory
        # =========================
        memory = await self._memory.load(
            context=context,
        )

        # =========================
        # Query Rewrite (chạy TRƯỚC Retrieval)
        #
        # Chỉ cần rewrite khi Plan có tool tra cứu dạng "query"
        # (cyber_law / scam_knowledge). url_checker dùng "url",
        # image_analysis không cần query -> bỏ qua để đỡ tốn 1 lần
        # gọi LLM không cần thiết.
        # =========================
        rewritten_query: str | None = None

        needs_rewrite = any(
            tool_call.tool in ("cyber_law", "scam_knowledge")
            for tool_call in plan.tools
        )

        if needs_rewrite:

            rewritten_query = await self._rewrite.rewrite(
                context=context,
            )

            for tool_call in plan.tools:

                if (
                    tool_call.tool in ("cyber_law", "scam_knowledge")
                    and "query" in tool_call.arguments
                ):
                    tool_call.arguments["query"] = rewritten_query

        # =========================
        # Execute Internal Tools
        #
        # Chạy song song (asyncio.gather) thay vì tuần tự vì các tool
        # (cyber_law, scam_knowledge, url_checker...) độc lập với
        # nhau -> giảm độ trễ tổng khi Planner chọn nhiều tool cùng lúc.
        # =========================
        runnable_calls = [
            tool_call
            for tool_call in plan.tools
            if self._tool_registry.exists(tool_call.tool)
        ]

        async def _run(tool_call):
            tool = self._tool_registry.get(
                tool_call.tool,
            )

            return await tool.execute(
                **tool_call.arguments,
            )

        if runnable_calls:
            tools_list = ", ".join(t.tool for t in runnable_calls)
            log_step(2, 5, "Retrieval", f"Thực thi {len(runnable_calls)} công cụ tra cứu tri thức [{tools_list}]")
        else:
            log_step(2, 5, "Retrieval", "Không cần tra cứu thêm tài liệu")

        results = await asyncio.gather(
            *(_run(tool_call) for tool_call in runnable_calls),
        )

        evidences = [
            result
            for result in results
            if result is not None
        ]

        # =========================
        # Merge Evidence
        # =========================
        evidence = await self._retrieval.merge(
            evidences,
        )

        # =========================
        # URL Check không cần RAG
        # =========================
        if plan.intent == "url_check":

            log_step(3, 5, "RiskAnalysis", "Đánh giá mức độ an toàn và rủi ro độc hại của URL")

            risk = await self._risk.analyze(
                question=original_question,
                evidence=evidence,
            )

            log_step(4, 5, "Response", "Tổng hợp bằng chứng và tạo phản hồi chi tiết")

            llm_result = await self._response.generate(
                context=context,
                evidence=evidence,
                risk=risk,
                intent=plan.intent,
            )

            result = await self._validator.validate(
                question=original_question,
                llm_result=llm_result,
                evidence=evidence,
            )

            log_step(5, 5, "Validation", "Kiểm định phản hồi hoàn tất")
            token_tracker.print_table()
            log_request_complete(time.perf_counter() - start_time, token_tracker.get_summary())

            return result

        # =========================
        # Evaluation lần 1
        # =========================
        evaluation = await self._evaluation.evaluate(
            question=original_question,
            evidence=evidence,
        )

        # =========================
        # Corrective RAG
        #
        # Chỉ gọi web_search sau khi đã thử rewrite + truy vấn lại
        # nội bộ (cyber_law/scam_knowledge) đủ 2 lần mà vẫn chưa đủ
        # thông tin. web_search là phương án cuối cùng.
        # =========================
        MAX_INTERNAL_RETRY = 2

        internal_retry_count = 0

        retry_query_history: list[str] = []

        while (
            evaluation.need_retry
            and internal_retry_count < MAX_INTERNAL_RETRY
        ):

            internal_retry_count += 1

            retry_query = await self._rewrite.rewrite(
                context=context,
                evidence=evidence,
                reason=evaluation.reason,
                previous_queries=retry_query_history,
            )

            retry_query_history.append(retry_query)

            retry_evidences = []

            for tool_call in plan.tools:

                if tool_call.tool not in ("cyber_law", "scam_knowledge"):
                    continue

                if not self._tool_registry.exists(tool_call.tool):
                    continue

                tool = self._tool_registry.get(
                    tool_call.tool,
                )

                result = await tool.execute(
                    query=retry_query,
                )

                if result is not None:
                    retry_evidences.append(result)

            if retry_evidences:

                evidence = await self._retrieval.merge(
                    [evidence, *retry_evidences],
                )

                evaluation = await self._evaluation.evaluate(
                    question=original_question,
                    evidence=evidence,
                )

            else:
                # Không có tool nào để retry nội bộ (vd: intent
                # image_analysis) -> dừng vòng lặp sớm, đi thẳng
                # xuống web_search bên dưới.
                break

        if evaluation.need_retry:

            web_query = await self._rewrite.rewrite_for_web_search(
                context=context,
                evidence=evidence,
                reason=evaluation.reason,
            )

            if self._tool_registry.exists(
                "web_search",
            ):

                web_tool = self._tool_registry.get(
                    "web_search",
                )

                web_evidence = await web_tool.execute(
                    query=web_query,
                )

                if web_evidence is not None:

                    evidence = await self._retrieval.merge(
                        [
                            evidence,
                            web_evidence,
                        ]
                    )

                    evaluation = await self._evaluation.evaluate(
                        question=original_question,
                        evidence=evidence,
                    )

        eval_status = "Đạt độ tin cậy" if not evaluation.need_retry else "Đã bổ sung qua Corrective RAG"
        conf_str = f"Độ tin cậy: {evaluation.confidence:.2f}" if hasattr(evaluation, "confidence") and evaluation.confidence else "Độ tin cậy: Tốt"
        log_step(3, 5, "Evaluation", f"{eval_status} ({conf_str})")

        # =========================
        # Risk Analysis
        # =========================
        risk = await self._risk.analyze(
            question=original_question,
            evidence=evidence,
        )

        # =========================
        # Response
        # =========================
        log_step(4, 5, "Response", f"Gemini đang tổng hợp lập luận và tạo nội dung tư vấn")

        llm_result = await self._response.generate(
            context=context,
            evidence=evidence,
            risk=risk,
            intent=plan.intent,
        )

        # =========================
        # Validation
        # =========================
        result = await self._validator.validate(
            question=original_question,
            llm_result=llm_result,
            evidence=evidence,
        )

        grounded = result.metadata.get("grounded", True) if result.metadata else True
        grounded_str = "Hợp lệ (Supported by Evidence)" if grounded else "Cảnh báo thông tin ngoài tài liệu"
        log_step(5, 5, "Validation", f"Groundedness: {grounded_str}")

        # In token & kết thúc request
        token_tracker.print_table()
        log_request_complete(time.perf_counter() - start_time, token_tracker.get_summary())

        return result

    async def execute_stream(
        self,
        context: AgentContext,
    ) -> AsyncIterator[str]:

        response = await self.execute(context)

        yield response.reply