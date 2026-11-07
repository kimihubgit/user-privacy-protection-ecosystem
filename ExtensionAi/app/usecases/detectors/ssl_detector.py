"""
SSL Detector

Phân tích SSL/TLS Certificate.

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

class SSLDetector(BaseDetector):

    """
    SSL Detector
    """

    def detect(
        self,
        collector: CollectorResult
    ):

        group = self.create_group()

        ssl = getattr(

            collector,

            "ssl",

            None

        )

        if not ssl:

            return group

        #
        # Issuer
        #

        issuer = ssl.get(

            "issuer"

        )

        if issuer:

            group.add(

                Evidence(

                    detector=self.name,

                    type="ssl",

                    name="issuer",

                    value=str(issuer),

                    location="certificate"

                )

            )

        #
        # Subject
        #

        subject = ssl.get(

            "subject"

        )

        if subject:

            group.add(

                Evidence(

                    detector=self.name,

                    type="ssl",

                    name="subject",

                    value=str(subject),

                    location="certificate"

                )

            )

        #
        # Validation
        #

        validation = ssl.get(

            "validation"

        )

        if validation:

            group.add(

                Evidence(

                    detector=self.name,

                    type="ssl",

                    name="validation",

                    value=str(validation),

                    location="certificate"

                )

            )

        #
        # TLS Version
        #

        tls = ssl.get(

            "tls_version"

        )

        if tls:

            group.add(

                Evidence(

                    detector=self.name,

                    type="ssl",

                    name="tls_version",

                    value=str(tls),

                    location="tls"

                )

            )

        #
        # Signature Algorithm
        #

        signature = ssl.get(

            "signature_algorithm"

        )

        if signature:

            group.add(

                Evidence(

                    detector=self.name,

                    type="ssl",

                    name="signature_algorithm",

                    value=str(signature),

                    location="certificate"

                )

            )

        #
        # Key Algorithm
        #

        algorithm = ssl.get(

            "key_algorithm"

        )

        if algorithm:

            group.add(

                Evidence(

                    detector=self.name,

                    type="ssl",

                    name="key_algorithm",

                    value=str(algorithm),

                    location="certificate"

                )

            )

        #
        # Key Size
        #

        size = ssl.get(

            "key_size"

        )

        if size:

            group.add(

                Evidence(

                    detector=self.name,

                    type="ssl",

                    name="key_size",

                    value=str(size),

                    location="certificate"

                )

            )

        #
        # Wildcard
        #

        wildcard = ssl.get(

            "wildcard"

        )

        if wildcard is not None:

            group.add(

                Evidence(

                    detector=self.name,

                    type="ssl",

                    name="wildcard",

                    value=str(wildcard),

                    location="certificate"

                )

            )

        #
        # Status
        #

        status = ssl.get(

            "status"

        )

        if status:

            group.add(

                Evidence(

                    detector=self.name,

                    type="ssl",

                    name="status",

                    value=str(status),

                    location="certificate"

                )

            )

        #
        # Expire Date
        #

        expires = ssl.get(

            "expires_at"

        )

        if expires:

            group.add(

                Evidence(

                    detector=self.name,

                    type="ssl",

                    name="expires_at",

                    value=str(expires),

                    location="certificate"

                )

            )

        return group