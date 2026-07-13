"""
Feature Extractor

Trích xuất các đặc trưng từ CollectorResult.
"""

from __future__ import annotations

import time

from app.config.logger import logger
from app.domain.entities.collector import CollectorResult
from app.domain.entities.feature_result import FeatureResult
from app.usecases.feature_extraction.detectors.brand_detector import BrandDetector
from app.usecases.feature_extraction.detectors.form_detector import FormDetector
from app.usecases.feature_extraction.detectors.html_detector import HTMLDetector
from app.usecases.feature_extraction.detectors.keyword_detector import KeywordDetector
from app.usecases.feature_extraction.detectors.url_detector import URLDetector


class FeatureExtractor:
    """
    Chỉ trích xuất Feature.
    Không AI. Không chấm điểm. Không kết luận.
    """

    def __init__(self):
        self.brand_detector = BrandDetector()
        self.form_detector = FormDetector()
        self.keyword_detector = KeywordDetector()
        self.url_detector = URLDetector()
        self.html_detector = HTMLDetector()

    def extract(self, collector: CollectorResult) -> FeatureResult:
        start = time.perf_counter()

        text = collector.visible_text or ""
        html = collector.html or ""
        domain = collector.domain or ""
        url = collector.final_url or collector.url or ""

        data: dict = {}
        detectors = [
            ("brand", lambda: self.brand_detector.detect(text=text, domain=domain)),
            ("form", lambda: self.form_detector.detect(html)),
            ("keyword", lambda: self.keyword_detector.detect(text)),
            ("url", lambda: self.url_detector.detect(url)),
            ("html", lambda: self.html_detector.detect(html)),
        ]

        for name, fn in detectors:
            try:
                data.update(fn())
            except Exception as ex:
                logger.warning(f"[FeatureExtractor] {name} detector failed: {ex}")

        feature = FeatureResult(**data)

        logger.info(
            f"[FeatureExtractor] done in {time.perf_counter() - start:.3f}s — "
            f"brand={feature.detected_brand} "
            f"category={feature.predicted_category} "
            f"login_form={feature.has_login_form} "
            f"gambling_kw={feature.gambling_keywords}"
        )

        return feature
