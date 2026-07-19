from dataclasses import dataclass, field
from datetime import datetime, UTC
from uuid import uuid4


@dataclass(slots=True)
class ScamReport:
    """
    Thông tin báo cáo lừa đảo.
    """

    reporter: str

    description: str

    evidence: list[str] = field(default_factory=list)

    id: str = field(default_factory=lambda: str(uuid4()))

    created_at: datetime = field(
        default_factory=lambda: datetime.now(UTC)
    )