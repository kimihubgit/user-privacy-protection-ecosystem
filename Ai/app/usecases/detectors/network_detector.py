"""
Network Detector

Phân tích thông tin Network.

Detector chỉ tạo Observation.

Không được:
- tính Risk
- kết luận Scam
- kết luận Phishing

Author: Anti Scam Detector
"""

from __future__ import annotations

from app.usecases.detectors.base_detector import BaseDetector

from app.presentation.api.schemas.collector_result import CollectorResult
from app.presentation.api.schemas.evidence import Evidence

class NetworkDetector(BaseDetector):

    """
    Network Detector
    """

    def detect(
        self,
        collector: CollectorResult
    ):

        group = self.create_group()

        #
        # WHOIS
        #

        whois = getattr(

            collector,

            "whois",

            {}

        )

        #
        # Network
        #

        network = getattr(

            collector,

            "network",

            {}

        )

        #
        # Registrar
        #

        registrar = whois.get(

            "registrar"

        )

        if registrar:

            group.add(

                Evidence(

                    detector=self.name,

                    type="registrar",

                    name="registrar",

                    value=str(registrar),

                    location="whois"

                )

            )

        #
        # Domain Age
        #

        age = whois.get(

            "domain_age_days"

        )

        if age is not None:

            group.add(

                Evidence(

                    detector=self.name,

                    type="domain",

                    name="age_days",

                    value=str(age),

                    location="whois"

                )

            )

        #
        # Created Date
        #

        created = whois.get(

            "creation_date"

        )

        if created:

            group.add(

                Evidence(

                    detector=self.name,

                    type="domain",

                    name="creation_date",

                    value=str(created),

                    location="whois"

                )

            )

        #
        # Expire Date
        #

        expire = whois.get(

            "expiration_date"

        )

        if expire:

            group.add(

                Evidence(

                    detector=self.name,

                    type="domain",

                    name="expiration_date",

                    value=str(expire),

                    location="whois"

                )

            )

        #
        # Country
        #

        country = network.get(

            "country"

        )

        if country:

            group.add(

                Evidence(

                    detector=self.name,

                    type="network",

                    name="country",

                    value=str(country),

                    location="network"

                )

            )

        #
        # ASN
        #

        asn = network.get(

            "asn"

        )

        if asn:

            group.add(

                Evidence(

                    detector=self.name,

                    type="network",

                    name="asn",

                    value=str(asn),

                    location="network"

                )

            )

        #
        # Organization
        #

        organization = network.get(

            "organization"

        )

        if organization:

            group.add(

                Evidence(

                    detector=self.name,

                    type="network",

                    name="organization",

                    value=str(organization),

                    location="network"

                )

            )

        #
        # ISP
        #

        isp = network.get(

            "isp"

        )

        if isp:

            group.add(

                Evidence(

                    detector=self.name,

                    type="network",

                    name="isp",

                    value=str(isp),

                    location="network"

                )

            )

        #
        # Hosting Provider
        #

        hosting = network.get(

            "hosting_provider"

        )

        if hosting:

            group.add(

                Evidence(

                    detector=self.name,

                    type="hosting",

                    name="provider",

                    value=str(hosting),

                    location="network"

                )

            )

        #
        # Cloud Provider
        #

        cloud = network.get(

            "cloud_provider"

        )

        if cloud:

            group.add(

                Evidence(

                    detector=self.name,

                    type="cloud",

                    name="provider",

                    value=str(cloud),

                    location="network"

                )

            )

        return group