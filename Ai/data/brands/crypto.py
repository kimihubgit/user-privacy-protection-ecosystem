"""
Cryptocurrency exchange / wallet brands commonly impersonated in phishing.
Schema documented in app.data.brands.__init__.
"""

CRYPTO_BRANDS = [
    {
        "display_name": "Binance",
        "domains": ["binance.com"],
        "aliases": ["binance"],
        "category": "crypto",
        "risk_profile": "critical",
    },
    {
        "display_name": "Coinbase",
        "domains": ["coinbase.com"],
        "aliases": ["coinbase"],
        "category": "crypto",
        "risk_profile": "critical",
    },
    {
        "display_name": "MetaMask",
        "domains": ["metamask.io"],
        "aliases": ["metamask"],
        "category": "crypto",
        "risk_profile": "critical",
    },
    {
        "display_name": "Trust Wallet",
        "domains": ["trustwallet.com"],
        "aliases": ["trust wallet"],
        "category": "crypto",
        "risk_profile": "high",
    },
    {
        "display_name": "OKX",
        "domains": ["okx.com"],
        "aliases": ["okx", "okex"],
        "category": "crypto",
        "risk_profile": "high",
    },
    {
        "display_name": "Kraken",
        "domains": ["kraken.com"],
        "aliases": ["kraken"],
        "category": "crypto",
        "risk_profile": "high",
    },
    {
        "display_name": "Ledger",
        "domains": ["ledger.com"],
        "aliases": ["ledger"],
        "category": "crypto",
        "risk_profile": "high",
    },
    {
        "display_name": "Bybit",
        "domains": ["bybit.com"],
        "aliases": ["bybit"],
        "category": "crypto",
        "risk_profile": "high",
    },
]
