from application.ports.llm_port import LLMPort


class ClaudeAdapter(LLMPort):

    async def generate(
        self,
        *,
        prompt: str,
        system_prompt: str | None = None,
        temperature: float = 0.3,
    ):
        raise NotImplementedError