"""
Collector Result Schema
"""

from __future__ import annotations

from typing import Dict, List

from pydantic import BaseModel, Field


class CollectorResult(BaseModel):
    """
    Dữ liệu thu thập từ website.

    Không chứa kết quả phân tích.
    """

    #
    # URL
    #

    url: str

    hostname: str

    domain: str

    final_url: str

    #
    # HTTP
    #

    status_code: int = 0

    content_type: str = ""

    response_headers: Dict[str, str] = Field(default_factory=dict)

    redirect_chain: List[dict] = Field(default_factory=list)

    #
    # HTML
    #

    title: str = ""

    html: str = ""

    visible_text: str = ""

    #
    # Network
    #

    ipv4: List[str] = Field(default_factory=list)

    ipv6: List[str] = Field(default_factory=list)
