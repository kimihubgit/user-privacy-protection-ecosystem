"""Application Configuration Module

Centralized configuration management powered by Pydantic BaseSettings.
Loads environment variables from .env file or host environment with
fallback defaults for development and testing environments.
"""

from functools import lru_cache
from pathlib import Path
from typing import List, Optional

from pydantic_settings import BaseSettings, SettingsConfigDict

_BASE_DIR = Path(__file__).resolve().parent.parent
_ENV_PATH = _BASE_DIR / ".env"


class Settings(BaseSettings):
    """Global application settings with environment variable bindings."""

    model_config = SettingsConfigDict(
        env_file=str(_ENV_PATH) if _ENV_PATH.exists() else ".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )

    # =========================================================================
    # Application & Server
    # =========================================================================
    APP_NAME: str = "AI Anti Scam Chatbot"
    APP_VERSION: str = "1.0.0"
    ENVIRONMENT: str = "development"
    DEBUG: bool = True
    HOST: str = "0.0.0.0"
    PORT: int = 8000
    ANTI_SCAM_API: str = "http://127.0.0.1:8001"

    # =========================================================================
    # Gemini (Core LLM & Embeddings)
    # =========================================================================
    GEMINI_API_KEY: str = ""
    GEMINI_MODEL: str = "gemini-2.0-flash"
    EMBEDDING_MODEL: str = "models/text-embedding-004"

    # Dedicated Gemini API keys per agent (falls back to GEMINI_API_KEY if empty)
    GEMINI_API_KEY_PLANNER: str = ""
    GEMINI_API_KEY_EVALUATION: str = ""
    GEMINI_API_KEY_QUERY_REWRITE: str = ""
    GEMINI_API_KEY_ANSWER_VALIDATION: str = ""
    GEMINI_API_KEY_RISK_ANALYSIS: str = ""
    GEMINI_API_KEY_RESPONSE: str = ""
    GEMINI_API_KEY_OUTSIDE_SCOPE: str = ""

    # =========================================================================
    # Local LLM (OpenAI-compatible / LM Studio / Ollama / vLLM)
    # =========================================================================
    LOCAL_LLM_PROVIDER: str = "lmstudio"
    LOCAL_LLM_BASE_URL: str = "http://127.0.0.1:1234/v1"
    LOCAL_LLM_API_KEY: str = "lm-studio"
    LOCAL_LLM_MODEL: str = "qwen3-4b-instruct-2507"
    LOCAL_LLM_TEMPERATURE: float = 0.1
    LOCAL_LLM_MAX_TOKENS: int = 512

    # =========================================================================
    # Groq (OpenAI-compatible High-Speed Cloud API)
    # =========================================================================
    GROQ_API_KEY: str = ""
    GROQ_BASE_URL: str = "https://api.groq.com/openai/v1"
    GROQ_MODEL: str = "llama-3.3-70b-versatile"
    GROQ_TEMPERATURE: float = 0.3
    GROQ_MAX_TOKENS: int = 1024

    # Dedicated Groq API keys per agent (falls back to GROQ_API_KEY if empty)
    GROQ_API_KEY_RESPONSE: str = ""
    GROQ_API_KEY_EVALUATION: str = ""

    # =========================================================================
    # Agent Provider Routing
    # Options: "gemini" | "groq" | "local" (automatic fallback to Gemini on failure)
    # =========================================================================
    PLANNER_PROVIDER: str = "gemini"
    EVALUATION_PROVIDER: str = "gemini"
    QUERY_REWRITE_PROVIDER: str = "gemini"
    ANSWER_VALIDATION_PROVIDER: str = "gemini"
    RESPONSE_PROVIDER: str = "gemini"

    # =========================================================================
    # External APIs & Search
    # =========================================================================
    TAVILY_API_KEY: str = ""
    VTRUST_IMAGE_API: str = "https://vtrust.vn/api/ai-chat-image"
    VTRUST_IMAGE_TIMEOUT: int = 60

    # =========================================================================
    # Pinecone Vector Database
    # =========================================================================
    PINECONE_API_KEY: str = ""
    PINECONE_INDEX: str = ""
    PINECONE_NAMESPACE_LAW: str = "cyber-law"
    PINECONE_NAMESPACE_SCAM: str = "scam-knowledge"

    # =========================================================================
    # Storage & Cache (Redis)
    # =========================================================================
    REDIS_URL: str = "redis://localhost:6379"
    REDIS_DB: int = 0
    CACHE_TTL: int = 21600  # 6 hours in seconds

    # =========================================================================
    # Pipeline Limits & HTTP Settings
    # =========================================================================
    TOP_K: int = 5
    REQUEST_TIMEOUT: int = 10

    # =========================================================================
    # Security & CORS
    # =========================================================================
    ALLOWED_ORIGINS: List[str] = [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ]

    # =========================================================================
    # Helper Properties & Methods
    # =========================================================================
    def get_gemini_key_for(self, agent_name: str) -> str:
        """Resolve the Gemini API key for a specific agent with global fallback."""
        key_mapping = {
            "planner": self.GEMINI_API_KEY_PLANNER,
            "evaluation": self.GEMINI_API_KEY_EVALUATION,
            "query_rewrite": self.GEMINI_API_KEY_QUERY_REWRITE,
            "answer_validation": self.GEMINI_API_KEY_ANSWER_VALIDATION,
            "risk_analysis": self.GEMINI_API_KEY_RISK_ANALYSIS,
            "response": self.GEMINI_API_KEY_RESPONSE,
            "outside_scope": self.GEMINI_API_KEY_OUTSIDE_SCOPE,
        }
        custom_key = key_mapping.get(agent_name.lower(), "").strip()
        return custom_key if custom_key else self.GEMINI_API_KEY.strip()

    def get_groq_key_for(self, agent_name: str) -> str:
        """Resolve the Groq API key for a specific agent with global fallback."""
        key_mapping = {
            "response": self.GROQ_API_KEY_RESPONSE,
            "evaluation": self.GROQ_API_KEY_EVALUATION,
        }
        custom_key = key_mapping.get(agent_name.lower(), "").strip()
        return custom_key if custom_key else self.GROQ_API_KEY.strip()

    @property
    def has_valid_groq_key(self) -> bool:
        """Check whether a non-dummy Groq API key is configured."""
        key = self.GROQ_API_KEY.strip()
        return bool(key and not key.startswith("your_") and not key.startswith("<"))

    @property
    def has_local_llm(self) -> bool:
        """Check whether Local LLM server URL is provided."""
        return bool(self.LOCAL_LLM_BASE_URL.strip())


@lru_cache(maxsize=1)
def get_settings() -> Settings:
    """Thread-safe singleton factory for application settings."""
    return Settings()


# Global singleton settings instance
settings: Settings = get_settings()
