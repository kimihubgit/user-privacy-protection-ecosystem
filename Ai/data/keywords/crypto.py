"""
Cryptocurrency scam / phishing lure keywords.
Schema documented in app.data.keywords.__init__.
"""

CRYPTO_KEYWORDS = [
    {"keyword": "wallet-connect", "category": "crypto", "severity": "high"},
    {"keyword": "seed-phrase", "category": "crypto", "severity": "critical"},
    {"keyword": "recovery-phrase", "category": "crypto", "severity": "critical"},
    {"keyword": "private-key", "category": "crypto", "severity": "critical"},
    {"keyword": "airdrop-claim", "category": "crypto", "severity": "high"},
    {"keyword": "free-airdrop", "category": "crypto", "severity": "high"},
    {"keyword": "nft-mint", "category": "crypto", "severity": "medium"},
    {"keyword": "connect-wallet-now", "category": "crypto", "severity": "high"},
    {"keyword": "double-your-btc", "category": "crypto", "severity": "critical"},
    {"keyword": "staking-rewards", "category": "crypto", "severity": "medium"},
    {"keyword": "token-swap", "category": "crypto", "severity": "medium"},
    {"keyword": "unlock-wallet", "category": "crypto", "severity": "high"},
]
