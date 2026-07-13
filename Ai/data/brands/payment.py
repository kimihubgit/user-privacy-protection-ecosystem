"""
Payment / fintech / e-wallet brands commonly impersonated in phishing.
Schema documented in app.data.brands.__init__.
"""

PAYMENT_BRANDS = [
    {
        "display_name": "PayPal",
        "domains": ["paypal.com"],
        "aliases": ["paypal"],
        "category": "payment",
        "risk_profile": "critical",
    },
    {
        "display_name": "Visa",
        "domains": ["visa.com"],
        "aliases": ["visa"],
        "category": "payment",
        "risk_profile": "high",
    },
    {
        "display_name": "Mastercard",
        "domains": ["mastercard.com"],
        "aliases": ["mastercard"],
        "category": "payment",
        "risk_profile": "high",
    },
    {
        "display_name": "MoMo",
        "domains": ["momo.vn"],
        "aliases": ["momo", "ví momo"],
        "category": "payment",
        "risk_profile": "critical",
    },
    {
        "display_name": "ZaloPay",
        "domains": ["zalopay.vn"],
        "aliases": ["zalopay"],
        "category": "payment",
        "risk_profile": "high",
    },
    {
        "display_name": "VNPay",
        "domains": ["vnpay.vn"],
        "aliases": ["vnpay"],
        "category": "payment",
        "risk_profile": "high",
    },
    {
        "display_name": "Stripe",
        "domains": ["stripe.com"],
        "aliases": ["stripe"],
        "category": "payment",
        "risk_profile": "high",
    },
    {
        "display_name": "Western Union",
        "domains": ["westernunion.com"],
        "aliases": ["western union"],
        "category": "payment",
        "risk_profile": "high",
    },
    {
        "display_name": "Wise",
        "domains": ["wise.com"],
        "aliases": ["wise", "transferwise"],
        "category": "payment",
        "risk_profile": "medium",
    },
    {
        "display_name": "American Express",
        "domains": ["americanexpress.com"],
        "aliases": ["amex", "american express"],
        "category": "payment",
        "risk_profile": "high",
    },
]
