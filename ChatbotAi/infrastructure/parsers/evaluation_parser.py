import json

from application.models.evaluation_result import (
    EvaluationResult,
)

from infrastructure.parsers.json_utils import extract_json


class EvaluationParser:

    def parse(
        self,
        response: str,
    ) -> EvaluationResult:

        try:

            data = json.loads(extract_json(response))

            return EvaluationResult(

                relevant=data["relevant"],

                confidence=data["confidence"],

                need_retry=data["need_retry"],

                reason=data.get(
                    "reason",
                    "",
                ),

            )

        except Exception:

            return EvaluationResult(

                relevant=False,

                confidence=0.0,

                need_retry=True,

                reason="Evaluation parse error.",

            )