"""
Keyword Detector

Phát hiện từ khóa xuất hiện trên website.

Detector chỉ tạo Observation.

Không được:
- tính Risk
- kết luận Scam
- kết luận Phishing

Author: Anti Scam Detector
"""

from __future__ import annotations

import re

from bs4 import BeautifulSoup

from data.keywords import KEYWORDS

from app.usecases.detectors.base_detector import BaseDetector

from app.presentation.api.schemas.collector_result import CollectorResult
from app.presentation.api.schemas.evidence import Evidence


class KeywordDetector(BaseDetector):

    """
    Keyword Detector
    """

    def detect(
        self,
        collector: CollectorResult
    ):

        group = self.create_group()

        html = collector.html or ""

        soup = BeautifulSoup(

            html,

            "lxml"

        )

        #
        # Title
        #

        self._detect_text(

            group,

            collector.title or "",

            "title"

        )

        #
        # Meta Description
        #

        for meta in soup.find_all("meta"):

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
        # Heading
        #

        for tag in [

            "h1",

            "h2",

            "h3",

            "h4",

            "h5",

            "h6"

        ]:

            for node in soup.find_all(tag):

                self._detect_text(

                    group,

                    node.get_text(

                        " ",

                        strip=True

                    ),

                    tag

                )

        #
        # Paragraph
        #

        for node in soup.find_all("p"):

            self._detect_text(

                group,

                node.get_text(

                    " ",

                    strip=True

                ),

                "paragraph"

            )

        #
        # Link
        #

        for node in soup.find_all("a"):

            self._detect_text(

                group,

                node.get_text(

                    " ",

                    strip=True

                ),

                "link"

            )

        #
        # Button
        #

        for node in soup.find_all("button"):

            self._detect_text(

                group,

                node.get_text(

                    " ",

                    strip=True

                ),

                "button"

            )

        return group

    #
    # Detect
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

        for category, database in KEYWORDS.items():

            for key, item in database.items():

                for keyword in item["keywords"]:

                    pattern = r"\b{}\b".format(

                        re.escape(

                            keyword.lower()

                        )

                    )

                    if not re.search(

                        pattern,

                        lower

                    ):

                        continue

                    evidence = Evidence(

                        detector=self.name,

                        type="keyword",

                        name=key,

                        value=keyword,

                        location=location,

                        context=text,

                        metadata={

                            "category": category,

                            "description": item.get(

                                "description",

                                ""

                            )

                        }

                    )

                    group.add(

                        evidence

                    )