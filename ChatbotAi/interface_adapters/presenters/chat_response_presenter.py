from domain.entities.agent_response import AgentResponse


class ChatResponsePresenter:

    @staticmethod
    def present(
        response: AgentResponse,
    ) -> dict:

        return {
            "reply": response.reply,
        }