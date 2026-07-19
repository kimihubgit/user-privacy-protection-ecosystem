"""
Handle Chat Message Use Case

Entrypoint của chatbot.

Pipeline:

User
    │
    ▼
FastPath
    │
    ├── URL
    ├── Email
    ├── Phone
    │
    ▼
Intent Classification
    │
    ▼
Dispatcher
    │
    ▼
Agent
"""

from application.models.conversation_context import (
    ConversationContext,
)
from application.services.context_manager import (
    ContextManager,
)
from application.models.agent_context import (
    AgentContext,
)
from application.use_cases.fast_path import FastPath
from application.use_cases.classify_intent import ClassifyIntentUseCase
from application.use_cases.dispatcher import Dispatcher
from domain.entities.agent_response import AgentResponse


class HandleChatMessageUseCase:
    def __init__(
        self,
        fast_path: FastPath,
        classifier: ClassifyIntentUseCase,
        dispatcher: Dispatcher,
        context_manager: ContextManager,
    ):
        self._fast_path = fast_path
        self._classifier = classifier
        self._dispatcher = dispatcher
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
        # Fast Path
        # ==========================================

        fast_response = await self._fast_path.execute(
            message=message,
        )

        if fast_response is not None:
            return fast_response

        # ==========================================
        # Intent Classification
        # ==========================================

        intent = await self._classifier.execute(
            message=message,
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
            message=intent.corrected_text or message,
        )

        # ==========================================
        # Dispatch
        # ==========================================

        response = await self._dispatcher.dispatch(
            intent=intent,
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