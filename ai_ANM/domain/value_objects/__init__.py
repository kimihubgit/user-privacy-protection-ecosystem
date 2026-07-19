from enum import Enum


class IntentType(str, Enum):
    """
    Các intent được chatbot hỗ trợ.
    """

    CHECK_URL = "check_url"

    CHECK_PHONE = "check_phone"

    CHECK_EMAIL = "check_email"

    ASK_LAW = "ask_law"

    ASK_SCAM = "ask_scam"

    REPORT_SCAM = "report_scam"

    GENERAL_CHAT = "general_chat"