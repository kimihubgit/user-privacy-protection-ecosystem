"""
Social media / messaging brands commonly impersonated in phishing.
Schema documented in app.data.brands.__init__.
"""

SOCIAL_BRANDS = [
    {
        "display_name": "Facebook",
        "domains": ["facebook.com", "fb.com"],
        "aliases": ["facebook", "fb"],
        "category": "social",
        "risk_profile": "critical",
    },
    {
        "display_name": "Instagram",
        "domains": ["instagram.com"],
        "aliases": ["instagram", "ig"],
        "category": "social",
        "risk_profile": "high",
    },
    {
        "display_name": "WhatsApp",
        "domains": ["whatsapp.com"],
        "aliases": ["whatsapp"],
        "category": "social",
        "risk_profile": "high",
    },
    {
        "display_name": "Telegram",
        "domains": ["telegram.org"],
        "aliases": ["telegram"],
        "category": "social",
        "risk_profile": "medium",
    },
    {
        "display_name": "X (Twitter)",
        "domains": ["x.com", "twitter.com"],
        "aliases": ["twitter", "x"],
        "category": "social",
        "risk_profile": "high",
    },
    {
        "display_name": "TikTok",
        "domains": ["tiktok.com"],
        "aliases": ["tiktok"],
        "category": "social",
        "risk_profile": "high",
    },
    {
        "display_name": "Zalo",
        "domains": ["zalo.me"],
        "aliases": ["zalo"],
        "category": "social",
        "risk_profile": "high",
    },
    {
        "display_name": "Snapchat",
        "domains": ["snapchat.com"],
        "aliases": ["snapchat", "snap"],
        "category": "social",
        "risk_profile": "medium",
    },
    {
        "display_name": "Discord",
        "domains": ["discord.com", "discord.gg"],
        "aliases": ["discord"],
        "category": "social",
        "risk_profile": "medium",
    },
    {
        "display_name": "Pinterest",
        "domains": ["pinterest.com"],
        "aliases": ["pinterest"],
        "category": "social",
        "risk_profile": "low",
    },
]
