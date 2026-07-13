"""
app.data.tlds
=============

Top-level-domain reference data used for risk scoring context. No logic.
"""

# TLDs statistically over-represented in phishing/spam campaigns due to
# low registration cost and weak vetting (industry-reported, e.g. Spamhaus
# "most abused TLD" style lists). Pure reference data, not a verdict.
HIGH_RISK_TLDS = [
    ".top",
    ".xyz",
    ".click",
    ".cam",
    ".rest",
    ".gq",
    ".cf",
    ".ml",
    ".ga",
    ".tk",
    ".buzz",
    ".icu",
    ".work",
    ".support",
    ".fit",
    ".loan",
    ".men",
    ".date",
    ".party",
    ".stream",
    ".download",
    ".racing",
    ".win",
    ".bid",
    ".review",
    ".science",
    ".webcam",
    ".accountant",
]

# TLDs with generally stronger registration/vetting requirements or high
# reputational cost, commonly treated as lower baseline risk.
LOW_RISK_TLDS = [
    ".gov",
    ".edu",
    ".mil",
    ".gov.vn",
    ".edu.vn",
    ".int",
    ".ac.uk",
    ".gov.uk",
]

# Common legitimate general-purpose / country-code TLDs (neutral baseline).
COMMON_TLDS = [
    ".com",
    ".net",
    ".org",
    ".info",
    ".biz",
    ".co",
    ".io",
    ".vn",
    ".com.vn",
    ".us",
    ".uk",
    ".de",
    ".fr",
    ".jp",
    ".cn",
    ".sg",
    ".au",
    ".ca",
    ".in",
]

# New gTLDs frequently used in typosquatting because they allow brand-like
# second-level domains (e.g. "login-microsoft.security").
BRANDABLE_NEW_GTLDS = [
    ".app",
    ".shop",
    ".store",
    ".online",
    ".site",
    ".website",
    ".tech",
    ".digital",
    ".security",
    ".live",
    ".vip",
]
