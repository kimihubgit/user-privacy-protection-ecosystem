"""
app.data.categories
====================

Central taxonomy of threat/content categories used across brands,
keywords, and detector output labels. No logic.

Schema:

    CATEGORIES[key] = {
        "label": str,          # human-readable label
        "description": str,    # short definition
        "default_severity": str,  # "critical" | "high" | "medium" | "low"
    }
"""

CATEGORIES = {
    "phishing": {
        "label": "Phishing",
        "description": "Generic credential-harvesting or identity-theft lure.",
        "default_severity": "high",
    },
    "banking": {
        "label": "Banking Fraud",
        "description": "Impersonation of banks or financial institutions.",
        "default_severity": "critical",
    },
    "payment": {
        "label": "Payment Fraud",
        "description": "Impersonation of payment processors, wallets, or checkout flows.",
        "default_severity": "high",
    },
    "crypto": {
        "label": "Cryptocurrency Scam",
        "description": "Wallet-drainer, fake exchange, or crypto giveaway scam content.",
        "default_severity": "critical",
    },
    "malware": {
        "label": "Malware Distribution",
        "description": "Drive-by-download or trojanized software delivery.",
        "default_severity": "critical",
    },
    "gambling": {
        "label": "Unlicensed Gambling",
        "description": "Unlicensed or region-restricted online betting/casino content.",
        "default_severity": "medium",
    },
    "adult": {
        "label": "Adult Content",
        "description": "Age-restricted content classification (content-category only).",
        "default_severity": "low",
    },
    "technology": {
        "label": "Technology / SaaS",
        "description": "Impersonation of technology, cloud, or SaaS brands.",
        "default_severity": "high",
    },
    "social": {
        "label": "Social Media",
        "description": "Impersonation of social media or messaging platforms.",
        "default_severity": "high",
    },
    "ecommerce": {
        "label": "E-commerce / Logistics",
        "description": "Impersonation of marketplaces, retailers, or delivery couriers.",
        "default_severity": "medium",
    },
    "government": {
        "label": "Government / Public Service",
        "description": "Impersonation of government agencies or public services.",
        "default_severity": "critical",
    },
    "education": {
        "label": "Education",
        "description": "Impersonation of educational institutions or e-learning platforms.",
        "default_severity": "low",
    },
}
