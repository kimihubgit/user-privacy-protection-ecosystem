"""
Brand Detector

Phát hiện thương hiệu xuất hiện trên website.

Detector chỉ tạo Observation.

Không kết luận:
- giả mạo
- phishing
- scam

Author: Anti Scam Detector
"""

from __future__ import annotations

import re

from bs4 import BeautifulSoup

from data.brands import BRANDS
from app.usecases.detectors.base_detector import BaseDetector
from app.presentation.api.schemas.collector_result import CollectorResult
from app.presentation.api.schemas.evidence import Evidence

class BrandDetector(BaseDetector):

    """
    Detect brand observations.
    """

    def detect(
        self,
        collector: CollectorResult
    ):

        group = self.create_group()

        #
        # HTML
        #

        html = collector.html or ""

        soup = BeautifulSoup(

            html,

            "lxml"

        )

        #
        # Title
        #

        title = collector.title or ""

        self._detect_text(

            group,

            title,

            "title"

        )

        #
        # Meta Description
        #

        meta = soup.find(

            "meta",

            attrs={

                "name": re.compile(

                    "^description$",

                    re.I

                )

            }

        )

        if meta:

            content = meta.get(

                "content",

                ""

            )

            self._detect_text(

                group,

                content,

                "meta"

            )

        #
        # H1
        #

        for h1 in soup.find_all("h1"):

            self._detect_text(

                group,

                h1.get_text(

                    " ",

                    strip=True

                ),

                "h1"

            )

        #
        # Paragraph

        #

        for p in soup.find_all("p"):

            self._detect_text(

                group,

                p.get_text(

                    " ",

                    strip=True

                ),

                "paragraph"

            )

        #
        # Link

        #

        for a in soup.find_all("a"):

            self._detect_text(

                group,

                a.get_text(

                    " ",

                    strip=True

                ),

                "link"

            )

        return group

    #
    # Detect Brand
    #

    def _detect_text(

        self,

        group,

        text: str,

        location: str

    ):

        if not text:

            return

        lower = text.lower()

        for brand in BRANDS.values():

            #
            # Official Name
            #

            names = [

                brand["display_name"]

            ]

            #
            # Aliases
            #

            names.extend(

                brand.get(

                    "aliases",

                    []

                )

            )

            #
            # Weak Alias
            #

            names.extend(

                brand.get(

                    "weak_aliases",

                    []

                )

            )

            for name in names:

                keyword = name.lower()

                if keyword not in lower:

                    continue

                evidence = Evidence(

                    detector=self.name,

                    type="brand",

                    name=brand["display_name"],

                    value=name,

                    location=location,

                    context=text,

                    metadata={

                        "official_domains": brand.get(

                            "official_domains",

                            []

                        )

                    }

                )

                group.add(

                    evidence

                )