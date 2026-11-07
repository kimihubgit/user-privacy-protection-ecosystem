"""Dependency Injection (DI) Container

Centralized assembly and lifecycle management for all application dependencies:
- Adapters (LLM, Cache, Vectorstore, External APIs)
- Domain Services & Parsers
- RAG & Tool Registry
- Specialized Agents
- Use Cases & Orchestration

All shared singletons are managed via `@lru_cache` to ensure efficient resource reuse
and deterministic lifecycle throughout the application.
"""

from functools import lru_cache
from typing import Optional

from config.settings import settings

# =============================================================================
# Domain & Application Core
# =============================================================================
from application.ports.llm_port import LLMPort
from application.services.context_manager import ContextManager
from domain.services.regex_detector import RegexDetector

# =============================================================================
# Infrastructure: LLM & Embeddings
# =============================================================================
from infrastructure.llm.gemini_adapter import GeminiAdapter
from infrastructure.llm.openai_compatible_adapter import OpenAICompatibleAdapter
from infrastructure.llm.fallback_llm_adapter import FallbackLLMAdapter
from infrastructure.embedding.gemini_embedding_adapter import GeminiEmbeddingAdapter

# =============================================================================
# Infrastructure: Cache, Vectorstore & Search
# =============================================================================
from infrastructure.cache.redis_cache_adapter import RedisCacheAdapter
from infrastructure.cache.cached_retriever import CachedRetriever
from infrastructure.cache.cached_web_search import CachedWebSearch
from infrastructure.vectorstore.pinecone_adapter import PineconeAdapter
from infrastructure.retrieval.pinecone_retriever import PineconeRetriever
from infrastructure.retrieval.hybrid_retriever import HybridRetriever
from infrastructure.search.tavily_adapter import TavilyAdapter
from infrastructure.external.anti_scam_backend_adapter import AntiScamBackendAdapter
from infrastructure.external.vtrust_image_adapter import VtrustImageAdapter

# =============================================================================
# Parsers
# =============================================================================
from infrastructure.parsers.tool_call_parser import ToolCallParser
from infrastructure.parsers.evaluation_parser import EvaluationParser
from infrastructure.parsers.risk_parser import RiskParser
from infrastructure.parsers.validation_parser import ValidationParser

# =============================================================================
# Tools
# =============================================================================
from application.tools.tool_registry import ToolRegistry
from application.tools.url_checker_tool import URLCheckerTool
from application.tools.cyber_law_rag_tool import CyberLawRAGTool
from application.tools.scam_knowledge_tool import ScamKnowledgeTool
from application.tools.image_analysis_tool import ImageAnalysisTool
from application.tools.web_search_tool import WebSearchTool

# =============================================================================
# Agents & Orchestrator
# =============================================================================
from application.agents.planner_agent import PlannerAgent
from application.agents.memory_agent import MemoryAgent
from application.agents.retrieval_agent import RetrievalAgent
from application.agents.evaluation_agent import EvaluationAgent
from application.agents.query_rewrite_agent import QueryRewriteAgent
from application.agents.risk_analysis_agent import RiskAnalysisAgent
from application.agents.response_agent import ResponseAgent
from application.agents.answer_validation_agent import AnswerValidationAgent
from application.agents.outside_scope_agent import OutsideScopeAgent
from application.agents.orchestrator import AgentOrchestrator

# =============================================================================
# Use Cases
# =============================================================================
from application.use_cases.handle_chat_message import HandleChatMessageUseCase
from application.use_cases.analyze_image import AnalyzeImageUseCase


# =============================================================================
# Section 1: LLM Adapters & Multi-Provider Factories
# =============================================================================

@lru_cache(maxsize=1)
def gemini_adapter() -> GeminiAdapter:
    """Default Gemini instance using the global GEMINI_API_KEY."""
    return GeminiAdapter()


@lru_cache(maxsize=16)
def _gemini_client_for(
    agent_key: str,
    max_output_tokens: int = 1024,
    agent_name: str = "gemini",
) -> GeminiAdapter:
    """Cached factory creating dedicated GeminiAdapter instances per agent.

    Caches on (agent_key, max_output_tokens, agent_name) to reuse underlying
    network sessions while enforcing per-agent token limits.
    """
    return GeminiAdapter(
        api_key=agent_key,
        max_output_tokens=max_output_tokens,
        agent_name=agent_name,
    )


def gemini_adapter_planner() -> GeminiAdapter:
    """Gemini client for PlannerAgent (max 512 tokens)."""
    return _gemini_client_for(
        settings.get_gemini_key_for("planner"),
        max_output_tokens=512,
        agent_name="planner",
    )


def gemini_adapter_evaluation() -> GeminiAdapter:
    """Gemini client for EvaluationAgent (max 256 tokens)."""
    return _gemini_client_for(
        settings.get_gemini_key_for("evaluation"),
        max_output_tokens=256,
        agent_name="evaluation",
    )


def gemini_adapter_query_rewrite() -> GeminiAdapter:
    """Gemini client for QueryRewriteAgent (max 256 tokens)."""
    return _gemini_client_for(
        settings.get_gemini_key_for("query_rewrite"),
        max_output_tokens=256,
        agent_name="query_rewrite",
    )


def gemini_adapter_answer_validation() -> GeminiAdapter:
    """Gemini client for AnswerValidationAgent (max 256 tokens)."""
    return _gemini_client_for(
        settings.get_gemini_key_for("answer_validation"),
        max_output_tokens=256,
        agent_name="answer_validation",
    )


def gemini_adapter_risk_analysis() -> GeminiAdapter:
    """Gemini client for RiskAnalysisAgent (max 1024 tokens)."""
    return _gemini_client_for(
        settings.get_gemini_key_for("risk_analysis"),
        max_output_tokens=1024,
        agent_name="risk_analysis",
    )


def gemini_adapter_response() -> GeminiAdapter:
    """Gemini client for ResponseAgent (max 900 tokens)."""
    return _gemini_client_for(
        settings.get_gemini_key_for("response"),
        max_output_tokens=900,
        agent_name="response",
    )


def gemini_adapter_outside_scope() -> GeminiAdapter:
    """Gemini client for OutsideScopeAgent (max 512 tokens)."""
    return _gemini_client_for(
        settings.get_gemini_key_for("outside_scope"),
        max_output_tokens=512,
        agent_name="outside_scope",
    )


@lru_cache(maxsize=1)
def local_llm_adapter() -> OpenAICompatibleAdapter:
    """Client for local LLMs (e.g., Qwen3 via LM Studio or Ollama)."""
    return OpenAICompatibleAdapter(
        base_url=settings.LOCAL_LLM_BASE_URL,
        api_key=settings.LOCAL_LLM_API_KEY,
        model=settings.LOCAL_LLM_MODEL,
        temperature=settings.LOCAL_LLM_TEMPERATURE,
        max_tokens=settings.LOCAL_LLM_MAX_TOKENS,
        provider_name="local-qwen3",
    )


@lru_cache(maxsize=1)
def groq_adapter() -> OpenAICompatibleAdapter:
    """Default Groq client using global GROQ_API_KEY."""
    return OpenAICompatibleAdapter(
        base_url=settings.GROQ_BASE_URL,
        api_key=settings.GROQ_API_KEY,
        model=settings.GROQ_MODEL,
        temperature=settings.GROQ_TEMPERATURE,
        max_tokens=settings.GROQ_MAX_TOKENS,
        provider_name="groq",
    )


@lru_cache(maxsize=8)
def _groq_client_for(agent_key: str, agent_name: str = "groq") -> OpenAICompatibleAdapter:
    """Cached factory creating dedicated Groq clients per agent."""
    return OpenAICompatibleAdapter(
        base_url=settings.GROQ_BASE_URL,
        api_key=agent_key,
        model=settings.GROQ_MODEL,
        temperature=settings.GROQ_TEMPERATURE,
        max_tokens=settings.GROQ_MAX_TOKENS,
        provider_name="groq",
        agent_name=agent_name,
    )


def groq_adapter_response() -> OpenAICompatibleAdapter:
    """Groq client for ResponseAgent."""
    return _groq_client_for(
        settings.get_groq_key_for("response"),
        agent_name="response",
    )


def groq_adapter_evaluation() -> OpenAICompatibleAdapter:
    """Groq client for EvaluationAgent."""
    return _groq_client_for(
        settings.get_groq_key_for("evaluation"),
        agent_name="evaluation",
    )


def _llm_for_agent(
    *,
    provider: str,
    gemini_fallback: GeminiAdapter,
    groq_client: Optional[OpenAICompatibleAdapter] = None,
    local_client: Optional[OpenAICompatibleAdapter] = None,
) -> LLMPort:
    """Select primary LLM provider with transparent fallback to Gemini.

    - "gemini": Direct Gemini client.
    - "local": Local OpenAI-compatible server wrapped in FallbackLLMAdapter.
    - "groq": Groq API wrapped in FallbackLLMAdapter (safely falls back if key is missing).
    - Unrecognized values default directly to Gemini to prevent runtime crashes.
    """
    normalized_provider = (provider or "gemini").strip().lower()

    if normalized_provider == "local":
        if not settings.has_local_llm:
            return gemini_fallback
        return FallbackLLMAdapter(
            primary=local_client or local_llm_adapter(),
            fallback=gemini_fallback,
            primary_name="local-qwen3",
        )

    if normalized_provider == "groq":
        if not settings.has_valid_groq_key:
            return gemini_fallback
        return FallbackLLMAdapter(
            primary=groq_client or groq_adapter(),
            fallback=gemini_fallback,
            primary_name="groq",
        )

    return gemini_fallback


# =============================================================================
# Section 2: External Adapters, Storage & Cache
# =============================================================================

@lru_cache(maxsize=1)
def anti_scam_backend_adapter() -> AntiScamBackendAdapter:
    """Adapter connecting to external Anti-Scam backend."""
    return AntiScamBackendAdapter()


@lru_cache(maxsize=1)
def vtrust_image_adapter() -> VtrustImageAdapter:
    """Adapter connecting to VTrust image phishing analysis API."""
    return VtrustImageAdapter()


@lru_cache(maxsize=1)
def cache_adapter() -> RedisCacheAdapter:
    """Thread-safe Redis cache adapter."""
    return RedisCacheAdapter(
        redis_url=settings.REDIS_URL,
        db=settings.REDIS_DB,
    )


@lru_cache(maxsize=1)
def search_adapter() -> CachedWebSearch:
    """Cached web search adapter backed by Tavily."""
    return CachedWebSearch(
        search=TavilyAdapter(),
        cache=cache_adapter(),
        ttl=settings.CACHE_TTL,
    )


# =============================================================================
# Section 3: Embeddings & Vectorstore Retrieval
# =============================================================================

@lru_cache(maxsize=1)
def embedding_adapter() -> GeminiEmbeddingAdapter:
    """Adapter for generating vector embeddings via Gemini."""
    return GeminiEmbeddingAdapter()


@lru_cache(maxsize=1)
def vector_store() -> PineconeAdapter:
    """Vector database adapter for Pinecone."""
    return PineconeAdapter()


@lru_cache(maxsize=1)
def retriever() -> CachedRetriever:
    """Hybrid dense/sparse retriever cached via Redis."""
    dense = PineconeRetriever(
        embedding=embedding_adapter(),
        vector_store=vector_store(),
    )
    hybrid = HybridRetriever(
        dense_retriever=dense,
        alpha=0.5,
    )
    return CachedRetriever(
        retriever=hybrid,
        cache=cache_adapter(),
        ttl=settings.CACHE_TTL,
    )


# =============================================================================
# Section 4: Parsers & Domain Services
# =============================================================================

@lru_cache(maxsize=1)
def tool_call_parser() -> ToolCallParser:
    return ToolCallParser()


@lru_cache(maxsize=1)
def evaluation_parser() -> EvaluationParser:
    return EvaluationParser()


@lru_cache(maxsize=1)
def risk_parser() -> RiskParser:
    return RiskParser()


@lru_cache(maxsize=1)
def validation_parser() -> ValidationParser:
    return ValidationParser()


@lru_cache(maxsize=1)
def regex_detector() -> RegexDetector:
    return RegexDetector()


@lru_cache(maxsize=1)
def context_manager() -> ContextManager:
    return ContextManager()


# =============================================================================
# Section 5: Tools & Tool Registry
# =============================================================================

@lru_cache(maxsize=1)
def url_checker_tool() -> URLCheckerTool:
    return URLCheckerTool(backend=anti_scam_backend_adapter())


@lru_cache(maxsize=1)
def cyber_law_rag_tool() -> CyberLawRAGTool:
    return CyberLawRAGTool(
        retriever=retriever(),
        namespace=settings.PINECONE_NAMESPACE_LAW,
    )


@lru_cache(maxsize=1)
def scam_knowledge_tool() -> ScamKnowledgeTool:
    return ScamKnowledgeTool(
        retriever=retriever(),
        namespace=settings.PINECONE_NAMESPACE_SCAM,
    )


@lru_cache(maxsize=1)
def image_analysis_tool() -> ImageAnalysisTool:
    return ImageAnalysisTool(checker=vtrust_image_adapter())


@lru_cache(maxsize=1)
def web_search_tool() -> WebSearchTool:
    return WebSearchTool(search=search_adapter())


@lru_cache(maxsize=1)
def tool_registry() -> ToolRegistry:
    """Unified tool registry with all anti-scam and verification tools."""
    registry = ToolRegistry()
    registry.register(url_checker_tool())
    registry.register(cyber_law_rag_tool())
    registry.register(scam_knowledge_tool())
    registry.register(image_analysis_tool())
    registry.register(web_search_tool())
    return registry


# =============================================================================
# Section 6: Agent Ports & Specialized Agents
# =============================================================================

@lru_cache(maxsize=1)
def planner_llm() -> LLMPort:
    return _llm_for_agent(
        provider=settings.PLANNER_PROVIDER,
        gemini_fallback=gemini_adapter_planner(),
    )


@lru_cache(maxsize=1)
def planner_agent() -> PlannerAgent:
    return PlannerAgent(
        llm=planner_llm(),
        parser=tool_call_parser(),
    )


@lru_cache(maxsize=1)
def memory_agent() -> MemoryAgent:
    return MemoryAgent(context_manager=context_manager())


@lru_cache(maxsize=1)
def retrieval_agent() -> RetrievalAgent:
    return RetrievalAgent()


@lru_cache(maxsize=1)
def evaluation_llm() -> LLMPort:
    return _llm_for_agent(
        provider=settings.EVALUATION_PROVIDER,
        gemini_fallback=gemini_adapter_evaluation(),
        groq_client=groq_adapter_evaluation(),
    )


@lru_cache(maxsize=1)
def evaluation_agent() -> EvaluationAgent:
    return EvaluationAgent(
        llm=evaluation_llm(),
        parser=evaluation_parser(),
    )


@lru_cache(maxsize=1)
def query_rewrite_llm() -> LLMPort:
    return _llm_for_agent(
        provider=settings.QUERY_REWRITE_PROVIDER,
        gemini_fallback=gemini_adapter_query_rewrite(),
    )


@lru_cache(maxsize=1)
def query_rewrite_agent() -> QueryRewriteAgent:
    return QueryRewriteAgent(llm=query_rewrite_llm())


@lru_cache(maxsize=1)
def risk_analysis_agent() -> RiskAnalysisAgent:
    return RiskAnalysisAgent(
        llm=gemini_adapter_risk_analysis(),
        parser=risk_parser(),
    )


@lru_cache(maxsize=1)
def response_llm() -> LLMPort:
    return _llm_for_agent(
        provider=settings.RESPONSE_PROVIDER,
        gemini_fallback=gemini_adapter_response(),
        groq_client=groq_adapter_response(),
    )


@lru_cache(maxsize=1)
def response_agent() -> ResponseAgent:
    return ResponseAgent(llm=response_llm())


@lru_cache(maxsize=1)
def answer_validation_llm() -> LLMPort:
    return _llm_for_agent(
        provider=settings.ANSWER_VALIDATION_PROVIDER,
        gemini_fallback=gemini_adapter_answer_validation(),
    )


@lru_cache(maxsize=1)
def answer_validation_agent() -> AnswerValidationAgent:
    return AnswerValidationAgent(
        llm=answer_validation_llm(),
        parser=validation_parser(),
    )


@lru_cache(maxsize=1)
def outside_scope_agent() -> OutsideScopeAgent:
    return OutsideScopeAgent(llm=gemini_adapter_outside_scope())


# =============================================================================
# Section 7: Orchestrator & Use Cases
# =============================================================================

@lru_cache(maxsize=1)
def orchestrator() -> AgentOrchestrator:
    """Multi-Agent Orchestrator wiring all specialized sub-agents and tools."""
    return AgentOrchestrator(
        planner=planner_agent(),
        memory=memory_agent(),
        retrieval=retrieval_agent(),
        evaluation=evaluation_agent(),
        rewrite=query_rewrite_agent(),
        risk=risk_analysis_agent(),
        response=response_agent(),
        validator=answer_validation_agent(),
        outside_scope=outside_scope_agent(),
        tool_registry=tool_registry(),
    )


@lru_cache(maxsize=1)
def handle_chat_message_use_case() -> HandleChatMessageUseCase:
    """Primary chat interaction use case."""
    return HandleChatMessageUseCase(
        orchestrator=orchestrator(),
        context_manager=context_manager(),
    )


@lru_cache(maxsize=1)
def analyze_image_use_case() -> AnalyzeImageUseCase:
    """Image analysis and phishing detection use case."""
    return AnalyzeImageUseCase(checker=vtrust_image_adapter())
