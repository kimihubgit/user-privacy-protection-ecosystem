"""
Logger

Cau hinh logging co ban cho toan bo ung dung.
"""

import logging

from config.settings import settings

logger = logging.getLogger("ai_anti_scam_chatbot")

if not logger.handlers:

    handler = logging.StreamHandler()

    formatter = logging.Formatter(
        "%(asctime)s | %(levelname)s | %(name)s | %(message)s",
    )

    handler.setFormatter(formatter)

    logger.addHandler(handler)

    logger.setLevel(
        logging.DEBUG if settings.DEBUG else logging.INFO,
    )

    logger.propagate = False
