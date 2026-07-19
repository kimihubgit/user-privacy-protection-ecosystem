"""
Gemini Embedding Adapter

Implement EmbeddingPort bằng Gemini Embedding API.
"""

from __future__ import annotations

import asyncio

from google import genai

from application.ports.embedding_port import EmbeddingPort

from config.settings import settings


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

        response = await asyncio.to_thread(

            self._client.models.embed_content,

            model=self._model,

            contents=text,

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