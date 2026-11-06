from dataclasses import dataclass, field

from domain.entities.retrieved_document import (
    RetrievedDocument,
)


@dataclass(slots=True)
class Evidence:
    """
    Kết quả sau khi Retrieval Agent merge.

    Có thể chứa dữ liệu từ:

    - Cyber Law (Pinecone)
    - Scam Knowledge (Pinecone)
    - URL Checker
    - Web Search
    - Image Analysis
    """

    documents: list[RetrievedDocument] = field(
        default_factory=list,
    )

    sources: list[str] = field(
        default_factory=list,
    )

    metadata: dict = field(
        default_factory=dict,
    )

    @property
    def empty(self) -> bool:
        return len(self.documents) == 0

    @property
    def count(self) -> int:
        return len(self.documents)

    def add(
        self,
        document: RetrievedDocument,
    ) -> None:

        self.documents.append(
            document,
        )

    def extend(
        self,
        documents: list[RetrievedDocument],
    ) -> None:

        self.documents.extend(
            documents,
        )

    def add_source(
        self,
        source: str,
    ) -> None:

        if source not in self.sources:

            self.sources.append(
                source,
            )

    def merge(
        self,
        other: "Evidence",
    ) -> None:

        if not other:
            return

        self.extend(
            other.documents,
        )

        for source in other.sources:

            self.add_source(
                source,
            )

        self.metadata.update(
            other.metadata,
        )