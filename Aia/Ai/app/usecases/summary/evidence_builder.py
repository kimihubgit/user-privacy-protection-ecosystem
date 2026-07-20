"""
Evidence Builder

Điều phối toàn bộ Detector.

Không chứa:
- Rule
- Risk
- AI
- Prompt

Author: Anti Scam Detector
"""

from __future__ import annotations

from app.usecases.detectors.brand_detector import BrandDetector
from app.usecases.detectors.keyword_detector import KeywordDetector
from app.usecases.detectors.url_detector import URLDetector
from app.usecases.detectors.html_detector import HTMLDetector
from app.usecases.detectors.http_detector import HTTPDetector
from app.usecases.detectors.ssl_detector import SSLDetector
from app.usecases.detectors.network_detector import NetworkDetector

from app.presentation.api.schemas.collector_result import CollectorResult
from app.presentation.api.schemas.evidence_result import EvidenceResult

class EvidenceBuilder:

    """
    Build Evidence Result.
    """

    def __init__(self):

        self.detectors = [

            BrandDetector(),

            KeywordDetector(),

            URLDetector(),

            HTMLDetector(),

            HTTPDetector(),

            SSLDetector(),

            NetworkDetector()

        ]

    def build(

        self,

        collector: CollectorResult

    ) -> EvidenceResult:

        result = EvidenceResult()

        for detector in self.detectors:

            group = detector.detect(

                collector

            )

            if group.empty:

                continue

            result.add_group(

                group

            )

        return result