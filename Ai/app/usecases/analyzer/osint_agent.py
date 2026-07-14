"""
OSINT Agent

Tra cứu OSINT.

Pipeline

URL
 │
 ▼
Normalize URL
 │
 ▼
ChongLuaDao Provider
 │
 ▼
safe / malicious / no result

Không chứa logic AI.

Không chứa Collector.

Không chấm điểm.
"""

from __future__ import annotations

from urllib.parse import urlparse

from app.infrastructure.osint.providers.chongluadao_provider import ChongLuaDaoProvider

from app.config.logger import logger


class OSINTAgent:

    def __init__(self):

        self.chongluadao = ChongLuaDaoProvider()

    @staticmethod
    def normalize_url(
        url: str
    ) -> str:
        """
        Chuẩn hóa URL.

        https://abc.com/
            ↓
        https://abc.com
        """

        url = url.strip()

        if not url.startswith(("http://", "https://")):
            url = "https://" + url

        parsed = urlparse(url)

        scheme = parsed.scheme.lower()

        hostname = parsed.netloc.lower()

        path = parsed.path.rstrip("/")

        if path:

            return f"{scheme}://{hostname}{path}"

        return f"{scheme}://{hostname}"

    def check(
        self,
        url: str
    ) -> dict:

        logger.info("=" * 80)

        logger.info("OSINT Agent")

        normalized_url = self.normalize_url(
            url
        )

        logger.info(
            f"Normalized URL : {normalized_url}"
        )

        result = self.chongluadao.check(
            normalized_url
        )

        status = str(
            result.get(
                "result",
                "no result"
            )
        ).lower()

        if status not in {

            "safe",

            "malicious",

            "no result"

        }:

            status = "no result"

        logger.info(
            f"OSINT Result : {status}"
        )

        logger.info("=" * 80)

        return {

            "source": "ChongLuaDao",

            "result": status,

            "detail": result

        }