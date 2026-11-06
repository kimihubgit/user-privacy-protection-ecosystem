"""
Threat Intelligence Provider (Thay thế ChongLuaDao Provider)

Giải pháp nhận diện mối đe dọa đa tầng (Multi-tier Threat Intelligence) tốc độ cao,
thay thế API bên thứ 3 ChongLuaDao đã bị khóa captcha (400 Client Error):
1. Tier 1: Local In-Memory Trusted Allowlist (< 0.1ms) - Xác thực tức thời các cổng dịch vụ công, ngân hàng, báo chí, nền tảng lớn.
2. Tier 2: Local Backend API Database Check (< 5ms) - Tra cứu cơ sở dữ liệu MongoDB/Cuckoo filter nếu service check đang chạy.
3. Tier 3: Cloudflare Security 1.1.1.2 DoH (~50ms) - Kiểm tra trực tiếp cơ sở dữ liệu đe dọa toàn cầu của Cloudflare.
4. Tier 4: Heuristics phát hiện tấn công giả mạo Homograph/Punycode (xn--).
"""

from __future__ import annotations

from typing import Any
from urllib.parse import urlparse
import requests

from app.infrastructure.osint.providers.base_provider import BaseProvider
from app.config.logger import logger


class ChongLuaDaoProvider(BaseProvider):
    """
    Threat Intelligence Provider (giữ tên ChongLuaDaoProvider để tương thích 100% với toàn bộ pipeline).
    """

    TRUSTED_DOMAINS = {
        # Search & Tech Giants
        "google.com", "google.com.vn", "facebook.com", "fb.com", "youtube.com",
        "microsoft.com", "apple.com", "github.com", "wikipedia.org", "amazon.com",
        "twitter.com", "x.com", "linkedin.com", "instagram.com", "openai.com",
        # Vietnam Government & Public Services
        "gov.vn", "chinhphu.vn", "dichvucong.gov.vn", "moit.gov.vn", "mic.gov.vn",
        "bocongan.gov.vn", "baochinhphu.vn", "vtv.vn", "vov.vn",
        # Top News & Media
        "vnexpress.net", "tuoitre.vn", "thanhnien.vn", "dantri.com.vn", "vietnamnet.vn",
        "laodong.vn", "tienphong.vn", "zingnews.vn", "znews.vn", "kenh14.vn",
        # Vietnam Banking & Fintech
        "vietcombank.com.vn", "bidv.com.vn", "techcombank.com", "mbbank.com.vn",
        "agribank.com.vn", "acb.com.vn", "vpbank.com.vn", "tpbank.com.vn",
        "vib.com.vn", "sacombank.com.vn", "shb.com.vn", "momo.vn", "zalo.me",
        # E-commerce & Logistics
        "shopee.vn", "tiki.vn", "lazada.vn", "sendo.vn", "viettelpost.vn", "vnpost.vn"
    }

    LOCAL_CHECK_URL = "http://localhost:8080/api/v1/urls/check"
    CLOUDFLARE_DOH_URL = "https://security.cloudflare-dns.com/dns-query"
    HTTP_TIMEOUT = 1.5

    @staticmethod
    def _extract_domain(url: str) -> str:
        url = url.strip()
        if not url.startswith(("http://", "https://")):
            url = "https://" + url
        parsed = urlparse(url)
        domain = (parsed.hostname or url).lower()
        if domain.startswith("www."):
            domain = domain[4:]
        return domain

    def check(
        self,
        url: str
    ) -> dict[str, Any]:
        domain = self._extract_domain(url)
        logger.info(f"Threat Intelligence lookup : {domain}")

        # ----------------------------------------------------
        # 1. Tier 1: Local Trusted Allowlist (< 0.1ms)
        # ----------------------------------------------------
        if domain in self.TRUSTED_DOMAINS or any(domain.endswith("." + d) for d in self.TRUSTED_DOMAINS if "." in d):
            logger.info(f"Threat Intel [Allowlist] Hit: {domain} là tên miền uy tín")
            return {
                "result": "safe",
                "source": "LocalAllowlist",
                "raw": {
                    "reason": f"Tên miền {domain} thuộc danh sách tín nhiệm chính thống đã xác minh.",
                    "status": "safe"
                }
            }

        # ----------------------------------------------------
        # 2. Tier 2: Local Database Query (Backend Check - < 5ms)
        # ----------------------------------------------------
        try:
            resp = requests.get(
                self.LOCAL_CHECK_URL,
                params={"url": domain},
                timeout=0.4
            )
            if resp.status_code == 200:
                data = resp.json()
                st = data.get("status")
                if st == "unsafe":
                    logger.warning(f"Threat Intel [Local DB] Phát hiện độc hại: {domain}")
                    return {
                        "result": "malicious",
                        "source": "LocalDatabase",
                        "raw": {
                            "reason": "Cơ sở dữ liệu phòng chống lừa đảo phát hiện tên miền độc hại.",
                            "status": "malicious"
                        }
                    }
                elif st == "safe":
                    logger.info(f"Threat Intel [Local DB] Xác nhận an toàn: {domain}")
                    return {
                        "result": "safe",
                        "source": "LocalDatabase",
                        "raw": {
                            "reason": "Tên miền đã được phê duyệt an toàn trong cơ sở dữ liệu.",
                            "status": "safe"
                        }
                    }
        except Exception:
            pass  # Nếu Backend Check chưa bật thì tự động chuyển sang Tier 3

        # ----------------------------------------------------
        # 3. Tier 3: Cloudflare Security 1.1.1.2 DoH (~50ms)
        # ----------------------------------------------------
        try:
            cf_resp = requests.get(
                self.CLOUDFLARE_DOH_URL,
                params={"name": domain, "type": "A"},
                headers={"accept": "application/dns-json"},
                timeout=self.HTTP_TIMEOUT
            )
            if cf_resp.status_code == 200:
                dns_data = cf_resp.json()
                is_malicious = False

                for ans in dns_data.get("Answer", []):
                    if ans.get("data") == "0.0.0.0":
                        is_malicious = True
                        break

                for comm in dns_data.get("Comment", []):
                    if "Censored" in comm or "Blocked" in comm:
                        is_malicious = True
                        break

                if is_malicious:
                    logger.warning(f"Threat Intel [Cloudflare] Phát hiện độc hại: {domain}")
                    return {
                        "result": "malicious",
                        "source": "CloudflareSecurity",
                        "raw": {
                            "reason": "Mạng lưới Cloudflare Threat Intelligence cảnh báo tên miền độc hại / lừa đảo.",
                            "status": "malicious"
                        }
                    }
        except Exception as ex:
            logger.debug(f"Cloudflare DoH check error: {ex}")

        # ----------------------------------------------------
        # 4. Tier 4: Heuristics (Punycode / Homograph Attack)
        # ----------------------------------------------------
        if "xn--" in domain:
            logger.warning(f"Threat Intel [Heuristics] Phát hiện Punycode: {domain}")
            return {
                "result": "malicious",
                "source": "Heuristics",
                "raw": {
                    "reason": "Phát hiện ký tự Punycode ẩn danh (dấu hiệu giả mạo tên miền quốc tế Homograph).",
                    "status": "malicious"
                }
            }

        # Không phát hiện cảnh báo trước -> Trả về no result để AI phân tích sâu
        logger.info(f"Threat Intel: Không có trong danh sách đen/trắng, chuyển AI phân tích ({domain})")
        return {
            "result": "no result",
            "source": "ThreatIntel",
            "raw": {}
        }

    def lookup(self, url: str) -> dict[str, Any]:
        """
        Hỗ trợ giao diện tra cứu đồng bộ cho rule checkers.
        """
        check_result = self.check(url)
        return {
            "success": True,
            "data": {
                "result": check_result.get("result", "no result"),
                "status": 1 if check_result.get("result") == "malicious" else 0,
                "details": check_result.get("raw", {}).get("reason", ""),
                "source": check_result.get("source", "ThreatIntel")
            }
        }
