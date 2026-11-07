"""
Evidence Database
-----------------

HTML Tag Database

Knowledge Base dành cho HTML Detector.

Nguyên tắc:
- Chỉ chứa dữ liệu
- Không chứa Logic
- Không chứa Rule
- Không chứa Risk Score
- Không chứa Confidence

Author: Anti Scam Detector
"""

from __future__ import annotations

HTML_TAGS: dict[str, dict] = {

    # ==========================================================
    # Form
    # ==========================================================

    "form": {

        "description": "HTML Form",

        "tags": [

            "form"

        ]

    },

    # ==========================================================
    # Input
    # ==========================================================

    "input": {

        "description": "Input Element",

        "tags": [

            "input",

            "textarea",

            "select",

            "option"

        ]

    },

    # ==========================================================
    # Authentication
    # ==========================================================

    "authentication": {

        "description": "Authentication Input",

        "tags": [

            "password",

            "email",

            "tel",

            "number"

        ]

    },

    # ==========================================================
    # Hidden
    # ==========================================================

    "hidden": {

        "description": "Hidden Element",

        "tags": [

            "hidden"

        ]

    },

    # ==========================================================
    # Button
    # ==========================================================

    "button": {

        "description": "Button",

        "tags": [

            "button",

            "submit",

            "reset"

        ]

    },

    # ==========================================================
    # Script
    # ==========================================================

    "script": {

        "description": "Script",

        "tags": [

            "script",

            "noscript"

        ]

    },

    # ==========================================================
    # IFrame
    # ==========================================================

    "iframe": {

        "description": "IFrame",

        "tags": [

            "iframe"

        ]

    },

    # ==========================================================
    # Object
    # ==========================================================

    "object": {

        "description": "Embedded Object",

        "tags": [

            "object",

            "embed"

        ]

    },

    # ==========================================================
    # Media
    # ==========================================================

    "media": {

        "description": "Media",

        "tags": [

            "img",

            "picture",

            "video",

            "audio",

            "source"

        ]

    },

    # ==========================================================
    # Link
    # ==========================================================

    "link": {

        "description": "Hyperlink",

        "tags": [

            "a",

            "link"

        ]

    },

    # ==========================================================
    # Metadata
    # ==========================================================

    "metadata": {

        "description": "Metadata",

        "tags": [

            "title",

            "meta",

            "base"

        ]

    },

    # ==========================================================
    # Navigation
    # ==========================================================

    "navigation": {

        "description": "Navigation",

        "tags": [

            "nav",

            "header",

            "footer",

            "aside"

        ]

    },

    # ==========================================================
    # Layout
    # ==========================================================

    "layout": {

        "description": "Layout",

        "tags": [

            "html",

            "head",

            "body",

            "main",

            "section",

            "article",

            "div",

            "span"

        ]

    },

    # ==========================================================
    # Table
    # ==========================================================

    "table": {

        "description": "Table",

        "tags": [

            "table",

            "thead",

            "tbody",

            "tfoot",

            "tr",

            "td",

            "th"

        ]

    },

    # ==========================================================
    # List
    # ==========================================================

    "list": {

        "description": "List",

        "tags": [

            "ul",

            "ol",

            "li",

            "dl",

            "dt",

            "dd"

        ]

    },

    # ==========================================================
    # Text
    # ==========================================================

    "text": {

        "description": "Text",

        "tags": [

            "h1",

            "h2",

            "h3",

            "h4",

            "h5",

            "h6",

            "p",

            "strong",

            "b",

            "i",

            "em",

            "small"

        ]

    }

}

__all__ = [

    "HTML_TAGS"

]