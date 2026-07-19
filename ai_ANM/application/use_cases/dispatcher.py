"""
Dispatcher

Điều phối request đến Agent phù hợp dựa trên Intent.
"""

from application.agents.general_chat_agent import GeneralChatAgent
from application.agents.law_agent import LawAgent
from application.agents.scam_agent import ScamAgent

from application.models.agent_context import AgentContext

from domain.entities.agent_response import AgentResponse
from domain.entities.intent import Intent
from domain.value_objects.intent_type import IntentType


class Dispatcher:

    def __init__(
        self,
        law_agent: LawAgent,
        scam_agent: ScamAgent,
        general_agent: GeneralChatAgent,
    ):
        self._law_agent = law_agent
        self._scam_agent = scam_agent
        self._general_agent = general_agent

    async def dispatch(
        self,
        *,
        intent: Intent,
        context: AgentContext,
    ) -> AgentResponse:
        """
        Điều phối request đến Agent phù hợp.
        """

        match intent.intent_type:

            # ===============================
            # Luật
            # ===============================
            case IntentType.ASK_LAW:
                return await self._law_agent.run(
                    context=context,
                )

            # ===============================
            # Kiến thức lừa đảo
            # ===============================
            case IntentType.ASK_SCAM:
                return await self._scam_agent.run(
                    context=context,
                )

            # ===============================
            # Báo cáo lừa đảo
            # ===============================
            case IntentType.REPORT_SCAM:
                return await self._scam_agent.run(
                    context=context,
                )

            # ===============================
            # FastPath đã xử lý URL/Email/Phone
            # nên không cần CHECK_* ở đây.
            # Nếu lọt xuống thì cho General Agent.
            # ===============================
            case (
                IntentType.CHECK_URL
                | IntentType.CHECK_EMAIL
                | IntentType.CHECK_PHONE
            ):
                return await self._general_agent.run(
                    context=context,
                )

            # ===============================
            # Chat thường
            # ===============================
            case IntentType.GENERAL_CHAT:
                return await self._general_agent.run(
                    context=context,
                )

            # ===============================
            # Mặc định
            # ===============================
            case _:
                return await self._general_agent.run(
                    context=context,
                )