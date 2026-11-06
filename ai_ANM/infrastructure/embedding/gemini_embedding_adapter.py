"""
Gemini Embedding Adapter

Implement EmbeddingPort bằng Gemini Embedding API.
"""

from __future__ import annotations

import asyncio
import time

from google import genai

from application.ports.embedding_port import EmbeddingPort

from config.settings import settings

from observability.logger import logger


class GeminiEmbeddingAdapter(EmbeddingPort):

    def __init__(self):

        self._client = genai.Client(
            api_key=settings.GEMINI_API_KEY,
        )

        self._model = settings.EMBEDDING_MODEL

    async def embed(
        self,
        *,
        text: str,
    ) -> list[float]:

        started_at = time.perf_counter()

        response = await asyncio.to_thread(

            self._client.models.embed_content,

            model=self._model,

            contents=text,

        )

        elapsed_ms = (time.perf_counter() - started_at) * 1000

        logger.info(
            f"[embedding] model={self._model} elapsed={elapsed_ms:.1f}ms "
            f"text={text[:120]!r}",
        )

        return response.embeddings[0].values

    async def embed_batch(
        self,
        *,
        texts: list[str],
    ) -> list[list[float]]:

        response = await asyncio.to_thread(

            self._client.models.embed_content,

            model=self._model,

            contents=texts,

        )

        return [

            embedding.values

            for embedding in response.embeddings

        ]