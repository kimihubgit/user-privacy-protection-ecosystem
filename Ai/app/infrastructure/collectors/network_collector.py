"""
Network Collector
"""

from __future__ import annotations

import requests

from app.config.logger import logger


class NetworkCollector:

    API = "https://ipinfo.io/{ip}/json"

    TIMEOUT = 10

    def collect(self, ip: str) -> dict:

        logger.info(f"Network : {ip}")

        try:

            response = requests.get(self.API.format(ip=ip), timeout=self.TIMEOUT)

            response.raise_for_status()

            data = response.json()

            org = data.get("org", "")

            asn = None

            organization = None

            if org:

                parts = org.split(" ", 1)

                asn = parts[0]

                if len(parts) > 1:

                    organization = parts[1]

            return {
                "asn": asn,
                "organization": organization,
                "country": data.get("country"),
                "city": data.get("city"),
                "region": data.get("region"),
            }

        except Exception as ex:

            logger.warning(ex)

            return {
                "asn": None,
                "organization": None,
                "country": None,
                "city": None,
                "region": None,
            }
