"""
HTML Detector

Phân tích cấu trúc HTML.

Detector chỉ tạo Observation.

Không được:
- kết luận phishing
- tính risk
- suy luận

Author: Anti Scam Detector
"""

from __future__ import annotations

from bs4 import BeautifulSoup

from app.usecases.detectors.base_detector import BaseDetector

from app.presentation.api.schemas.collector_result import CollectorResult
from app.presentation.api.schemas.evidence import Evidence


class HTMLDetector(BaseDetector):

    """
    HTML Detector
    """

    def detect(
        self,
        collector: CollectorResult
    ):

        group = self.create_group()

        html = collector.html or ""

        if not html:

            return group

        soup = BeautifulSoup(

            html,

            "lxml"

        )

        #
        # Form
        #

        self._detect_forms(

            group,

            soup

        )

        #
        # Input
        #

        self._detect_inputs(

            group,

            soup

        )

        #
        # Button
        #

        self._detect_buttons(

            group,

            soup

        )

        #
        # Script
        #

        self._detect_scripts(

            group,

            soup

        )

        #
        # IFrame
        #

        self._detect_iframes(

            group,

            soup

        )

        #
        # Link
        #

        self._detect_links(

            group,

            soup

        )

        #
        # Image
        #

        self._detect_images(

            group,

            soup

        )

        return group

    #
    # Form
    #

    def _detect_forms(

        self,

        group,

        soup

    ):

        for form in soup.find_all("form"):

            group.add(

                Evidence(

                    detector=self.name,

                    type="form",

                    name="form",

                    value=form.get(

                        "action",

                        ""

                    ),

                    location="form",

                    metadata={

                        "method": form.get(

                            "method",

                            "GET"

                        )

                    }

                )

            )

    #
    # Input
    #

    def _detect_inputs(

        self,

        group,

        soup

    ):

        for node in soup.find_all("input"):

            group.add(

                Evidence(

                    detector=self.name,

                    type="input",

                    name=node.get(

                        "type",

                        "text"

                    ),

                    value=node.get(

                        "name",

                        ""

                    ),

                    location="input"

                )

            )

    #
    # Button
    #

    def _detect_buttons(

        self,

        group,

        soup

    ):

        for button in soup.find_all("button"):

            group.add(

                Evidence(

                    detector=self.name,

                    type="button",

                    name="button",

                    value=button.get_text(

                        " ",

                        strip=True

                    ),

                    location="button"

                )

            )

    #
    # Script
    #

    def _detect_scripts(

        self,

        group,

        soup

    ):

        for script in soup.find_all("script"):

            group.add(

                Evidence(

                    detector=self.name,

                    type="script",

                    name="script",

                    value=script.get(

                        "src",

                        ""

                    ),

                    location="script"

                )

            )

    #
    # IFrame
    #

    def _detect_iframes(

        self,

        group,

        soup

    ):

        for iframe in soup.find_all("iframe"):

            group.add(

                Evidence(

                    detector=self.name,

                    type="iframe",

                    name="iframe",

                    value=iframe.get(

                        "src",

                        ""

                    ),

                    location="iframe"

                )

            )

    #
    # Link
    #

    def _detect_links(

        self,

        group,

        soup

    ):

        for link in soup.find_all("a"):

            group.add(

                Evidence(

                    detector=self.name,

                    type="link",

                    name="link",

                    value=link.get(

                        "href",

                        ""

                    ),

                    location="a"

                )

            )

    #
    # Image
    #

    def _detect_images(

        self,

        group,

        soup

    ):

        for image in soup.find_all("img"):

            group.add(

                Evidence(

                    detector=self.name,

                    type="image",

                    name="image",

                    value=image.get(

                        "src",

                        ""

                    ),

                    location="img"

                )

            )