"""
HTML Collector

Chức năng
---------
- Download HTML
- Parse HTML
- Extract:
    + Title
    + Visible Text
"""

from __future__ import annotations

from typing import Dict

import requests
from bs4 import BeautifulSoup
from requests.exceptions import RequestException, Timeout

from app.config.logger import logger


class HTMLCollector:

    USER_AGENT = (
        "Mozilla/5.0 "
        "(Windows NT 10.0; Win64; x64) "
        "AppleWebKit/537.36 "
        "(KHTML, like Gecko) "
        "Chrome/138.0 Safari/537.36"
    )

    TIMEOUT = 10

    def __init__(self):

        self.session = requests.Session()

        self.session.headers.update({"User-Agent": self.USER_AGENT})

    def collect(self, url: str) -> Dict:

        logger.info(f"Collect HTML : {url}")

        result = {
            "html": "",
            "title": "",
            "visible_text": "",
            "status_code": 0,
            "final_url": "",
            "content_type": "",
            "response_headers": {},
            "redirect_chain": [],
        }

        try:

            response = self.session.get(
                url, timeout=self.TIMEOUT, allow_redirects=True, verify=True
            )

            response.raise_for_status()

            response.encoding = response.apparent_encoding

            html = response.text

            soup = BeautifulSoup(html, "lxml")

            title = ""

            if soup.title:

                title = soup.title.get_text(strip=True)

            #
            # Remove script/style
            #

            for tag in soup(["script", "style", "noscript"]):

                tag.decompose()

            visible_text = soup.get_text(separator=" ", strip=True)

            result["html"] = html

            result["title"] = title

            result["visible_text"] = visible_text

            result["status_code"] = response.status_code

            result["final_url"] = response.url

            result["content_type"] = response.headers.get("Content-Type", "")

            result["response_headers"] = dict(response.headers)

            result["redirect_chain"] = [
                {"status": item.status_code, "url": item.url}
                for item in response.history
            ]

            logger.info("HTML Collector Finished")

        except Timeout:

            logger.error(f"Timeout : {url}")

        except RequestException as ex:

            logger.error(f"Request Failed : {ex}")

        except Exception as ex:

            logger.exception(ex)

        return result
