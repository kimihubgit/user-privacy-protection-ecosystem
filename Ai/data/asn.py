"""
app.data.asn
============

Autonomous System (network) reference data used for hosting-context risk
scoring. No logic.

Schema:

    {
        "asn": int,           # AS number
        "name": str,          # organization / network name
        "risk_profile": str,  # "high" | "medium" | "low"
    }
"""

ASN_REGISTRY = [
    {"asn": 16509, "name": "Amazon.com, Inc. (AWS)", "risk_profile": "low"},
    {"asn": 15169, "name": "Google LLC", "risk_profile": "low"},
    {"asn": 8075, "name": "Microsoft Corporation", "risk_profile": "low"},
    {"asn": 13335, "name": "Cloudflare, Inc.", "risk_profile": "medium"},
    {"asn": 14061, "name": "DigitalOcean, LLC", "risk_profile": "medium"},
    {"asn": 20473, "name": "The Constant Company (Vultr)", "risk_profile": "medium"},
    {"asn": 63949, "name": "Akamai Connected Cloud (Linode)", "risk_profile": "medium"},
    {"asn": 24940, "name": "Hetzner Online GmbH", "risk_profile": "medium"},
    {"asn": 202425, "name": "IP Volume inc", "risk_profile": "high"},
    {"asn": 209, "name": "Qwest / CenturyLink", "risk_profile": "low"},
    {"asn": 4134, "name": "China Telecom", "risk_profile": "medium"},
    {"asn": 45102, "name": "Alibaba (US) Technology Co., Ltd.", "risk_profile": "medium"},
    {"asn": 197226, "name": "PIN Vietnam", "risk_profile": "low"},
    {"asn": 45899, "name": "VNPT Corp", "risk_profile": "low"},
    {"asn": 7552, "name": "Viettel Group", "risk_profile": "low"},
    {"asn": 60068, "name": "Datacamp Limited (CDN77 / bulletproof-linked)", "risk_profile": "high"},
    {"asn": 200019, "name": "Alexhost SRL", "risk_profile": "high"},
    {"asn": 39351, "name": "SIA IPB / bulletproof hosting cluster", "risk_profile": "high"},
]
