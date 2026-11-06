import json

from application.models.risk_result import RiskResult

from infrastructure.parsers.json_utils import extract_json


class RiskParser:

    def parse(
        self,
        response: str,
    ) -> RiskResult:

        try:

            data = json.loads(extract_json(response))

            return RiskResult(

                risk_level=data.get(
                    "risk_level",
                    "UNKNOWN",
                ),

                score=data.get(
                    "score",
                    0,
                ),

                confidence=data.get(
                    "confidence",
                    0.0,
                ),

                reasons=data.get(
                    "reasons",
                    [],
                ),
            )

        except Exception:

            return RiskResult(

                risk_level="UNKNOWN",

                score=0,

                confidence=0,

                reasons=[
                    "Không phân tích được rủi ro."
                ],
            )