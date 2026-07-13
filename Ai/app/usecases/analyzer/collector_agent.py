"""
Collector Agent

Thu thập toàn bộ dữ liệu website.

Không đưa ra kết luận.

Không chấm điểm.
"""

from __future__ import annotations

from urllib.parse import urlparse

from app.infrastructure.collectors.html_collector import HTMLCollector
from app.infrastructure.collectors.dns_resolver import DNSResolver
from app.infrastructure.collectors.whois_collector import WhoisCollector
from app.infrastructure.collectors.network_collector import NetworkCollector

from app.domain.entities.collector import CollectorResult

from app.config.logger import logger


class CollectorAgent:

    def __init__(self):

        self.html = HTMLCollector()

        self.dns = DNSResolver()

        self.whois = WhoisCollector()

        self.network = NetworkCollector()

    def collect(self, url: str) -> dict:

        logger.info("=" * 80)
        logger.info("Collector Agent")

        #
        # HTML
        #

        html = self.html.collect(url)

        #
        # DNS
        #

        dns = self.dns.collect(url)

        #
        # Domain ưu tiên final_url
        #

        final_url = html["final_url"] or url

        parsed = urlparse(final_url)

        domain = parsed.hostname or dns["domain"]

        #
        # WHOIS
        #

        whois = self.whois.collect(domain)

        #
        # Network
        #

        network = {}

        if dns["ipv4"]:

            network = self.network.collect(dns["ipv4"][0])

        #
        # Collector Result
        #

        collector = CollectorResult(
            url=url,
            hostname=dns["hostname"],
            domain=domain,
            final_url=final_url,
            status_code=html["status_code"],
            content_type=html["content_type"],
            response_headers=html["response_headers"],
            redirect_chain=html["redirect_chain"],
            title=html["title"],
            html=html["html"],
            visible_text=html["visible_text"],
            ipv4=dns["ipv4"],
            ipv6=dns["ipv6"],
        )

        logger.info("Collector Agent Finished")
        logger.info(f"Title      : {collector.title}")
        logger.info(f"Domain     : {collector.domain}")
        logger.info(f"StatusCode : {collector.status_code}")

        logger.info("=" * 80)

        return {"collector": collector, "whois": whois, "network": network}
