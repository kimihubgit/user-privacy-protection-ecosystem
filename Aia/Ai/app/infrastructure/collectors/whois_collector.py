"""
WHOIS Collector
"""

from __future__ import annotations

import socket
from datetime import datetime

import whois

from app.config.logger import logger


class WhoisCollector:

    # python-whois không có tham số timeout riêng — nó dùng socket
    # thô bên dưới, nên phải set timeout ở tầng socket trước khi gọi,
    # nếu không 1 WHOIS server chậm/treo sẽ làm cả request treo vô
    # thời hạn (không có giới hạn mặc định).
    TIMEOUT = 5

    def collect(
        self,
        url: str
    ) -> dict:

        logger.info(f"WHOIS : {url}")

        previous_timeout = socket.getdefaulttimeout()

        try:

            socket.setdefaulttimeout(self.TIMEOUT)

            w = whois.whois(url)

            created = w.creation_date

            if isinstance(created, list):
                created = created[0]

            expires = w.expiration_date

            if isinstance(expires, list):
                expires = expires[0]

            updated = w.updated_date

            if isinstance(updated, list):
                updated = updated[0]

            age = None

            if created:

                age = (
                    datetime.now() -
                    created
                ).days

            return {

                "created_date": created,

                "updated_date": updated,

                "expires_date": expires,

                "registrar": w.registrar,

                "country": getattr(
                    w,
                    "country",
                    None
                ),

                "domain_age_days": age

            }

        except Exception as ex:

            logger.warning(ex)

            return {

                "created_date": None,

                "updated_date": None,

                "expires_date": None,

                "registrar": None,

                "country": None,

                "domain_age_days": None

            }

        finally:

            socket.setdefaulttimeout(previous_timeout)