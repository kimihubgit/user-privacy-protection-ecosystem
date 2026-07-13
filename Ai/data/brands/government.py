"""
Government / public-service brands commonly impersonated in phishing
(tax authorities, postal/customs, social insurance, national ID portals).
Schema documented in app.data.brands.__init__.
"""

GOVERNMENT_BRANDS = [
    {
        "display_name": "Cong Dich Vu Cong Quoc Gia (DVCQG)",
        "domains": ["dichvucong.gov.vn"],
        "aliases": ["dich vu cong", "dvcqg", "cong dich vu cong quoc gia"],
        "category": "government",
        "risk_profile": "critical",
    },
    {
        "display_name": "Tong cuc Thue (Vietnam Tax Authority)",
        "domains": ["gdt.gov.vn"],
        "aliases": ["tong cuc thue", "thue dien tu", "etax"],
        "category": "government",
        "risk_profile": "critical",
    },
    {
        "display_name": "Bao Hiem Xa Hoi Viet Nam",
        "domains": ["baohiemxahoi.gov.vn"],
        "aliases": ["bhxh", "bao hiem xa hoi"],
        "category": "government",
        "risk_profile": "high",
    },
    {
        "display_name": "Bo Cong An (VNeID)",
        "domains": ["vneid.gov.vn"],
        "aliases": ["vneid", "bo cong an", "dinh danh dien tu"],
        "category": "government",
        "risk_profile": "critical",
    },
    {
        "display_name": "IRS (US Internal Revenue Service)",
        "domains": ["irs.gov"],
        "aliases": ["irs"],
        "category": "government",
        "risk_profile": "critical",
    },
    {
        "display_name": "USPS",
        "domains": ["usps.com"],
        "aliases": ["usps", "us postal service"],
        "category": "government",
        "risk_profile": "high",
    },
    {
        "display_name": "GOV.UK",
        "domains": ["gov.uk"],
        "aliases": ["gov.uk", "hmrc"],
        "category": "government",
        "risk_profile": "high",
    },
    {
        "display_name": "Social Security Administration (SSA)",
        "domains": ["ssa.gov"],
        "aliases": ["ssa", "social security"],
        "category": "government",
        "risk_profile": "critical",
    },
]
