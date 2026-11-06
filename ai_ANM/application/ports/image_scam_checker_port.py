from abc import ABC
from abc import abstractmethod

from domain.entities.agent_response import AgentResponse


class ImageScamCheckerPort(ABC):

    @abstractmethod
    async def analyze_image(
        self,
        image_base64: str,
        message: str = "",
    ) -> AgentResponse:
        ...
