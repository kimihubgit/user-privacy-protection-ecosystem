"""
DNS Resolver

Chức năng
---------
- Resolve IPv4 (A)
- Resolve IPv6 (AAAA)
- Reverse DNS
- Extract Hostname
- Extract Domain
"""

from __future__ import annotations

import socket
from typing import Dict, List
from urllib.parse import urlparse

import dns.resolver
import tldextract

from app.config.logger import logger


class DNSResolver:

    DNS_TIMEOUT = 5

    def __init__(self) -> None:
        self.resolver = dns.resolver.Resolver()
        self.resolver.timeout = self.DNS_TIMEOUT
        self.resolver.lifetime = self.DNS_TIMEOUT

    @staticmethod
    def extract_hostname(
        url: str
    ) -> str:
        """
        URL

        ↓

        Hostname
        """
        parsed = urlparse(url)
        return parsed.hostname or ""

    @staticmethod
    def extract_domain(
        hostname: str
    ) -> str:
        """
        login.google.com

        ↓

        google.com
        """
        extracted = tldextract.extract(
            hostname
        )

        if not extracted.domain:
            return ""

        return (
            f"{extracted.domain}.{extracted.suffix}"
        )

    def resolve_ipv4(
        self,
        hostname: str
    ) -> List[str]:
        ipv4 = []

        try:
            answers = self.resolver.resolve(
                hostname,
                "A"
            )

            for answer in answers:
                ip = answer.to_text()
                if ip not in ipv4:
                    ipv4.append(ip)

        except Exception as ex:
            logger.warning(
                f"IPv4 Resolve Failed : {hostname} : {ex}"
            )

        return ipv4

    def resolve_ipv6(
        self,
        hostname: str
    ) -> List[str]:
        ipv6 = []

        try:
            answers = self.resolver.resolve(
                hostname,
                "AAAA"
            )

            for answer in answers:
                ip = answer.to_text()
                if ip not in ipv6:
                    ipv6.append(ip)

        except Exception as ex:
            logger.warning(
                f"IPv6 Resolve Failed : {hostname} : {ex}"
            )

        return ipv6

    @staticmethod
    def reverse_lookup(
        ip: str
    ) -> str:
        """
        Reverse DNS
        """
        try:
            host, _, _ = socket.gethostbyaddr(ip)
            return host
        except Exception:
            return ""

    def collect(
        self,
        url: str
    ) -> Dict:
        logger.info(
            f"Resolve DNS : {url}"
        )

        hostname = self.extract_hostname(
            url
        )

        domain = self.extract_domain(
            hostname
        )

        ipv4 = self.resolve_ipv4(
            hostname
        )

        ipv6 = self.resolve_ipv6(
            hostname
        )

        reverse_dns = []

        for ip in ipv4:
            host = self.reverse_lookup(
                ip
            )
            if host:
                reverse_dns.append(
                    host
                )

        result = {
            "hostname": hostname,
            "domain": domain,
            "ipv4": ipv4,
            "ipv6": ipv6,
            "reverse_dns": reverse_dns
        }

        logger.info(
            f"Hostname : {hostname}"
        )

        logger.info(
            f"Domain : {domain}"
        )

        logger.info(
            f"IPv4 : {len(ipv4)}"
        )

        logger.info(
            f"IPv6 : {len(ipv6)}"
        )

        logger.info(
            "DNS Resolver Finished"
        )

        return result