from dataclasses import dataclass


@dataclass(slots=True)
class OutsideScopeResult:

    supported: bool = False

    message: str = ""