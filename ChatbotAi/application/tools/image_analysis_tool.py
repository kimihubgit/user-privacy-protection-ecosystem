from application.tools.base_tool import BaseTool

from infrastructure.external.vtrust_image_adapter import (
    VtrustImageAdapter,
)


class ImageAnalysisTool(BaseTool):

    name = "image_analysis"

    description = "Phân tích hình ảnh"

    def __init__(
        self,
        checker: VtrustImageAdapter,
    ):
        self._checker = checker

    async def execute(
        self,
        image: bytes,
    ):
        return await self._checker.analyze(
            image=image,
        )