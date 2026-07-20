"""
Evidence Database
-----------------

Free Hosting Database

Knowledge Base dành cho Network Detector
và Domain Detector.

Nguyên tắc:
- Chỉ chứa dữ liệu
- Không chứa Logic
- Không chứa Rule
- Không chứa Risk Score
- Không chứa Confidence

Author: Anti Scam Detector
"""

from __future__ import annotations

FREE_HOSTING: dict[str, dict] = {

    # ==========================================================
    # GitHub Pages
    # ==========================================================

    "github_pages": {

        "provider": "GitHub Pages",

        "domains": [

            "github.io"

        ]

    },

    # ==========================================================
    # GitLab Pages
    # ==========================================================

    "gitlab_pages": {

        "provider": "GitLab Pages",

        "domains": [

            "gitlab.io"

        ]

    },

    # ==========================================================
    # Cloudflare Pages
    # ==========================================================

    "cloudflare_pages": {

        "provider": "Cloudflare Pages",

        "domains": [

            "pages.dev"

        ]

    },

    # ==========================================================
    # Netlify
    # ==========================================================

    "netlify": {

        "provider": "Netlify",

        "domains": [

            "netlify.app"

        ]

    },

    # ==========================================================
    # Vercel
    # ==========================================================

    "vercel": {

        "provider": "Vercel",

        "domains": [

            "vercel.app"

        ]

    },

    # ==========================================================
    # Firebase Hosting
    # ==========================================================

    "firebase": {

        "provider": "Firebase Hosting",

        "domains": [

            "web.app",

            "firebaseapp.com"

        ]

    },

    # ==========================================================
    # Render
    # ==========================================================

    "render": {

        "provider": "Render",

        "domains": [

            "onrender.com"

        ]

    },

    # ==========================================================
    # Railway
    # ==========================================================

    "railway": {

        "provider": "Railway",

        "domains": [

            "up.railway.app"

        ]

    },

    # ==========================================================
    # Replit
    # ==========================================================

    "replit": {

        "provider": "Replit",

        "domains": [

            "replit.app",

            "repl.co"

        ]

    },

    # ==========================================================
    # Glitch
    # ==========================================================

    "glitch": {

        "provider": "Glitch",

        "domains": [

            "glitch.me"

        ]

    },

    # ==========================================================
    # Surge
    # ==========================================================

    "surge": {

        "provider": "Surge",

        "domains": [

            "surge.sh"

        ]

    },

    # ==========================================================
    # InfinityFree
    # ==========================================================

    "infinityfree": {

        "provider": "InfinityFree",

        "domains": [

            "epizy.com",

            "rf.gd"

        ]

    },

    # ==========================================================
    # 000WebHost
    # ==========================================================

    "000webhost": {

        "provider": "000WebHost",

        "domains": [

            "000webhostapp.com"

        ]

    },

    # ==========================================================
    # AwardSpace
    # ==========================================================

    "awardspace": {

        "provider": "AwardSpace",

        "domains": [

            "awardspace.info"

        ]

    },

    # ==========================================================
    # Wix
    # ==========================================================

    "wix": {

        "provider": "Wix",

        "domains": [

            "wixsite.com"

        ]

    },

    # ==========================================================
    # Weebly
    # ==========================================================

    "weebly": {

        "provider": "Weebly",

        "domains": [

            "weebly.com"

        ]

    },

    # ==========================================================
    # Google Sites
    # ==========================================================

    "google_sites": {

        "provider": "Google Sites",

        "domains": [

            "sites.google.com"

        ]

    },

    # ==========================================================
    # Notion
    # ==========================================================

    "notion": {

        "provider": "Notion",

        "domains": [

            "notion.site"

        ]

    }

}

__all__ = [

    "FREE_HOSTING"

]