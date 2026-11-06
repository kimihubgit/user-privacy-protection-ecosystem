"""
Analyze API

POST /api/v1/analyze
"""

from __future__ import annotations

import sys
import traceback
from datetime import datetime

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
        whois_data = result.get("whois") or (collector.whois if collector else None)

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

        if whois_data:
            def serialize_dt(d):
                if not d:
                    return None
                if isinstance(d, list):
                    d = d[0]
                return d.isoformat() if hasattr(d, "isoformat") else str(d)

            checks["whois"] = {
                "domain_name": whois_data.get("domain_name"),
                "created_date": serialize_dt(whois_data.get("created_date")),
                "updated_date": serialize_dt(whois_data.get("updated_date")),
                "expires_date": serialize_dt(whois_data.get("expires_date")),
                "domain_age_days": whois_data.get("domain_age_days"),
                "registrar": whois_data.get("registrar"),
                "registrar_url": whois_data.get("registrar_url"),
                "whois_server": whois_data.get("whois_server"),
                "nameservers": whois_data.get("nameservers", []),
                "status": whois_data.get("status", []),
                "registrant_organization": whois_data.get("registrant_organization"),
                "country": whois_data.get("country"),
                "abuse_email": whois_data.get("abuse_email"),
                "dnssec": whois_data.get("dnssec"),
                "raw_text": whois_data.get("raw_text", ""),
            }

        #
        # Analysis Source
        #

        source = {
            "OSINT": "Threat Intelligence",
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
        err_time = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        print(f"\n{'='*75}", file=sys.stderr)
        print(f"🚨 [AI PHISHING ANALYZE ERROR] - {err_time}", file=sys.stderr)
        print(f"🌐 URL kiểm tra         : {request.url}", file=sys.stderr)
        print(f"❌ Loại ngoại lệ (Type) : {type(ex).__name__}", file=sys.stderr)
        print(f"📋 Chi tiết lỗi (Msg)   : {ex}", file=sys.stderr)
        print("🔍 Stack Trace chi tiết:", file=sys.stderr)
        traceback.print_exc(file=sys.stderr)
        print(f"{'='*75}\n", file=sys.stderr)
        sys.stderr.flush()

        logger.exception(ex)

        raise HTTPException(
            status_code=500,
            detail=str(ex),
        )