from __future__ import annotations

import asyncio

from tavily import TavilyClient

from application.ports.web_search_port import WebSearchPort
from config.settings import settings
from domain.entities.retrieved_document import RetrievedDocument


class TavilyAdapter(WebSearchPort):

    def __init__(self):
        self._client = TavilyClient(
            api_key=settings.TAVILY_API_KEY,
        )

    async def search(
        self,
        *,
        query: str,
    ) -> list[RetrievedDocument]:
        
        # Chạy request đồng bộ của Tavily trong thread riêng để không block event loop
        response = await asyncio.to_thread(
            self._client.search,
            query=query,
            search_depth="advanced",
            max_results=5,
            include_answer=True,
            include_raw_content=False,
        )

        results = response.get("results", [])

        documents: list[RetrievedDocument] = []

        for item in results:
            documents.append(
                RetrievedDocument(
                    id=item.get("url", ""),
                    source=item.get("title", "Tavily"),
                    content=item.get("content", ""),
                    score=float(item.get("score", 0.0)),
                    metadata={
                        "url": item.get("url"),
                        "title": item.get("title"),
                        "page": None,
                        "category": "web",
                        "provider": "tavily",
                    },
                )
            )

        return documents