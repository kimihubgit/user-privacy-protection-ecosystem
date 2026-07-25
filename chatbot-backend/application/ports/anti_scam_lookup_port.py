from abc import ABC
from abc import abstractmethod

from domain.entities.agent_response import AgentResponse


class AntiScamLookupPort(ABC):

    @abstractmethod
    async def check_url(
        self,
        url: str,
    ) -> AgentResponse:
        ...

    @abstractmethod
    async def check_phone(
        self,
        phone: str,
    ) -> AgentResponse:
        ...

    @abstractmethod
    async def check_email(
        self,
        email: str,
    ) -> AgentResponse:
        ...