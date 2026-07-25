"""
Handle Chat Message Use Case

Entrypoint của chatbot.

Pipeline:

User
    │
    ▼
Orchestrator
    │
    ├── Planner
    ├── Tool Executor
    ├── Retrieval & Eval
    └── Response
"""

from typing import AsyncIterator

from application.models.conversation_context import (
    ConversationContext,
)
from application.services.context_manager import (
    ContextManager,
)
from application.models.agent_context import (
    AgentContext,
)
from application.agents.orchestrator import AgentOrchestrator
from domain.entities.agent_response import AgentResponse


class HandleChatMessageUseCase:
    def __init__(
        self,
        orchestrator: AgentOrchestrator,
        context_manager: ContextManager,
    ):
        self._orchestrator = orchestrator
        self._context_manager = context_manager

    async def execute(
        self,
        message: str,
    ) -> AgentResponse:

        message = message.strip()

        if not message:
            return AgentResponse(
                success=False,
                reply="Tin nhắn không được để trống.",
            )

        # ==========================================
        # Conversation Context
        # ==========================================

        conversation = ConversationContext(
            session_id="default",
        )

        # Lưu message của user
        self._context_manager.add_user_message(
            conversation=conversation,
            message=message,
        )

        # ==========================================
        # Agent Context
        # ==========================================

        context = self._context_manager.build(
            conversation=conversation,
            message=message,
        )

        # ==========================================
        # Orchestrator
        # ==========================================

        response = await self._orchestrator.execute(
            context=context,
        )

        # ==========================================
        # Save assistant message
        # ==========================================

        self._context_manager.add_assistant_message(
            conversation=conversation,
            message=response.reply,
        )

        return response

    async def execute_stream(
        self,
        message: str,
    ) -> AsyncIterator[str]:
        """
        Giống execute(), nhưng trả lời theo dạng streaming (SSE).
        """

        message = message.strip()

        if not message:
            yield "Tin nhắn không được để trống."
            return

        # ==========================================
        # Conversation Context
        # ==========================================

        conversation = ConversationContext(
            session_id="default",
        )

        self._context_manager.add_user_message(
            conversation=conversation,
            message=message,
        )

        context = self._context_manager.build(
            conversation=conversation,
            message=message,
        )

        # ==========================================
        # Orchestrator (stream) + tích lũy để lưu context
        # ==========================================

        full_reply_parts: list[str] = []

        async for chunk in self._orchestrator.execute_stream(
            context=context,
        ):
            full_reply_parts.append(chunk)
            yield chunk

        self._context_manager.add_assistant_message(
            conversation=conversation,
            message="".join(full_reply_parts),
        )