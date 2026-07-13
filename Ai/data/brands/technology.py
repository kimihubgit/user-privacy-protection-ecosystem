"""
Technology / SaaS / cloud brands commonly impersonated in phishing.
Schema documented in app.data.brands.__init__.
"""

TECHNOLOGY_BRANDS = [
    {
        "display_name": "Microsoft",
        "domains": ["microsoft.com", "office.com", "live.com", "outlook.com"],
        "aliases": ["microsoft", "ms office", "office365", "microsoft365"],
        "category": "technology",
        "risk_profile": "critical",
    },
    {
        "display_name": "Google",
        "domains": ["google.com", "gmail.com", "accounts.google.com"],
        "aliases": ["google", "gmail", "google account"],
        "category": "technology",
        "risk_profile": "critical",
    },
    {
        "display_name": "Apple",
        "domains": ["apple.com", "icloud.com"],
        "aliases": ["apple", "icloud", "apple id"],
        "category": "technology",
        "risk_profile": "critical",
    },
    {
        "display_name": "Adobe",
        "domains": ["adobe.com"],
        "aliases": ["adobe", "adobe creative cloud"],
        "category": "technology",
        "risk_profile": "medium",
    },
    {
        "display_name": "Dropbox",
        "domains": ["dropbox.com"],
        "aliases": ["dropbox"],
        "category": "technology",
        "risk_profile": "medium",
    },
    {
        "display_name": "Zoom",
        "domains": ["zoom.us"],
        "aliases": ["zoom"],
        "category": "technology",
        "risk_profile": "medium",
    },
    {
        "display_name": "Slack",
        "domains": ["slack.com"],
        "aliases": ["slack"],
        "category": "technology",
        "risk_profile": "medium",
    },
    {
        "display_name": "Amazon Web Services",
        "domains": ["aws.amazon.com"],
        "aliases": ["aws", "amazon web services"],
        "category": "technology",
        "risk_profile": "high",
    },
    {
        "display_name": "Adobe Acrobat",
        "domains": ["acrobat.adobe.com"],
        "aliases": ["adobe acrobat", "acrobat sign"],
        "category": "technology",
        "risk_profile": "medium",
    },
    {
        "display_name": "LinkedIn",
        "domains": ["linkedin.com"],
        "aliases": ["linkedin"],
        "category": "technology",
        "risk_profile": "high",
    },
    {
        "display_name": "GitHub",
        "domains": ["github.com"],
        "aliases": ["github"],
        "category": "technology",
        "risk_profile": "high",
    },
    {
        "display_name": "Netflix",
        "domains": ["netflix.com"],
        "aliases": ["netflix"],
        "category": "technology",
        "risk_profile": "medium",
    },
    {
        "display_name": "DocuSign",
        "domains": ["docusign.com", "docusign.net"],
        "aliases": ["docusign"],
        "category": "technology",
        "risk_profile": "high",
    },
]
