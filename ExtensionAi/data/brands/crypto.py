"""
Evidence Database
-----------------

Cryptocurrency Brand Database

Knowledge Base dành cho Brand Detector.

Nguyên tắc:
- Chỉ chứa dữ liệu.
- Không chứa business logic.
- Không chứa Risk Score.
- Không chứa Confidence.
- Không chứa Rule.

Author: Anti Scam Detector
"""

from __future__ import annotations

CRYPTO_BRANDS: dict[str, dict] = {

    # ==========================================================
    # Binance
    # ==========================================================

    "binance": {

        "display_name": "Binance",

        "country": "MT",

        "category": "Crypto",

        "official_domains": [

            "binance.com"

        ],

        "aliases": [

            "binance exchange",

            "binance global"

        ],

        "weak_aliases": [

            "bnb"

        ]

    },

    # ==========================================================
    # Coinbase
    # ==========================================================

    "coinbase": {

        "display_name": "Coinbase",

        "country": "US",

        "category": "Crypto",

        "official_domains": [

            "coinbase.com"

        ],

        "aliases": [

            "coinbase exchange"

        ],

        "weak_aliases": []

    },

    # ==========================================================
    # Bybit
    # ==========================================================

    "bybit": {

        "display_name": "Bybit",

        "country": "AE",

        "category": "Crypto",

        "official_domains": [

            "bybit.com"

        ],

        "aliases": [],

        "weak_aliases": []

    },

    # ==========================================================
    # OKX
    # ==========================================================

    "okx": {

        "display_name": "OKX",

        "country": "SC",

        "category": "Crypto",

        "official_domains": [

            "okx.com"

        ],

        "aliases": [

            "okex"

        ],

        "weak_aliases": []

    },

    # ==========================================================
    # KuCoin
    # ==========================================================

    "kucoin": {

        "display_name": "KuCoin",

        "country": "SC",

        "category": "Crypto",

        "official_domains": [

            "kucoin.com"

        ],

        "aliases": [],

        "weak_aliases": []

    },

    # ==========================================================
    # Kraken
    # ==========================================================

    "kraken": {

        "display_name": "Kraken",

        "country": "US",

        "category": "Crypto",

        "official_domains": [

            "kraken.com"

        ],

        "aliases": [

            "kraken exchange"

        ],

        "weak_aliases": []

    },

    # ==========================================================
    # Bitget
    # ==========================================================

    "bitget": {

        "display_name": "Bitget",

        "country": "SG",

        "category": "Crypto",

        "official_domains": [

            "bitget.com"

        ],

        "aliases": [],

        "weak_aliases": []

    },

    # ==========================================================
    # Gate.io
    # ==========================================================

    "gateio": {

        "display_name": "Gate.io",

        "country": "KY",

        "category": "Crypto",

        "official_domains": [

            "gate.io"

        ],

        "aliases": [

            "gateio"

        ],

        "weak_aliases": []

    },

    # ==========================================================
    # MEXC
    # ==========================================================

    "mexc": {

        "display_name": "MEXC",

        "country": "SC",

        "category": "Crypto",

        "official_domains": [

            "mexc.com"

        ],

        "aliases": [

            "mexc global"

        ],

        "weak_aliases": []

    },

    # ==========================================================
    # MetaMask
    # ==========================================================

    "metamask": {

        "display_name": "MetaMask",

        "country": "US",

        "category": "Crypto",

        "official_domains": [

            "metamask.io"

        ],

        "aliases": [

            "meta mask"

        ],

        "weak_aliases": []

    },

    # ==========================================================
    # Trust Wallet
    # ==========================================================

    "trustwallet": {

        "display_name": "Trust Wallet",

        "country": "US",

        "category": "Crypto",

        "official_domains": [

            "trustwallet.com"

        ],

        "aliases": [

            "trust wallet"

        ],

        "weak_aliases": []

    },

    # ==========================================================
    # Phantom
    # ==========================================================

    "phantom": {

        "display_name": "Phantom Wallet",

        "country": "US",

        "category": "Crypto",

        "official_domains": [

            "phantom.app"

        ],

        "aliases": [

            "phantom wallet"

        ],

        "weak_aliases": []

    },

    # ==========================================================
    # Ledger
    # ==========================================================

    "ledger": {

        "display_name": "Ledger",

        "country": "FR",

        "category": "Crypto",

        "official_domains": [

            "ledger.com"

        ],

        "aliases": [

            "ledger wallet"

        ],

        "weak_aliases": []

    },

    # ==========================================================
    # Trezor
    # ==========================================================

    "trezor": {

        "display_name": "Trezor",

        "country": "CZ",

        "category": "Crypto",

        "official_domains": [

            "trezor.io"

        ],

        "aliases": [

            "trezor wallet"

        ],

        "weak_aliases": []

    },

    # ==========================================================
    # SafePal
    # ==========================================================

    "safepal": {

        "display_name": "SafePal",

        "country": "SG",

        "category": "Crypto",

        "official_domains": [

            "safepal.com"

        ],

        "aliases": [

            "safe pal"

        ],

        "weak_aliases": []

    },

    # ==========================================================
    # CoinMarketCap
    # ==========================================================

    "coinmarketcap": {

        "display_name": "CoinMarketCap",

        "country": "US",

        "category": "Crypto",

        "official_domains": [

            "coinmarketcap.com"

        ],

        "aliases": [

            "cmc"

        ],

        "weak_aliases": []

    },

    # ==========================================================
    # CoinGecko
    # ==========================================================

    "coingecko": {

        "display_name": "CoinGecko",

        "country": "SG",

        "category": "Crypto",

        "official_domains": [

            "coingecko.com"

        ],

        "aliases": [

            "coin gecko"

        ],

        "weak_aliases": []

    }

}