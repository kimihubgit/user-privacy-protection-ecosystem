import json

from application.models.agent_context import AgentContext
from application.models.tool_call import ToolCall
from application.prompts.planner_prompt import PLANNER_PROMPT

from application.ports.llm_port import LLMPort
from infrastructure.parsers.json_utils import extract_json
from infrastructure.parsers.tool_call_parser import ToolCallParser


class Plan:
    """
    Kế hoạch thực thi do Planner sinh ra.
    """

    def __init__(
        self,
        intent: str,
        supported: bool,
        tools: list[ToolCall],
    ):
        self.intent = intent
        self.supported = supported
        self.tools = tools


class PlannerAgent:

    def __init__(
        self,
        llm: LLMPort,
        parser: ToolCallParser,
    ):
        self._llm = llm
        self._parser = parser

    async def plan(
        self,
        context: AgentContext,
    ) -> Plan:
        
        # 1. Gọi LLM để sinh ra text (JSON chứa tools)
        tool_calls_text = await self._llm.generate_text(
            prompt=context.message,
            system_prompt=PLANNER_PROMPT,
        )

        # ==================================================
        # Lấy intent và supported từ JSON
        # ==================================================
        intent = "unknown"
        supported = True
        try:
            data = json.loads(extract_json(tool_calls_text))
            intent = data.get("intent", "unknown")
            supported = data.get("supported", True)
        except Exception:
            pass

        # 2. Đưa chuỗi text trả về qua Parser để bóc tách thành danh sách ToolCall
        tools = self._parser.parse(
            tool_calls_text,
        )

        # 3. Đóng gói vào model Plan và trả về
        return Plan(
            intent=intent,
            supported=supported,
            tools=tools,
        )