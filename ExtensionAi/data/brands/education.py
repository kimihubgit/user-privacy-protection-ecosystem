"""
Evidence Database
-----------------

Education Brand Database

Knowledge Base dành cho Brand Detector.

Nguyên tắc:
- Chỉ chứa dữ liệu.
- Không chứa business logic.
- Không chứa Risk Score.
- Không chứa Confidence.
- Không chứa Rule.

Author: Anti Scam Detector
"""

from __future__ import annotations

EDUCATION_BRANDS: dict[str, dict] = {

    # ==========================================================
    # Coursera
    # ==========================================================

    "coursera": {

        "display_name": "Coursera",

        "country": "US",

        "category": "Education",

        "official_domains": [

            "coursera.org"

        ],

        "aliases": [

            "coursera online"

        ],

        "weak_aliases": []

    },

    # ==========================================================
    # Udemy
    # ==========================================================

    "udemy": {

        "display_name": "Udemy",

        "country": "US",

        "category": "Education",

        "official_domains": [

            "udemy.com"

        ],

        "aliases": [],

        "weak_aliases": []

    },

    # ==========================================================
    # edX
    # ==========================================================

    "edx": {

        "display_name": "edX",

        "country": "US",

        "category": "Education",

        "official_domains": [

            "edx.org"

        ],

        "aliases": [

            "ed x"

        ],

        "weak_aliases": []

    },

    # ==========================================================
    # Khan Academy
    # ==========================================================

    "khanacademy": {

        "display_name": "Khan Academy",

        "country": "US",

        "category": "Education",

        "official_domains": [

            "khanacademy.org"

        ],

        "aliases": [

            "khan academy"

        ],

        "weak_aliases": []

    },

    # ==========================================================
    # Duolingo
    # ==========================================================

    "duolingo": {

        "display_name": "Duolingo",

        "country": "US",

        "category": "Education",

        "official_domains": [

            "duolingo.com"

        ],

        "aliases": [],

        "weak_aliases": []

    },

    # ==========================================================
    # FutureLearn
    # ==========================================================

    "futurelearn": {

        "display_name": "FutureLearn",

        "country": "GB",

        "category": "Education",

        "official_domains": [

            "futurelearn.com"

        ],

        "aliases": [

            "future learn"

        ],

        "weak_aliases": []

    },

    # ==========================================================
    # Udacity
    # ==========================================================

    "udacity": {

        "display_name": "Udacity",

        "country": "US",

        "category": "Education",

        "official_domains": [

            "udacity.com"

        ],

        "aliases": [],

        "weak_aliases": []

    },

    # ==========================================================
    # MIT OpenCourseWare
    # ==========================================================

    "mitocw": {

        "display_name": "MIT OpenCourseWare",

        "country": "US",

        "category": "Education",

        "official_domains": [

            "ocw.mit.edu"

        ],

        "aliases": [

            "mit ocw",

            "mit open courseware"

        ],

        "weak_aliases": []

    },

    # ==========================================================
    # Harvard Online
    # ==========================================================

    "harvard": {

        "display_name": "Harvard University",

        "country": "US",

        "category": "Education",

        "official_domains": [

            "harvard.edu",

            "online-learning.harvard.edu"

        ],

        "aliases": [

            "harvard online"

        ],

        "weak_aliases": []

    },

    # ==========================================================
    # Stanford
    # ==========================================================

    "stanford": {

        "display_name": "Stanford University",

        "country": "US",

        "category": "Education",

        "official_domains": [

            "stanford.edu"

        ],

        "aliases": [

            "stanford online"

        ],

        "weak_aliases": []

    },

    # ==========================================================
    # Đại học Quốc gia TP.HCM
    # ==========================================================

    "vnuhcm": {

        "display_name": "Đại học Quốc gia TP.HCM",

        "country": "VN",

        "category": "Education",

        "official_domains": [

            "vnuhcm.edu.vn"

        ],

        "aliases": [

            "vnu hcm",

            "đhqg tp.hcm"

        ],

        "weak_aliases": []

    },

    # ==========================================================
    # Đại học Quốc gia Hà Nội
    # ==========================================================

    "vnu": {

        "display_name": "Đại học Quốc gia Hà Nội",

        "country": "VN",

        "category": "Education",

        "official_domains": [

            "vnu.edu.vn"

        ],

        "aliases": [

            "vnu hanoi",

            "đhqg hà nội"

        ],

        "weak_aliases": []

    },

    # ==========================================================
    # Nguyễn Tất Thành University
    # ==========================================================

    "nttu": {

        "display_name": "Nguyễn Tất Thành University",

        "country": "VN",

        "category": "Education",

        "official_domains": [

            "ntt.edu.vn"

        ],

        "aliases": [

            "nguyen tat thanh university",

            "đại học nguyễn tất thành"

        ],

        "weak_aliases": [

            "nttu"

        ]

    }

}