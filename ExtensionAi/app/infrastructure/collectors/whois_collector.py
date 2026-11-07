"""
WHOIS Collector

Thu thập dữ liệu tên miền đa nguồn (RDAP chuẩn quốc tế RFC 7482 kết hợp WHOIS socket).
Cung cấp đầy đủ thông tin: Ngày tạo, ngày hết hạn, nhà đăng ký, đơn vị sở hữu,
hệ thống máy chủ phân giải (Nameservers), trạng thái tên miền và dữ liệu thô (Raw WHOIS).
"""

from __future__ import annotations

import socket
from datetime import datetime, timezone
from urllib.parse import urlparse
import requests

try:
    import whois
except ImportError:
    whois = None

from app.config.logger import logger


class WhoisCollector:

    RDAP_TIMEOUT = 3.5
    WHOIS_TIMEOUT = 3.0

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

    def _collect_via_socket(self, domain: str) -> dict | None:
        """
        Tra cứu chi tiết qua socket WHOIS (Port 43) bằng python-whois.
        """
        if whois is None:
            return None

        previous_timeout = socket.getdefaulttimeout()
        try:
            socket.setdefaulttimeout(self.WHOIS_TIMEOUT)
            w = whois.whois(domain)
            if not w or not getattr(w, "domain_name", None):
                return None

            def clean_dt(d):
                if isinstance(d, list):
                    d = d[0]
                return d

            def clean_str(s):
                if isinstance(s, list):
                    return ", ".join(str(x) for x in s)
                return str(s) if s else None

            created = clean_dt(w.get("creation_date"))
            expires = clean_dt(w.get("expiration_date"))
            updated = clean_dt(w.get("updated_date"))

            age = None
            if created:
                if getattr(created, "tzinfo", None) is None:
                    age = (datetime.now() - created).days
                else:
                    age = (datetime.now(timezone.utc) - created).days

            ns = w.get("name_servers")
            if not isinstance(ns, list):
                ns = [ns] if ns else []

            st = w.get("status")
            if not isinstance(st, list):
                st = [st] if st else []

            return {
                "domain_name": domain,
                "created_date": created,
                "updated_date": updated,
                "expires_date": expires,
                "domain_age_days": age,
                "registrar": clean_str(w.get("registrar")),
                "registrar_url": clean_str(w.get("registrar_url")),
                "whois_server": clean_str(w.get("whois_server")),
                "nameservers": [str(x) for x in ns if x],
                "status": [str(x) for x in st if x],
                "registrant_organization": clean_str(w.get("org") or w.get("registrant_name") or w.get("name")),
                "country": clean_str(w.get("country")),
                "abuse_email": clean_str(w.get("emails")),
                "dnssec": clean_str(w.get("dnssec")),
                "raw_text": getattr(w, "text", "") or ""
            }
        except Exception as ex:
            logger.debug(f"Socket WHOIS lookup failed for {domain}: {ex}")
            return None
        finally:
            socket.setdefaulttimeout(previous_timeout)

    def _collect_via_rdap(self, domain: str) -> dict | None:
        """
        Tra cứu tên miền qua giao thức chuẩn RDAP (REST over HTTPS).
        """
        rdap_url = f"https://rdap.org/domain/{domain}"
        try:
            resp = requests.get(
                rdap_url,
                timeout=self.RDAP_TIMEOUT,
                headers={"Accept": "application/json", "User-Agent": "Antigravity-Security/1.0"}
            )
            if resp.status_code != 200:
                return None

            data = resp.json()
            events = {e.get("eventAction"): e.get("eventDate") for e in data.get("events", [])}

            def parse_dt(s: str | None) -> datetime | None:
                if not s:
                    return None
                try:
                    s = s.replace("Z", "+00:00")
                    return datetime.fromisoformat(s)
                except Exception:
                    return None

            created = parse_dt(events.get("registration"))
            expires = parse_dt(events.get("expiration"))
            updated = parse_dt(events.get("last changed") or events.get("last update of RDAP database"))

            registrar = None
            registrant_org = None
            country = None
            abuse_email = None

            for ent in data.get("entities", []):
                roles = ent.get("roles", [])
                vcard = ent.get("vcardArray")

                if "registrar" in roles and not registrar:
                    if vcard and len(vcard) > 1:
                        for item in vcard[1]:
                            if len(item) > 3 and item[0] == "fn":
                                registrar = item[3]
                    if not registrar:
                        registrar = ent.get("handle")

                if ("registrant" in roles or "technical" in roles) and not registrant_org:
                    if vcard and len(vcard) > 1:
                        for item in vcard[1]:
                            if len(item) > 3 and item[0] in ("fn", "org"):
                                registrant_org = item[3]

                if not country and vcard and len(vcard) > 1:
                    for item in vcard[1]:
                        if len(item) > 3 and item[0] == "adr" and isinstance(item[3], list):
                            country = item[3][-1] if item[3][-1] else None

                if not abuse_email and vcard and len(vcard) > 1:
                    for item in vcard[1]:
                        if len(item) > 3 and item[0] == "email":
                            abuse_email = item[3]

            age = None
            if created:
                now = datetime.now(timezone.utc)
                age = (now - created).days

            nameservers = [ns.get("ldhName") for ns in data.get("nameservers", []) if ns.get("ldhName")]
            status = data.get("status", [])

            # Tạo bản text thô nếu không có socket raw
            raw_lines = [
                f"Domain Name: {domain.upper()}",
                f"Registry Domain ID: {data.get('handle', 'N/A')}",
                f"Registrar: {registrar or 'N/A'}",
                f"Creation Date: {created.isoformat() if created else 'N/A'}",
                f"Registry Expiry Date: {expires.isoformat() if expires else 'N/A'}",
                f"Updated Date: {updated.isoformat() if updated else 'N/A'}",
                f"Registrant Organization: {registrant_org or 'REDACTED FOR PRIVACY'}",
                f"Registrant Country: {country or 'N/A'}",
                f"Name Server: {', '.join(nameservers) if nameservers else 'N/A'}",
                f"Domain Status: {', '.join(status) if status else 'active'}"
            ]

            return {
                "domain_name": domain,
                "created_date": created,
                "updated_date": updated,
                "expires_date": expires,
                "domain_age_days": age,
                "registrar": registrar,
                "registrar_url": None,
                "whois_server": None,
                "nameservers": nameservers,
                "status": status,
                "registrant_organization": registrant_org,
                "country": country,
                "abuse_email": abuse_email,
                "dnssec": None,
                "raw_text": "\n".join(raw_lines)
            }

        except Exception as ex:
            logger.debug(f"RDAP lookup error for {domain}: {ex}")
            return None

    def collect(self, url: str) -> dict:
        domain = self._extract_domain(url)
        logger.info(f"WHOIS lookup : {domain}")

        # 1. Ưu tiên python-whois (cho đầy đủ nhất thông tin ngày tạo, cty, raw block)
        res = self._collect_via_socket(domain)
        if res and (res["created_date"] or res["registrar"]):
            logger.info(f"WHOIS [Socket] thành công: {domain} | registrar={res['registrar']} | age={res['domain_age_days']}")
            return res

        # 2. Dự phòng chuẩn quốc tế RDAP (qua HTTPS port 443 không bị firewall chặn)
        res = self._collect_via_rdap(domain)
        if res and (res["created_date"] or res["registrar"]):
            logger.info(f"WHOIS [RDAP] thành công: {domain} | registrar={res['registrar']} | age={res['domain_age_days']}")
            return res

        # 3. Giá trị rỗng an toàn nếu không tìm thấy
        logger.info(f"WHOIS: Không thể truy xuất thông tin cho {domain}")
        return {
            "domain_name": domain,
            "created_date": None,
            "updated_date": None,
            "expires_date": None,
            "domain_age_days": None,
            "registrar": None,
            "registrar_url": None,
            "whois_server": None,
            "nameservers": [],
            "status": [],
            "registrant_organization": None,
            "country": None,
            "abuse_email": None,
            "dnssec": None,
            "raw_text": ""
        }
