import json

from domain.entities.intent import Intent
from domain.value_objects.intent_type import IntentType


class IntentParser:

    _mapping = {
        "CHECK_URL": IntentType.CHECK_URL,
        "CHECK_PHONE": IntentType.CHECK_PHONE,
        "CHECK_EMAIL": IntentType.CHECK_EMAIL,
        "ASK_LAW": IntentType.ASK_LAW,
        "ASK_SCAM": IntentType.ASK_SCAM,
        "REPORT_SCAM": IntentType.REPORT_SCAM,
        "GENERAL_CHAT": IntentType.GENERAL_CHAT,
    }

    def parse(
        self,
        text: str,
    ) -> Intent:

        text = text.replace(
            "```json",
            "",
        )

        text = text.replace(
            "```",
            "",
        ).strip()

        data = json.loads(text)

        return Intent(

            intent_type=self._mapping.get(

                data["intent"].upper(),

                IntentType.GENERAL_CHAT,

            ),

            corrected_text=data.get(
                "corrected_text",
                "",
            ),

            entities=data.get(
                "entities",
                {},
            ),

            confidence=float(

                data.get(
                    "confidence",
                    0.0,
                )

            ),

        )