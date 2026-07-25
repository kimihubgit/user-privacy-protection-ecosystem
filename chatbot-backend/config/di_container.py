"""
Dependency Injection Container
"""

from functools import lru_cache

from config.settings import settings  # Thêm import settings

# =====================================================
# Domain
# =====================================================

from domain.services.regex_detector import RegexDetector

# =====================================================
# Services
# =====================================================

from application.services.context_manager import ContextManager

# =====================================================
# Infrastructure & Parsers
# =====================================================

from infrastructure.llm.gemini_adapter import GeminiAdapter
from infrastructure.llm.openai_compatible_adapter import (
    OpenAICompatibleAdapter,
)
from infrastructure.llm.fallback_llm_adapter import FallbackLLMAdapter

from infrastructure.cache.redis_cache_adapter import RedisCacheAdapter
from infrastructure.cache.cached_retriever import CachedRetriever
from infrastructure.cache.cached_web_search import CachedWebSearch
from infrastructure.retrieval.hybrid_retriever import HybridRetriever
from application.ports.llm_port import LLMPort

from infrastructure.external.anti_scam_backend_adapter import (
    AntiScamBackendAdapter,
)

from infrastructure.external.vtrust_image_adapter import (
    VtrustImageAdapter,
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

from infrastructure.parsers.tool_call_parser import ToolCallParser
from infrastructure.parsers.evaluation_parser import EvaluationParser
from infrastructure.parsers.risk_parser import RiskParser  # Thêm import RiskParser
from infrastructure.parsers.validation_parser import ValidationParser

from infrastructure.search.tavily_adapter import TavilyAdapter

# =====================================================
# Tools
# =====================================================

from application.tools.tool_registry import ToolRegistry

from application.tools.url_checker_tool import URLCheckerTool
from application.tools.cyber_law_rag_tool import CyberLawRAGTool
from application.tools.scam_knowledge_tool import ScamKnowledgeTool
from application.tools.image_analysis_tool import ImageAnalysisTool
from application.tools.web_search_tool import WebSearchTool

# =====================================================
# Agents
# =====================================================

from application.agents.planner_agent import PlannerAgent
from application.agents.memory_agent import MemoryAgent
from application.agents.retrieval_agent import RetrievalAgent
from application.agents.evaluation_agent import EvaluationAgent
from application.agents.query_rewrite_agent import QueryRewriteAgent
from application.agents.risk_analysis_agent import RiskAnalysisAgent
from application.agents.response_agent import ResponseAgent
from application.agents.answer_validation_agent import (
    AnswerValidationAgent,
)
from application.agents.outside_scope_agent import (
    OutsideScopeAgent,
)
from application.agents.orchestrator import AgentOrchestrator

# =====================================================
# UseCases
# =====================================================

from application.use_cases.handle_chat_message import (
    HandleChatMessageUseCase,
)

from application.use_cases.analyze_image import (
    AnalyzeImageUseCase,
)

# =====================================================
# Infrastructure
# =====================================================


@lru_cache
def gemini_adapter():
    """
    Instance Gemini mặc định (dùng GEMINI_API_KEY).

    Giữ lại cho các thành phần chưa cần key riêng (vd: test, script...).
    Các Agent chính đã chuyển sang dùng client riêng ở dưới.
    """
    return GeminiAdapter()


@lru_cache
def _gemini_client_for(
    agent_key: str,
    max_output_tokens: int = 1024,
    agent_name: str = "gemini",
) -> GeminiAdapter:
    """
    Tạo (và cache) 1 GeminiAdapter riêng cho từng Agent.

    `agent_key` là API key thực tế sẽ dùng (đã fallback về
    GEMINI_API_KEY mặc định nếu Agent chưa được cấu hình key riêng).
    lru_cache theo (key, max_output_tokens) -> các Agent trỏ cùng 1 key
    VÀ cùng giới hạn token dùng chung 1 client, tránh tạo thừa
    connection; khác giới hạn token thì có instance riêng (rẻ, không
    tốn thêm request nào).

    max_output_tokens nên nhỏ cho các Agent chỉ trả JSON/1 câu ngắn
    (Planner, Evaluation, QueryRewrite, AnswerValidation) để tránh tốn
    token/tiền/thời gian không cần thiết; để lớn hơn cho các Agent cần
    sinh văn bản dài (Response, RiskAnalysis).
    """
    return GeminiAdapter(
        api_key=agent_key,
        max_output_tokens=max_output_tokens,
        agent_name=agent_name,
    )


def gemini_adapter_planner() -> GeminiAdapter:
    return _gemini_client_for(
        settings.GEMINI_API_KEY_PLANNER or settings.GEMINI_API_KEY,
        max_output_tokens=512,
        agent_name="planner",
    )


def gemini_adapter_evaluation() -> GeminiAdapter:
    return _gemini_client_for(
        settings.GEMINI_API_KEY_EVALUATION or settings.GEMINI_API_KEY,
        max_output_tokens=256,
        agent_name="evaluation",
    )


def gemini_adapter_query_rewrite() -> GeminiAdapter:
    return _gemini_client_for(
        settings.GEMINI_API_KEY_QUERY_REWRITE or settings.GEMINI_API_KEY,
        # Tăng từ 128 -> 256: 128 từng bị cắt cụt giữa câu (vd:
        # "mức xử phạt hành" thiếu "chính"), làm mất từ khóa quan
        # trọng của truy vấn.
        max_output_tokens=256,
        agent_name="query_rewrite",
    )


def gemini_adapter_answer_validation() -> GeminiAdapter:
    return _gemini_client_for(
        settings.GEMINI_API_KEY_ANSWER_VALIDATION or settings.GEMINI_API_KEY,
        max_output_tokens=256,
        agent_name="answer_validation",
    )


def gemini_adapter_risk_analysis() -> GeminiAdapter:
    return _gemini_client_for(
        settings.GEMINI_API_KEY_RISK_ANALYSIS or settings.GEMINI_API_KEY,
        max_output_tokens=1024,
        agent_name="risk_analysis",
    )


def gemini_adapter_response() -> GeminiAdapter:
    return _gemini_client_for(
        settings.GEMINI_API_KEY_RESPONSE or settings.GEMINI_API_KEY,
        max_output_tokens=900,
        agent_name="response",
    )


def gemini_adapter_outside_scope() -> GeminiAdapter:
    return _gemini_client_for(
        settings.GEMINI_API_KEY_OUTSIDE_SCOPE or settings.GEMINI_API_KEY,
        max_output_tokens=512,
        agent_name="outside_scope",
    )


# =====================================================
# Local LLM (Qwen3 4B qua LM Studio) & Groq
#
# Dùng chung 1 class OpenAICompatibleAdapter vì cả 2 đều expose
# API dạng OpenAI Chat Completions, chỉ khác base_url/key/model.
# =====================================================


@lru_cache
def local_llm_adapter() -> OpenAICompatibleAdapter:
    return OpenAICompatibleAdapter(
        base_url=settings.LOCAL_LLM_BASE_URL,
        api_key=settings.LOCAL_LLM_API_KEY,
        model=settings.LOCAL_LLM_MODEL,
        temperature=settings.LOCAL_LLM_TEMPERATURE,
        max_tokens=settings.LOCAL_LLM_MAX_TOKENS,
        provider_name="local-qwen3",
    )


@lru_cache
def groq_adapter() -> OpenAICompatibleAdapter:
    return OpenAICompatibleAdapter(
        base_url=settings.GROQ_BASE_URL,
        api_key=settings.GROQ_API_KEY,
        model=settings.GROQ_MODEL,
        temperature=settings.GROQ_TEMPERATURE,
        max_tokens=settings.GROQ_MAX_TOKENS,
        provider_name="groq",
    )


@lru_cache
def _groq_client_for(agent_key: str, agent_name: str = "groq") -> OpenAICompatibleAdapter:
    """
    Tạo (và cache) 1 OpenAICompatibleAdapter (Groq) riêng cho từng
    Agent, tương tự `_gemini_client_for`. `agent_key` là API key thực
    tế sẽ dùng (đã fallback về GROQ_API_KEY mặc định nếu Agent chưa
    được cấu hình key riêng).
    """

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
    return _groq_client_for(
        settings.GROQ_API_KEY_RESPONSE or settings.GROQ_API_KEY,
        agent_name="response",
    )


def groq_adapter_evaluation() -> OpenAICompatibleAdapter:
    return _groq_client_for(
        settings.GROQ_API_KEY_EVALUATION or settings.GROQ_API_KEY,
        agent_name="evaluation",
    )


def _llm_for_agent(
    *,
    provider: str,
    gemini_fallback: GeminiAdapter,
    groq_client: OpenAICompatibleAdapter | None = None,
    local_client: OpenAICompatibleAdapter | None = None,
) -> LLMPort:
    """
    Chọn LLM chính theo `provider` ("local" | "groq" | "gemini") và
    tự động bọc fallback về Gemini nếu provider chính không phải Gemini.

    - provider == "gemini": dùng thẳng Gemini (đã là fallback rồi,
      không cần bọc thêm).
    - provider == "local": Qwen3 4B (LM Studio), fallback Gemini.
    - provider == "groq": Groq (key riêng theo Agent nếu có,
      qua `groq_client`), fallback Gemini.
    - Giá trị lạ/không nhận diện được -> mặc định về Gemini luôn,
      để chatbot vẫn chạy được thay vì crash vì cấu hình sai.
    """

    provider = (provider or "gemini").strip().lower()

    if provider == "local":

        return FallbackLLMAdapter(
            primary=local_client or local_llm_adapter(),
            fallback=gemini_fallback,
            primary_name="local-qwen3",
        )

    if provider == "groq":

        return FallbackLLMAdapter(
            primary=groq_client or groq_adapter(),
            fallback=gemini_fallback,
            primary_name="groq",
        )

    return gemini_fallback


@lru_cache
def anti_scam_backend_adapter():
    return AntiScamBackendAdapter()


@lru_cache
def vtrust_image_adapter():
    return VtrustImageAdapter()


@lru_cache
def cache_adapter() -> RedisCacheAdapter:
    return RedisCacheAdapter(
        redis_url=settings.REDIS_URL,
        db=settings.REDIS_DB,
    )


@lru_cache
def search_adapter():
    return CachedWebSearch(
        search=TavilyAdapter(),
        cache=cache_adapter(),
        ttl=settings.CACHE_TTL,
    )


@lru_cache
def embedding_adapter():
    return GeminiEmbeddingAdapter()


@lru_cache
def vector_store():
    return PineconeAdapter()


@lru_cache
def retriever():
    dense_retriever = PineconeRetriever(
        embedding=embedding_adapter(),
        vector_store=vector_store(),
    )

    hybrid_retriever = HybridRetriever(
        dense_retriever=dense_retriever,
        alpha=0.5,
    )

    return CachedRetriever(
        retriever=hybrid_retriever,
        cache=cache_adapter(),
        ttl=settings.CACHE_TTL,
    )


@lru_cache
def tool_call_parser():
    return ToolCallParser()


@lru_cache
def evaluation_parser():
    return EvaluationParser()


@lru_cache
def risk_parser():
    return RiskParser()


# =====================================================
# Domain
# =====================================================


@lru_cache
def regex_detector():
    return RegexDetector()


# =====================================================
# Services
# =====================================================


@lru_cache
def context_manager():
    return ContextManager()


# =====================================================
# Tools
# =====================================================


@lru_cache
def url_checker_tool():
    return URLCheckerTool(
        backend=anti_scam_backend_adapter(),
    )


@lru_cache
def cyber_law_rag_tool():
    return CyberLawRAGTool(
        retriever=retriever(),
        namespace=settings.PINECONE_NAMESPACE_LAW,
    )


@lru_cache
def scam_knowledge_tool():
    return ScamKnowledgeTool(
        retriever=retriever(),
        namespace=settings.PINECONE_NAMESPACE_SCAM,
    )


@lru_cache
def image_analysis_tool():
    return ImageAnalysisTool(
        checker=vtrust_image_adapter(),
    )


@lru_cache
def web_search_tool():
    return WebSearchTool(
        search=search_adapter(),
    )


@lru_cache
def tool_registry():

    registry = ToolRegistry()

    registry.register(url_checker_tool())
    registry.register(cyber_law_rag_tool())
    registry.register(scam_knowledge_tool())
    registry.register(image_analysis_tool())
    registry.register(web_search_tool())

    return registry


# =====================================================
# Agents
# =====================================================


@lru_cache
def planner_llm() -> LLMPort:
    return _llm_for_agent(
        provider=settings.PLANNER_PROVIDER,
        gemini_fallback=gemini_adapter_planner(),
    )


@lru_cache
def planner_agent():

    return PlannerAgent(
        llm=planner_llm(),
        parser=tool_call_parser(),
    )


@lru_cache
def memory_agent():

    return MemoryAgent(
        context_manager=context_manager(),
    )


@lru_cache
def retrieval_agent():

    return RetrievalAgent()


@lru_cache
def evaluation_llm() -> LLMPort:
    return _llm_for_agent(
        provider=settings.EVALUATION_PROVIDER,
        gemini_fallback=gemini_adapter_evaluation(),
        groq_client=groq_adapter_evaluation(),
    )


@lru_cache
def evaluation_agent():

    return EvaluationAgent(
        llm=evaluation_llm(),
        parser=evaluation_parser(),
    )


@lru_cache
def query_rewrite_llm() -> LLMPort:
    return _llm_for_agent(
        provider=settings.QUERY_REWRITE_PROVIDER,
        gemini_fallback=gemini_adapter_query_rewrite(),
    )


@lru_cache
def query_rewrite_agent() -> QueryRewriteAgent:

    return QueryRewriteAgent(
        llm=query_rewrite_llm(),
    )


@lru_cache
def risk_analysis_agent():

    return RiskAnalysisAgent(
        llm=gemini_adapter_risk_analysis(),
        parser=risk_parser(),
    )


@lru_cache
def response_llm() -> LLMPort:
    return _llm_for_agent(
        provider=settings.RESPONSE_PROVIDER,
        gemini_fallback=gemini_adapter_response(),
        groq_client=groq_adapter_response(),
    )


@lru_cache
def response_agent():

    return ResponseAgent(
        llm=response_llm(),
    )


@lru_cache
def answer_validation_llm() -> LLMPort:
    return _llm_for_agent(
        provider=settings.ANSWER_VALIDATION_PROVIDER,
        gemini_fallback=gemini_adapter_answer_validation(),
    )


@lru_cache
def answer_validation_agent():

    return AnswerValidationAgent(
        llm=answer_validation_llm(),
        parser=ValidationParser(),
    )


@lru_cache
def outside_scope_agent():

    return OutsideScopeAgent(
        llm=gemini_adapter_outside_scope(),
    )


@lru_cache
def orchestrator():

    return AgentOrchestrator(
        planner=planner_agent(),
        memory=memory_agent(),
        retrieval=retrieval_agent(),
        evaluation=evaluation_agent(),
        rewrite=query_rewrite_agent(),
        risk=risk_analysis_agent(),
        response=response_agent(),
        validator=answer_validation_agent(),
        outside_scope=outside_scope_agent(),  # <- Đã thêm inject OutsideScopeAgent
        tool_registry=tool_registry(),
    )


# =====================================================
# UseCases
# =====================================================


@lru_cache
def handle_chat_message_use_case():

    return HandleChatMessageUseCase(
        orchestrator=orchestrator(),
        context_manager=context_manager(),
    )


@lru_cache
def analyze_image_use_case():

    return AnalyzeImageUseCase(
        checker=vtrust_image_adapter(),
    )