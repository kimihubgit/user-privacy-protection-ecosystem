"""
Dependency Injection Container

Composition Root của toàn bộ ứng dụng.

Nguyên tắc:
- Chỉ file này được phép khởi tạo Adapter.
- Controller, Route và UseCase không được new Adapter.
- Chỉ wire những thành phần đã được triển khai.
"""

from functools import lru_cache

# =====================================================
# Domain
# =====================================================

from domain.services.regex_detector import RegexDetector
# =====================================================
# Services
# =====================================================

from application.services.context_manager import (
    ContextManager,
)

# =====================================================
# Infrastructure
# =====================================================

from infrastructure.llm.gemini_adapter import GeminiAdapter

from infrastructure.external.anti_scam_backend_adapter import (
    AntiScamBackendAdapter,
)

from infrastructure.external.vtrust_image_adapter import (
    VtrustImageAdapter,
)

from infrastructure.parsers.intent_parser import (
    IntentParser,
)

from infrastructure.embedding.gemini_embedding_adapter import (
    GeminiEmbeddingAdapter,
)

from infrastructure.vectorstore.pinecone_adapter import (
    PineconeAdapter,
)

from infrastructure.retrieval.pinecone_retriever import (
    PineconeRetriever,
)

# =====================================================
# Agents
# =====================================================

from application.agents.general_chat_agent import (
    GeneralChatAgent,
)

from application.agents.law_agent import (
    LawAgent,
)

from application.agents.scam_agent import (
    ScamAgent,
)

# =====================================================
# Use Cases
# =====================================================

from application.use_cases.fast_path import (
    FastPath,
)

from application.use_cases.classify_intent import (
    ClassifyIntentUseCase,
)

from application.use_cases.dispatcher import (
    Dispatcher,
)

from application.use_cases.handle_chat_message import (
    HandleChatMessageUseCase,
)

from application.use_cases.analyze_image import (
    AnalyzeImageUseCase,
)

# =====================================================
# Infrastructure Singleton
# =====================================================

@lru_cache
def gemini_adapter() -> GeminiAdapter:
    return GeminiAdapter()


@lru_cache
def anti_scam_backend_adapter() -> AntiScamBackendAdapter:
    return AntiScamBackendAdapter()


@lru_cache
def vtrust_image_adapter() -> VtrustImageAdapter:
    return VtrustImageAdapter()


@lru_cache
def intent_parser() -> IntentParser:
    return IntentParser()


@lru_cache
def embedding_adapter() -> GeminiEmbeddingAdapter:
    return GeminiEmbeddingAdapter()


@lru_cache
def vector_store() -> PineconeAdapter:
    return PineconeAdapter()


@lru_cache
def retriever() -> PineconeRetriever:
    return PineconeRetriever(
        embedding=embedding_adapter(),
        vector_store=vector_store(),
    )


# =====================================================
# Domain Singleton
# =====================================================

@lru_cache
def regex_detector() -> RegexDetector:
    return RegexDetector()


# =====================================================
# Service Singleton
# =====================================================

@lru_cache
def context_manager() -> ContextManager:
    return ContextManager()


# =====================================================
# Agent Singleton
# =====================================================

@lru_cache
def law_agent() -> LawAgent:
    return LawAgent(
        llm=gemini_adapter(),
        retriever=retriever(),
    )


@lru_cache
def scam_agent() -> ScamAgent:
    return ScamAgent(
        llm=gemini_adapter(),
        retriever=retriever(),
    )


@lru_cache
def general_chat_agent() -> GeneralChatAgent:
    return GeneralChatAgent(
        llm=gemini_adapter(),
    )


# =====================================================
# Use Case Singleton
# =====================================================

@lru_cache
def fast_path_use_case() -> FastPath:
    return FastPath(
        detector=regex_detector(),
        lookup=anti_scam_backend_adapter(),
    )


@lru_cache
def classify_intent_use_case() -> ClassifyIntentUseCase:
    return ClassifyIntentUseCase(
        llm=gemini_adapter(),
        parser=intent_parser(),
    )


@lru_cache
def dispatcher() -> Dispatcher:
    return Dispatcher(
        law_agent=law_agent(),
        scam_agent=scam_agent(),
        general_agent=general_chat_agent(),
    )


@lru_cache
def handle_chat_message_use_case() -> HandleChatMessageUseCase:
    return HandleChatMessageUseCase(
        fast_path=fast_path_use_case(),
        classifier=classify_intent_use_case(),
        dispatcher=dispatcher(),
        context_manager=context_manager(),
    )


@lru_cache
def analyze_image_use_case() -> AnalyzeImageUseCase:
    return AnalyzeImageUseCase(
        checker=vtrust_image_adapter(),
    )