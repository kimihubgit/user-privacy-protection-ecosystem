from pydantic import BaseModel

from app.presentation.api.schemas.collector_result import RedirectItem

class CollectorResponse(BaseModel):

    url: str

    hostname: str

    domain: str

    final_url: str

    status_code: int

    content_type: str

    title: str

    emails: list[str]

    phones: list[str]

    ipv4: list[str]

    ipv6: list[str]

    redirect_chain: list[RedirectItem]

    response_headers: dict[str, str]