"""Configuration package for AI Anti-Scam Chatbot.

Provides centralized application settings.
"""

from config.settings import Settings, get_settings, settings

__all__ = [
    "Settings",
    "get_settings",
    "settings",
]
