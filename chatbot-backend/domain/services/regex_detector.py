import re
from dataclasses import dataclass

@dataclass(slots=True)
class DetectedEntity:
    type: str
    value: str

class RegexDetector:

    # Đã sửa: Thêm (?<!@) để không bắt URL nếu nó đứng ngay sau dấu @ (tránh nhầm với email)
    # Đã sửa: Xử lý dấu câu ở cuối URL bằng cách bắt kết thúc bằng chữ/số hoặc dấu /
    URL_REGEX = re.compile(
        r"""
        (?ix)
        (?<!@)                  # Negative lookbehind: Không đứng sau @
        \b
        (
            (?:
                https?://
                |www\.
            )?
            [a-z0-9]
            (?:[a-z0-9-]{0,61}[a-z0-9])?
            (?:\.[a-z0-9-]{1,63})+
            (?::\d{1,5})?
            (?:/[^\s]*[a-z0-9/])? # Path không được kết thúc bằng dấu câu (phải là chữ/số hoặc /)
        )
        \b
        """,
        re.VERBOSE,
    )

    EMAIL_REGEX = re.compile(
        r"\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b"
    )

    # Đã sửa: Dùng (?<!\d) và (?!\d) để đảm bảo số điện thoại không nằm lọt thỏm trong 1 dãy số khác
    PHONE_REGEX = re.compile(
        r"(?<!\d)(?:(?:\+84)|0)\d{9}(?!\d)"
    )

    def detect(self, text: str) -> list[DetectedEntity]:

        entities: list[DetectedEntity] = []

        for match in self.URL_REGEX.findall(text):
            entities.append(
                DetectedEntity(
                    "url",
                    match,
                )
            )

        for match in self.EMAIL_REGEX.findall(text):
            entities.append(
                DetectedEntity(
                    "email",
                    match,
                )
            )

        for match in self.PHONE_REGEX.findall(text):
            entities.append(
                DetectedEntity(
                    "phone",
                    match,
                )
            )

        return entities