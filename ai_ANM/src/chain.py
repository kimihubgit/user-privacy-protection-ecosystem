"""Khởi tạo LLM (Groq) và ghép thành RAG chain."""

import logging

from langchain_core.output_parsers import StrOutputParser
from langchain_groq import ChatGroq

import config
from prompts import build_prompt

logger = logging.getLogger(__name__)


def build_llm() -> ChatGroq:
    """Khởi tạo LLM Groq. Raise nếu thiếu GROQ_API_KEY."""

    if not config.GROQ_API_KEY:
        raise ValueError(
            "Không tìm thấy GROQ_API_KEY. "
            "Hãy tạo file .env (xem .env.example) và điền API key."
        )

    llm = ChatGroq(
        model=config.LLM_MODEL_NAME,
        temperature=0,
        api_key=config.GROQ_API_KEY,
    )

    logger.info("Đã khởi tạo LLM: %s", config.LLM_MODEL_NAME)

    return llm


def build_rag_chain():
    """Ghép prompt | llm | output_parser thành RAG chain hoàn chỉnh."""

    prompt = build_prompt()
    llm = build_llm()

    return prompt | llm | StrOutputParser()
