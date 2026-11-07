"""
Response Builder

Chuẩn hóa AgentResponse.
"""

from domain.entities.agent_response import AgentResponse


class ResponseBuilder:

    @staticmethod
    def success(
        *,
        reply: str,
    ) -> AgentResponse:

        return AgentResponse(
            success=True,
            reply=reply,
        )

    @staticmethod
    def error(
        *,
        message: str,
    ) -> AgentResponse:

        return AgentResponse(
            success=False,
            reply=message,
        )