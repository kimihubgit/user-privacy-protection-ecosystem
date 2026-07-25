import json

from application.models.validation_result import (
    ValidationResult,
)

from infrastructure.parsers.json_utils import extract_json


class ValidationParser:

    def parse(
        self,
        response: str,
    ) -> ValidationResult:

        try:

            data = json.loads(extract_json(response))

            return ValidationResult(

                grounded=data["grounded"],

                confidence=data.get("confidence", 0.0),

                unsupported_claims=data.get(
                    "unsupported_claims",
                    [],
                ),

            )

        except Exception:

            # Fail-safe: nếu parse lỗi, coi như CHƯA chắc chắn grounded
            # (không tự tin khẳng định an toàn khi không chắc).
            return ValidationResult(

                grounded=False,

                confidence=0.0,

                unsupported_claims=["Validation parse error."],

            )
