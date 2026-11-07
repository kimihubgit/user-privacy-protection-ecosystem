"""
Evidence Database
-----------------

Gambling Keyword Database

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

GAMBLING_KEYWORDS: dict[str, dict] = {

    # ==========================================================
    # Casino
    # ==========================================================

    "casino": {

        "description": "Casino",

        "keywords": [

            "casino",
            "online casino",
            "live casino",
            "virtual casino",
            "casino game"

        ]

    },

    # ==========================================================
    # Betting
    # ==========================================================

    "betting": {

        "description": "Betting",

        "keywords": [

            "bet",
            "betting",
            "sports betting",
            "football betting",
            "live betting",
            "odds"

        ]

    },

    # ==========================================================
    # Lottery
    # ==========================================================

    "lottery": {

        "description": "Lottery",

        "keywords": [

            "lottery",
            "lucky draw",
            "jackpot",
            "powerball",
            "mega jackpot"

        ]

    },

    # ==========================================================
    # Poker
    # ==========================================================

    "poker": {

        "description": "Poker",

        "keywords": [

            "poker",
            "texas holdem",
            "holdem",
            "blackjack",
            "roulette",
            "baccarat"

        ]

    },

    # ==========================================================
    # Slot
    # ==========================================================

    "slot": {

        "description": "Slot Game",

        "keywords": [

            "slot",
            "slot game",
            "slot machine",
            "slot online",
            "jackpot slot"

        ]

    },

    # ==========================================================
    # Gambling
    # ==========================================================

    "gambling": {

        "description": "Gambling",

        "keywords": [

            "gambling",
            "gamble",
            "wager",
            "bookmaker",
            "bookie"

        ]

    },

    # ==========================================================
    # Promotion
    # ==========================================================

    "promotion": {

        "description": "Promotion",

        "keywords": [

            "welcome bonus",
            "deposit bonus",
            "bonus code",
            "cashback",
            "free spin",
            "free bet"

        ]

    },

    # ==========================================================
    # Deposit
    # ==========================================================

    "deposit": {

        "description": "Deposit",

        "keywords": [

            "deposit",
            "withdraw",
            "instant withdrawal",
            "quick withdrawal",
            "minimum deposit"

        ]

    },

    # ==========================================================
    # VIP
    # ==========================================================

    "vip": {

        "description": "VIP Program",

        "keywords": [

            "vip",
            "vip club",
            "vip member",
            "loyalty program"

        ]

    },

    # ==========================================================
    # Game
    # ==========================================================

    "game": {

        "description": "Game",

        "keywords": [

            "game provider",
            "live dealer",
            "gaming platform",
            "casino platform"

        ]

    }

}

__all__ = [

    "GAMBLING_KEYWORDS"

]