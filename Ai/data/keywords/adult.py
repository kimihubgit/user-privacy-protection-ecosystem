"""
Adult-content category keywords, used for content-category classification
(NOT for retrieving/generating such content). Kept intentionally generic
and label-level only. Schema documented in app.data.keywords.__init__.
"""

ADULT_KEYWORDS = [
    {"keyword": "adult-content", "category": "adult", "severity": "low"},
    {"keyword": "18-plus", "category": "adult", "severity": "low"},
    {"keyword": "age-verification-required", "category": "adult", "severity": "low"},
    {"keyword": "explicit-content-warning", "category": "adult", "severity": "low"},
    {"keyword": "dating-hookup", "category": "adult", "severity": "low"},
]
