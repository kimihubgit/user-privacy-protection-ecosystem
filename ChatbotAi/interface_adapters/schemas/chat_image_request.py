from pydantic import BaseModel, Field


class ChatImageRequest(BaseModel):

    # Dạng data URI đầy đủ, ví dụ: "data:image/jpeg;base64,/9j/4AAQ..."
    image_base64: str = Field(
        min_length=1,
        max_length=15_000_000,
    )

    message: str = Field(
        default="",
        max_length=5000,
    )
