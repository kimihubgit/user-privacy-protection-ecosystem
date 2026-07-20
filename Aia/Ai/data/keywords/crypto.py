"""
Evidence Database
-----------------

Crypto Keyword Database

Knowledge Base dành cho Keyword Detector.

Nguyên tắc:
- Chỉ chứa dữ liệu
- Không chứa Rule
- Không chứa Risk Score
- Không chứa Confidence
- Không chứa Logic

Author: Anti Scam Detector
"""

from __future__ import annotations

CRYPTO_KEYWORDS: dict[str, dict] = {

    # ==========================================================
    # Cryptocurrency
    # ==========================================================

    "cryptocurrency": {

        "description": "Cryptocurrency",

        "keywords": [

            "crypto",
            "cryptocurrency",
            "digital asset",
            "virtual asset",
            "coin",
            "token",
            "blockchain"

        ]

    },

    # ==========================================================
    # Wallet
    # ==========================================================

    "wallet": {

        "description": "Crypto Wallet",

        "keywords": [

            "wallet",
            "wallet address",
            "receive address",
            "send address",
            "deposit address"

        ]

    },

    # ==========================================================
    # Seed Phrase
    # ==========================================================

    "seed_phrase": {

        "description": "Recovery Phrase",

        "keywords": [

            "seed phrase",
            "recovery phrase",
            "mnemonic",
            "12 words",
            "24 words",
            "backup phrase",
            "secret phrase"

        ]

    },

    # ==========================================================
    # Private Key
    # ==========================================================

    "private_key": {

        "description": "Private Key",

        "keywords": [

            "private key",
            "secret key",
            "wallet key",
            "import key"

        ]

    },

    # ==========================================================
    # Smart Contract
    # ==========================================================

    "smart_contract": {

        "description": "Smart Contract",

        "keywords": [

            "smart contract",
            "contract address",
            "token contract",
            "contract interaction"

        ]

    },

    # ==========================================================
    # Trading
    # ==========================================================

    "trading": {

        "description": "Trading",

        "keywords": [

            "spot",
            "futures",
            "margin",
            "perpetual",
            "trading",
            "order book",
            "limit order",
            "market order"

        ]

    },

    # ==========================================================
    # Staking
    # ==========================================================

    "staking": {

        "description": "Staking",

        "keywords": [

            "staking",
            "stake",
            "validator",
            "delegation",
            "locked staking"

        ]

    },

    # ==========================================================
    # DeFi
    # ==========================================================

    "defi": {

        "description": "Decentralized Finance",

        "keywords": [

            "defi",
            "yield farming",
            "liquidity pool",
            "lp token",
            "dex"

        ]

    },

    # ==========================================================
    # NFT
    # ==========================================================

    "nft": {

        "description": "NFT",

        "keywords": [

            "nft",
            "non fungible token",
            "mint",
            "mint nft",
            "collection"

        ]

    },

    # ==========================================================
    # Airdrop
    # ==========================================================

    "airdrop": {

        "description": "Airdrop",

        "keywords": [

            "airdrop",
            "claim reward",
            "claim token",
            "free token",
            "free crypto"

        ]

    },

    # ==========================================================
    # Swap
    # ==========================================================

    "swap": {

        "description": "Swap",

        "keywords": [

            "swap",
            "token swap",
            "exchange token",
            "bridge"

        ]

    },

    # ==========================================================
    # Web3
    # ==========================================================

    "web3": {

        "description": "Web3",

        "keywords": [

            "web3",
            "wallet connect",
            "connect wallet",
            "walletconnect"

        ]

    },

    # ==========================================================
    # Stablecoin
    # ==========================================================

    "stablecoin": {

        "description": "Stablecoin",

        "keywords": [

            "usdt",
            "usdc",
            "dai",
            "stablecoin"

        ]

    },

    # ==========================================================
    # Bitcoin
    # ==========================================================

    "bitcoin": {

        "description": "Bitcoin",

        "keywords": [

            "bitcoin",
            "btc",
            "satoshi"

        ]

    },

    # ==========================================================
    # Ethereum
    # ==========================================================

    "ethereum": {

        "description": "Ethereum",

        "keywords": [

            "ethereum",
            "eth",
            "ether"

        ]

    }

}

__all__ = [

    "CRYPTO_KEYWORDS"

]