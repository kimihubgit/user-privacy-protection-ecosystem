"""
Evidence Database
-----------------

HTTP Header Database

Knowledge Base dành cho HTTP Detector.

Nguyên tắc:
- Chỉ chứa dữ liệu
- Không chứa Logic
- Không chứa Rule
- Không chứa Risk Score
- Không chứa Confidence

Author: Anti Scam Detector
"""

from __future__ import annotations

HTTP_HEADERS: dict[str, dict] = {

    # ==========================================================
    # Content
    # ==========================================================

    "content": {

        "description": "Content Headers",

        "headers": [

            "Content-Type",

            "Content-Length",

            "Content-Encoding",

            "Content-Language",

            "Content-Disposition",

            "Transfer-Encoding"

        ]

    },

    # ==========================================================
    # Cache
    # ==========================================================

    "cache": {

        "description": "Cache Headers",

        "headers": [

            "Cache-Control",

            "Expires",

            "ETag",

            "Last-Modified",

            "Pragma"

        ]

    },

    # ==========================================================
    # Security
    # ==========================================================

    "security": {

        "description": "Security Headers",

        "headers": [

            "Strict-Transport-Security",

            "Content-Security-Policy",

            "X-Frame-Options",

            "X-Content-Type-Options",

            "Referrer-Policy",

            "Permissions-Policy",

            "Cross-Origin-Embedder-Policy",

            "Cross-Origin-Opener-Policy",

            "Cross-Origin-Resource-Policy"

        ]

    },

    # ==========================================================
    # Cookies
    # ==========================================================

    "cookies": {

        "description": "Cookie Headers",

        "headers": [

            "Set-Cookie",

            "Cookie"

        ]

    },

    # ==========================================================
    # Authentication
    # ==========================================================

    "authentication": {

        "description": "Authentication Headers",

        "headers": [

            "Authorization",

            "WWW-Authenticate",

            "Proxy-Authenticate"

        ]

    },

    # ==========================================================
    # CORS
    # ==========================================================

    "cors": {

        "description": "Cross-Origin Resource Sharing",

        "headers": [

            "Access-Control-Allow-Origin",

            "Access-Control-Allow-Credentials",

            "Access-Control-Allow-Headers",

            "Access-Control-Allow-Methods",

            "Access-Control-Expose-Headers",

            "Access-Control-Max-Age"

        ]

    },

    # ==========================================================
    # Server
    # ==========================================================

    "server": {

        "description": "Server Headers",

        "headers": [

            "Server",

            "Via",

            "X-Powered-By",

            "Alt-Svc"

        ]

    },

    # ==========================================================
    # Redirect
    # ==========================================================

    "redirect": {

        "description": "Redirect Headers",

        "headers": [

            "Location",

            "Refresh"

        ]

    },

    # ==========================================================
    # Connection
    # ==========================================================

    "connection": {

        "description": "Connection Headers",

        "headers": [

            "Connection",

            "Keep-Alive",

            "Upgrade"

        ]

    },

    # ==========================================================
    # Request Information
    # ==========================================================

    "request": {

        "description": "Request Headers",

        "headers": [

            "Host",

            "Origin",

            "Referer",

            "User-Agent",

            "Accept",

            "Accept-Encoding",

            "Accept-Language"

        ]

    }

}

__all__ = [

    "HTTP_HEADERS"

]