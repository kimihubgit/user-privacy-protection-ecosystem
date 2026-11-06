import json

from application.models.tool_call import ToolCall

from infrastructure.parsers.json_utils import extract_json
from observability.logger import logger


class ToolCallParser:

    def parse(
        self,
        response: str,
    ) -> list[ToolCall]:

        try:

            data = json.loads(extract_json(response))

            tools = data.get("tools", [])

            result: list[ToolCall] = []

            for item in tools:

                result.append(

                    ToolCall(

                        tool=item["tool"],

                        arguments=item.get(
                            "arguments",
                            {},
                        ),

                    )

                )

            return result

        except Exception as ex:

            logger.warning(
                f"[tool-call-parser] Lỗi parse JSON từ Planner: {ex}. "
                f"Raw response: {response!r}",
            )

            return []