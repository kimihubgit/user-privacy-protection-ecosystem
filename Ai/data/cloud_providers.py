"""
app.data.cloud_providers
=========================

⏳ Deferred/optional dataset — add to as detectors need it.

Cloud provider hosting reference data, distinct from raw ASN numbers
(app.data.asn) in that this maps provider platforms to their commonly
abused subdomain/hosting patterns. No logic.

Schema:

    {
        "name": str,
        "domains": [str, ...],   # provider-managed domains/subdomains
        "risk_profile": str,     # "high" | "medium" | "low"
    }
"""

CLOUD_PROVIDERS = [
    {
        "name": "Amazon Web Services",
        "domains": ["amazonaws.com", "cloudfront.net", "awsapps.com"],
        "risk_profile": "medium",
    },
    {
        "name": "Google Cloud Platform",
        "domains": ["googleusercontent.com", "appspot.com", "web.app", "firebaseapp.com"],
        "risk_profile": "medium",
    },
    {
        "name": "Microsoft Azure",
        "domains": ["azurewebsites.net", "blob.core.windows.net", "cloudapp.azure.com"],
        "risk_profile": "medium",
    },
    {
        "name": "Cloudflare",
        "domains": ["pages.dev", "workers.dev"],
        "risk_profile": "medium",
    },
    {
        "name": "DigitalOcean",
        "domains": ["ondigitalocean.app"],
        "risk_profile": "medium",
    },
    {
        "name": "Vercel",
        "domains": ["vercel.app"],
        "risk_profile": "medium",
    },
    {
        "name": "Netlify",
        "domains": ["netlify.app"],
        "risk_profile": "medium",
    },
    {
        "name": "Alibaba Cloud",
        "domains": ["aliyuncs.com"],
        "risk_profile": "medium",
    },
]
