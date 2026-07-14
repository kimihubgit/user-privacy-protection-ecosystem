"""
ChongLuaDao Provider

Tra cứu cơ sở dữ liệu ChongLuaDao.
"""

from __future__ import annotations

from typing import Any

import requests

from app.infrastructure.osint.providers.base_provider import BaseProvider
from app.config.logger import logger


class ChongLuaDaoProvider(BaseProvider):
    """
    ChongLuaDao Provider

    Chỉ thực hiện:

    - Gửi request
    - Parse response
    - Chuẩn hóa kết quả

    Không chứa logic AI.

    Không chứa Risk Score.
    """

    API_URL = "https://feeds.chongluadao.vn/checksafe/cld"

    TIMEOUT = 10

    HEADERS = {

        "Content-Type": "application/json",

        "Origin": "https://chongluadao.vn",

        "Referer": "https://chongluadao.vn/"

    }

    def check(
        self,
        url: str
    ) -> dict[str, Any]:

        logger.info(
            f"ChongLuaDao lookup : {url}"
        )

        try:

            response = requests.post(

                self.API_URL,

                json={
                    "url": url
                },

                headers=self.HEADERS,

                timeout=self.TIMEOUT

            )

            response.raise_for_status()

            data = response.json()

            result = str(

                data.get(
                    "result",
                    "no result"
                )

            ).lower()

            #
            # Chuẩn hóa kết quả
            #

            if result not in {

                "safe",

                "malicious",

                "no result"

            }:

                result = "no result"

            logger.info(
                f"ChongLuaDao result : {result}"
            )

            return {

                "result": result,

                "source": "ChongLuaDao",

                "raw": data

            }

        except requests.Timeout:

            logger.error(
                "ChongLuaDao timeout."
            )

            return {

                "result": "no result",

                "source": "ChongLuaDao",

                "raw": {},

                "error": "timeout"

            }

        except requests.RequestException as ex:

            logger.error(
                f"ChongLuaDao request failed : {ex}"
            )

            return {

                "result": "no result",

                "source": "ChongLuaDao",

                "raw": {},

                "error": str(ex)

            }

        except Exception as ex:

            logger.exception(ex)

            return {

                "result": "no result",

                "source": "ChongLuaDao",

                "raw": {},

                "error": str(ex)

            }