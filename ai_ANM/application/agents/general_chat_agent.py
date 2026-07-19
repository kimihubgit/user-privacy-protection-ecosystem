from application.agents.base_agent import BaseAgent

from application.ports.llm_port import LLMPort

from prompts.system_prompt import SYSTEM_PROMPT


class GeneralChatAgent(BaseAgent):

    SYSTEM_PROMPT = SYSTEM_PROMPT

    TEMPERATURE = 0.5

    def __init__(
        self,
        llm: LLMPort,
    ):
        super().__init__(llm)
