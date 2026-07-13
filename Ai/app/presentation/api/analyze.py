"""
Analyze API

POST /api/v1/analyze
"""

from __future__ import annotations

from fastapi import APIRouter
from fastapi import HTTPException
from fastapi.concurrency import run_in_threadpool

from app.presentation.api.schemas.analyze_request import AnalyzeRequest
from app.presentation.api.schemas.analyze_response import AnalyzeResponse

from app.usecases.analyzer.analyzer_service import AnalyzerService

from app.config.logger import logger


router = APIRouter(
    prefix="/analyze",
    tags=["Analyze"],
)

service = AnalyzerService()


SAFE_HEADERS = {
    "Server",
    "Content-Type",
    "Content-Encoding",
    "Strict-Transport-Security",
    "Content-Security-Policy",
    "Content-Security-Policy-Report-Only",
    "X-Frame-Options",
    "Permissions-Policy",
    "X-Content-Type-Options",
    "Referrer-Policy",
}


def filter_headers(headers: dict) -> dict:
    return {
        k: v
        for k, v in headers.items()
        if k in SAFE_HEADERS
    }


@router.post(
    "",
    response_model=AnalyzeResponse,
)
async def analyze(
    request: AnalyzeRequest,
):

    logger.info("=" * 80)
    logger.info("Analyze API")

    try:

        # service.analyze() là hàm blocking (HTTP/DNS/WHOIS/Gemini đều
        # đồng bộ) — chạy trong threadpool để KHÔNG chiếm event loop,
        # tránh đóng băng toàn bộ server khi nhiều request tới cùng lúc.
        result = await run_in_threadpool(
            service.analyze,
            str(request.url),
        )

        collector = result.get("collector")
        analysis = result["analysis"]

        checks = {}

        if collector is not None:

            checks["collector"] = {

                "url": collector.url,

                "hostname": collector.hostname,

                "domain": collector.domain,

                "final_url": collector.final_url,

                "status_code": collector.status_code,

                "content_type": collector.content_type,

                "title": collector.title,

                "ipv4": collector.ipv4,

                "ipv6": collector.ipv6,

                "redirect_chain": collector.redirect_chain,

                "response_headers": filter_headers(
                    collector.response_headers
                ),

            }

        #
        # Analysis Source
        #

        source = {
            "OSINT": "ChongLuaDao",
            "LLM": "AI Analysis",
            "Fallback": "Fallback",
        }.get(
            analysis.analysis_type,
            analysis.analysis_type,
        )

        logger.info(
            f"Status      : {analysis.status}"
        )

        logger.info(
            f"Risk Score  : {analysis.risk_score}"
        )

        logger.info(
            f"Confidence  : {analysis.confidence}"
        )

        return AnalyzeResponse(

            analysis_type=analysis.analysis_type,

            source=source,

            risk_score=analysis.risk_score,

            status=analysis.status,

            level=analysis.level,

            confidence=analysis.confidence,

            categories=analysis.categories,

            indicators=analysis.indicators,

            reason=analysis.reason,

            checks=checks,

        )

    except Exception as ex:

        logger.exception(ex)

        raise HTTPException(
            status_code=500,
            detail=str(ex),
        )