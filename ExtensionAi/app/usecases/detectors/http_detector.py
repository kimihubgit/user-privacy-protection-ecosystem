"""
HTTP Detector

Phân tích HTTP Response Header.

Detector chỉ tạo Observation.

Không được:
- tính Risk
- kết luận Scam
- kết luận Phishing

Author: Anti Scam Detector
"""

from __future__ import annotations

from data.http_headers import HTTP_HEADERS

from app.usecases.detectors.base_detector import BaseDetector

from app.presentation.api.schemas.collector_result import CollectorResult
from app.presentation.api.schemas.evidence import Evidence


class HTTPDetector(BaseDetector):

    """
    HTTP Detector
    """

    def detect(
        self,
        collector: CollectorResult
    ):

        group = self.create_group()

        headers = collector.response_headers or {}

        if not headers:

            return group

        #
        # Normalize
        #

        normalized = {

            k.lower(): str(v)

            for k, v in headers.items()

        }

        #
        # Detect Known Headers
        #

        for category, item in HTTP_HEADERS.items():

            for header in item["headers"]:

                value = normalized.get(

                    header.lower()

                )

                if value is None:

                    continue

                group.add(

                    Evidence(

                        detector=self.name,

                        type="http_header",

                        name=header,

                        value=value,

                        location="response_header",

                        metadata={

                            "category": category,

                            "description": item["description"]

                        }

                    )

                )

        return group