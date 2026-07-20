"""
Evidence Database
-----------------

URL Extension Database

Knowledge Base dành cho URL Detector
và Content Detector.

Nguyên tắc:
- Chỉ chứa dữ liệu
- Không chứa Logic
- Không chứa Rule
- Không chứa Risk Score
- Không chứa Confidence

Author: Anti Scam Detector
"""

from __future__ import annotations

URL_EXTENSIONS: dict[str, dict] = {

    # ==========================================================
    # Windows Executable
    # ==========================================================

    "windows": {

        "description": "Windows Executable",

        "extensions": [

            ".exe",

            ".msi",

            ".bat",

            ".cmd",

            ".com",

            ".scr",

            ".ps1"

        ]

    },

    # ==========================================================
    # Java
    # ==========================================================

    "java": {

        "description": "Java",

        "extensions": [

            ".jar",

            ".war"

        ]

    },

    # ==========================================================
    # Android
    # ==========================================================

    "android": {

        "description": "Android Package",

        "extensions": [

            ".apk",

            ".xapk",

            ".apks"

        ]

    },

    # ==========================================================
    # Apple
    # ==========================================================

    "apple": {

        "description": "Apple Package",

        "extensions": [

            ".ipa",

            ".pkg",

            ".dmg"

        ]

    },

    # ==========================================================
    # Linux
    # ==========================================================

    "linux": {

        "description": "Linux Package",

        "extensions": [

            ".deb",

            ".rpm",

            ".appimage",

            ".sh"

        ]

    },

    # ==========================================================
    # Archive
    # ==========================================================

    "archive": {

        "description": "Archive",

        "extensions": [

            ".zip",

            ".rar",

            ".7z",

            ".tar",

            ".gz",

            ".bz2",

            ".xz"

        ]

    },

    # ==========================================================
    # Office
    # ==========================================================

    "office": {

        "description": "Microsoft Office",

        "extensions": [

            ".doc",

            ".docx",

            ".xls",

            ".xlsx",

            ".ppt",

            ".pptx"

        ]

    },

    # ==========================================================
    # PDF
    # ==========================================================

    "pdf": {

        "description": "PDF",

        "extensions": [

            ".pdf"

        ]

    },

    # ==========================================================
    # Script
    # ==========================================================

    "script": {

        "description": "Script",

        "extensions": [

            ".js",

            ".vbs",

            ".wsf",

            ".hta"

        ]

    },

    # ==========================================================
    # Image
    # ==========================================================

    "image": {

        "description": "Image",

        "extensions": [

            ".jpg",

            ".jpeg",

            ".png",

            ".gif",

            ".bmp",

            ".svg",

            ".webp"

        ]

    },

    # ==========================================================
    # Audio
    # ==========================================================

    "audio": {

        "description": "Audio",

        "extensions": [

            ".mp3",

            ".wav",

            ".ogg",

            ".flac",

            ".aac"

        ]

    },

    # ==========================================================
    # Video
    # ==========================================================

    "video": {

        "description": "Video",

        "extensions": [

            ".mp4",

            ".avi",

            ".mov",

            ".wmv",

            ".mkv",

            ".webm"

        ]

    }

}

__all__ = [

    "URL_EXTENSIONS"

]