"""
URL Detector

Phát hiện các đặc điểm của URL.

Detector chỉ tạo Observation.

Không được:
- kết luận phishing
- tính risk
- suy luận

Author: Anti Scam Detector
"""

from __future__ import annotations

from urllib.parse import urlparse

from data.free_hosting import FREE_HOSTING
from data.suspicious_extensions import URL_EXTENSIONS
from data.suspicious_paths import SUSPICIOUS_PATHS
from data.tlds import ALL_TLDS
from data.url_shorteners import URL_SHORTENERS

from app.usecases.detectors.base_detector import BaseDetector

from app.presentation.api.schemas.collector_result import CollectorResult
from app.presentation.api.schemas.evidence import Evidence

class URLDetector(BaseDetector):

    """
    URL Detector
    """

    def detect(
        self,
        collector: CollectorResult
    ):

        group = self.create_group()

        url = collector.final_url

        if not url:

            return group

        parsed = urlparse(url)

        host = parsed.hostname or ""

        path = parsed.path or ""

        #
        # Domain
        #

        group.add(

            Evidence(

                detector=self.name,

                type="url",

                name="hostname",

                value=host,

                location="hostname"

            )

        )

        #
        # TLD
        #

        for tld in ALL_TLDS:

            if host.endswith(tld):

                group.add(

                    Evidence(

                        detector=self.name,

                        type="tld",

                        name=tld,

                        value=tld,

                        location="hostname"

                    )

                )

                break

        #
        # URL Length
        #

        group.add(

            Evidence(

                detector=self.name,

                type="url",

                name="length",

                value=str(

                    len(url)

                ),

                location="url"

            )

        )

        #
        # Path
        #

        self._detect_path(

            group,

            path

        )

        #
        # Extension
        #

        self._detect_extension(

            group,

            path

        )

        #
        # Shortener
        #

        self._detect_shortener(

            group,

            host

        )

        #
        # Free Hosting
        #

        self._detect_hosting(

            group,

            host

        )

        return group

    #
    # URL Path
    #

    def _detect_path(

        self,

        group,

        path: str

    ):

        lower = path.lower()

        for category, item in SUSPICIOUS_PATHS.items():

            for value in item["paths"]:

                if value in lower:

                    group.add(

                        Evidence(

                            detector=self.name,

                            type="path",

                            name=category,

                            value=value,

                            location="path"

                        )

                    )

    #
    # Extension
    #

    def _detect_extension(

        self,

        group,

        path

    ):

        lower = path.lower()

        for category, item in URL_EXTENSIONS.items():

            for ext in item["extensions"]:

                if lower.endswith(ext):

                    group.add(

                        Evidence(

                            detector=self.name,

                            type="extension",

                            name=category,

                            value=ext,

                            location="path"

                        )

                    )

    #
    # Short URL
    #

    def _detect_shortener(

        self,

        group,

        host

    ):

        host = host.lower()

        for item in URL_SHORTENERS.values():

            for domain in item["domains"]:

                if host == domain:

                    group.add(

                        Evidence(

                            detector=self.name,

                            type="shortener",

                            name=item["provider"],

                            value=domain,

                            location="hostname"

                        )

                    )

    #
    # Free Hosting
    #

    def _detect_hosting(

        self,

        group,

        host

    ):

        host = host.lower()

        for item in FREE_HOSTING.values():

            for domain in item["domains"]:

                if host.endswith(domain):

                    group.add(

                        Evidence(

                            detector=self.name,

                            type="hosting",

                            name=item["provider"],

                            value=domain,

                            location="hostname"

                        )

                    )