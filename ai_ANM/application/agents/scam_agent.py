from application.agents.base_agent import BaseAgent

from application.models.agent_context import AgentContext

from application.ports.llm_port import LLMPort
from application.ports.retriever_port import RetrieverPort

from config.settings import settings

from domain.entities.agent_response import AgentResponse

from prompts.scam_prompt import SCAM_PROMPT


class ScamAgent(BaseAgent):

    SYSTEM_PROMPT = SCAM_PROMPT

    TEMPERATURE = 0.2

    def __init__(
        self,
        llm: LLMPort,
        retriever: RetrieverPort,
    ):
        super().__init__(llm)

        self._retriever = retriever

    async def run(
        self,
        context: AgentContext,
    ) -> AgentResponse:

        context.retrieved_docs = await self._retriever.retrieve(
            query=context.message,
            top_k=settings.TOP_K,
            namespace=settings.PINECONE_NAMESPACE_SCAM,
        )

        return await super().run(
            context=context,
        )