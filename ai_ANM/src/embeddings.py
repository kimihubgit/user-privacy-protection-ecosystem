"""Khởi tạo embedding model và cross-encoder reranker."""

import logging
import config

from langchain_huggingface import HuggingFaceEmbeddings
from sentence_transformers import CrossEncoder


logger = logging.getLogger(__name__)


def load_embedding_model() -> HuggingFaceEmbeddings:
    """Khởi tạo embedding model tiếng Việt dùng cho FAISS."""

    model = HuggingFaceEmbeddings(
        model_name=config.EMBEDDING_MODEL_NAME,
        encode_kwargs={"normalize_embeddings": True},
    )

    logger.info("Đã load embedding model: %s", config.EMBEDDING_MODEL_NAME)

    return model


def load_reranker() -> CrossEncoder:
    """Khởi tạo cross-encoder dùng để rerank chunk trước khi đưa vào LLM."""

    reranker = CrossEncoder(config.RERANKER_MODEL_NAME)

    logger.info("Đã load reranker: %s", config.RERANKER_MODEL_NAME)

    return reranker
