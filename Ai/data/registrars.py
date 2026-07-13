"""
app.data.registrars
====================

Domain registrar reference data. No logic.

Schema:

    {
        "name": str,          # registrar display name
        "iana_id": int | None,# IANA registrar ID if known, else None
        "risk_profile": str,  # "high" | "medium" | "low"
    }

`risk_profile` reflects industry-reported abuse volume / low-KYC
registration patterns commonly seen in phishing infrastructure reports
(e.g. Spamhaus/ Interisle style registrar-abuse studies), not an
accusation against the registrar as a company.
"""

REGISTRARS = [
    {"name": "NameCheap, Inc.", "iana_id": 1068, "risk_profile": "medium"},
    {"name": "GoDaddy.com, LLC", "iana_id": 146, "risk_profile": "medium"},
    {"name": "NameSilo, LLC", "iana_id": 1479, "risk_profile": "high"},
    {"name": "Dynadot LLC", "iana_id": 472, "risk_profile": "medium"},
    {"name": "PDR Ltd. (PublicDomainRegistry.com)", "iana_id": 303, "risk_profile": "high"},
    {"name": "Wix.com Ltd.", "iana_id": 1636, "risk_profile": "medium"},
    {"name": "Google LLC", "iana_id": 895, "risk_profile": "low"},
    {"name": "Amazon Registrar, Inc.", "iana_id": 468, "risk_profile": "low"},
    {"name": "Cloudflare, Inc.", "iana_id": 1910, "risk_profile": "medium"},
    {"name": "Tucows Domains Inc.", "iana_id": 69, "risk_profile": "medium"},
    {"name": "GMO Internet Group, Inc. (Onamae)", "iana_id": 49, "risk_profile": "medium"},
    {"name": "Alibaba Cloud Computing (Beijing) Co., Ltd.", "iana_id": 1599, "risk_profile": "high"},
    {"name": "Gname.com Pte. Ltd.", "iana_id": 1935, "risk_profile": "high"},
    {"name": "Hostinger, UAB", "iana_id": 1636, "risk_profile": "medium"},
    {"name": "P.A. Vietnam Company Limited", "iana_id": None, "risk_profile": "low"},
    {"name": "Mat Bao Corporation", "iana_id": None, "risk_profile": "low"},
]
