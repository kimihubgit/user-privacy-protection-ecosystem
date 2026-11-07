"""
Evidence Database
-----------------

Government Brand Database

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

GOVERNMENT_BRANDS: dict[str, dict] = {

    # ==========================================================
    # Chính phủ Việt Nam
    # ==========================================================

    "chinhphu": {

        "display_name": "Chính phủ Việt Nam",

        "country": "VN",

        "category": "Government",

        "official_domains": [

            "chinhphu.vn"

        ],

        "aliases": [

            "government of vietnam",

            "chinh phu"

        ],

        "weak_aliases": []

    },

    # ==========================================================
    # Bộ Công An
    # ==========================================================

    "bocongan": {

        "display_name": "Bộ Công An",

        "country": "VN",

        "category": "Government",

        "official_domains": [

            "bocongan.gov.vn"

        ],

        "aliases": [

            "mps",

            "ministry of public security"

        ],

        "weak_aliases": []

    },

    # ==========================================================
    # Bộ Tài Chính
    # ==========================================================

    "botaichinh": {

        "display_name": "Bộ Tài Chính",

        "country": "VN",

        "category": "Government",

        "official_domains": [

            "mof.gov.vn"

        ],

        "aliases": [

            "ministry of finance"

        ],

        "weak_aliases": []

    },

    # ==========================================================
    # Bộ Giáo dục
    # ==========================================================

    "bogiaoduc": {

        "display_name": "Bộ Giáo dục và Đào tạo",

        "country": "VN",

        "category": "Government",

        "official_domains": [

            "moet.gov.vn"

        ],

        "aliases": [

            "moet",

            "ministry of education"

        ],

        "weak_aliases": []

    },

    # ==========================================================
    # Bộ Y tế
    # ==========================================================

    "boyte": {

        "display_name": "Bộ Y tế",

        "country": "VN",

        "category": "Government",

        "official_domains": [

            "moh.gov.vn"

        ],

        "aliases": [

            "ministry of health"

        ],

        "weak_aliases": []

    },

    # ==========================================================
    # Tổng cục Thuế
    # ==========================================================

    "tongcucthue": {

        "display_name": "Tổng cục Thuế",

        "country": "VN",

        "category": "Government",

        "official_domains": [

            "gdt.gov.vn"

        ],

        "aliases": [

            "general department of taxation"

        ],

        "weak_aliases": []

    },

    # ==========================================================
    # Hải Quan Việt Nam
    # ==========================================================

    "haiquan": {

        "display_name": "Tổng cục Hải Quan",

        "country": "VN",

        "category": "Government",

        "official_domains": [

            "customs.gov.vn"

        ],

        "aliases": [

            "vietnam customs"

        ],

        "weak_aliases": []

    },

    # ==========================================================
    # Cổng Dịch vụ Công
    # ==========================================================

    "dichvucong": {

        "display_name": "Cổng Dịch vụ Công Quốc Gia",

        "country": "VN",

        "category": "Government",

        "official_domains": [

            "dichvucong.gov.vn"

        ],

        "aliases": [

            "national public service portal"

        ],

        "weak_aliases": []

    },

    # ==========================================================
    # Bảo hiểm Xã hội
    # ==========================================================

    "baohiemxahoi": {

        "display_name": "Bảo hiểm Xã hội Việt Nam",

        "country": "VN",

        "category": "Government",

        "official_domains": [

            "baohiemxahoi.gov.vn"

        ],

        "aliases": [

            "vss",

            "social insurance vietnam"

        ],

        "weak_aliases": []

    },

    # ==========================================================
    # Cục An toàn thông tin
    # ==========================================================

    "ais": {

        "display_name": "Cục An toàn thông tin",

        "country": "VN",

        "category": "Government",

        "official_domains": [

            "ais.gov.vn"

        ],

        "aliases": [

            "authority of information security"

        ],

        "weak_aliases": []

    },

    # ==========================================================
    # VNeID
    # ==========================================================

    "vneid": {

        "display_name": "VNeID",

        "country": "VN",

        "category": "Government",

        "official_domains": [

            "vneid.gov.vn"

        ],

        "aliases": [

            "vneid app"

        ],

        "weak_aliases": []

    },

    # ==========================================================
    # Cổng thông tin BHYT
    # ==========================================================

    "bhyt": {

        "display_name": "Bảo hiểm Y tế",

        "country": "VN",

        "category": "Government",

        "official_domains": [

            "baohiemxahoi.gov.vn"

        ],

        "aliases": [

            "bhyt"

        ],

        "weak_aliases": []

    }

}