"""
Collector Agent

Thu thập toàn bộ dữ liệu website.

Không đưa ra kết luận.

Không chấm điểm.
"""

from __future__ import annotations

from concurrent.futures import ThreadPoolExecutor
from urllib.parse import urlparse

from app.infrastructure.collectors.html_collector import HTMLCollector
from app.infrastructure.collectors.dns_resolver import DNSResolver
from app.infrastructure.collectors.whois_collector import WhoisCollector
from app.infrastructure.collectors.network_collector import NetworkCollector

from app.presentation.api.schemas.collector_result import CollectorResult

from app.config.logger import logger


class CollectorAgent:

    def __init__(self):

        self.html = HTMLCollector()

        self.dns = DNSResolver()

        self.whois = WhoisCollector()

        self.network = NetworkCollector()

        # 4 lệnh gọi mạng blocking (HTML/DNS/WHOIS/Network) trước đây
        # chạy tuần tự -> tổng latency = tổng cả 4. HTML và DNS độc
        # lập với nhau nên chạy song song ở Stage 1; WHOIS (cần domain
        # từ cả HTML+DNS) và Network (chỉ cần IP từ DNS) chạy song
        # song ở Stage 2.
        self.executor = ThreadPoolExecutor(
            max_workers=2,
            thread_name_prefix="collector",
        )

    def collect(
        self,
        url: str
    ) -> dict:

        logger.info("=" * 80)
        logger.info("Collector Agent")

        #
        # Stage 1: HTML + DNS (độc lập nhau) -> chạy song song
        #

        html_future = self.executor.submit(
            self.html.collect,
            url,
        )

        dns_future = self.executor.submit(
            self.dns.collect,
            url,
        )

        html = html_future.result()
        dns = dns_future.result()

        #
        # Domain ưu tiên final_url
        #

        final_url = html["final_url"] or url

        parsed = urlparse(final_url)

        domain = parsed.hostname or dns["domain"]

        #
        # Stage 2: WHOIS (cần domain) + Network (cần IP từ DNS)
        # -> độc lập nhau, chạy song song
        #

        whois_future = self.executor.submit(
            self.whois.collect,
            domain,
        )

        network_future = None

        if dns["ipv4"]:

            network_future = self.executor.submit(
                self.network.collect,
                dns["ipv4"][0],
            )

        whois = whois_future.result()

        network = (
            network_future.result()
            if network_future is not None
            else {}
        )

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

            whois=whois,

            network=network

        )

        logger.info("Collector Agent Finished")
        logger.info(f"Title      : {collector.title}")
        logger.info(f"Domain     : {collector.domain}")
        logger.info(f"StatusCode : {collector.status_code}")

        logger.info("=" * 80)

        return {

            "collector": collector,

            "whois": whois,

            "network": network

        }