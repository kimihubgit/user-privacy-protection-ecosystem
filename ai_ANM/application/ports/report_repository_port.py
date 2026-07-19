from abc import ABC, abstractmethod

from domain.entities.scam_report import ScamReport


class ReportRepositoryPort(ABC):

    @abstractmethod
    async def save(
        self,
        report: ScamReport,
    ) -> None:
        raise NotImplementedError