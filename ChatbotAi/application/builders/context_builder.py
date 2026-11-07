from application.models.evidence import Evidence
from domain.entities.retrieved_document import RetrievedDocument


class ContextBuilder:
    """
    Chuẩn hóa Evidence trước khi gửi cho LLM.

    - Remove Duplicate
    - Sort theo score
    - Top-K
    - Truncate content
    - Build Context
    - Build Sources
    """

    MAX_DOCS = 5

    MAX_CONTENT = 1000

    @classmethod
    def build_context(
        cls,
        evidence: Evidence,
    ) -> str:

        docs = cls.prepare(
            evidence.documents,
        )

        if not docs:
            return "Không có bằng chứng."

        blocks = []

        for index, doc in enumerate(
            docs,
            start=1,
        ):

            citation = doc.legal_citation

            if citation:
                # Tài liệu luật (schema mới: Điều/Khoản/Điểm...)
                header = f"Nguồn: {citation}"
            else:
                # Tài liệu khác (scam_knowledge, web_search...)
                header = f"Nguồn: {doc.source}"

                if doc.page:
                    header += f"\n\nTrang: {doc.page}"

            block = f"""
### Evidence {index}

{header}

Độ liên quan: {doc.score:.3f}

Nội dung:

{doc.content}
""".strip()

            if doc.url:
                block += f"\n\nURL: {doc.url}"

            blocks.append(block)

        return "\n\n-------------------------\n\n".join(
            blocks,
        )

    @classmethod
    def build_sources(
        cls,
        evidence: Evidence,
    ) -> str:

        docs = cls.prepare(
            evidence.documents,
        )

        if not docs:
            return ""

        rows = []

        for doc in docs:

            citation = doc.legal_citation

            if citation:
                row = f"- {citation}"
            else:
                row = f"- {doc.source}"

                if doc.page:
                    row += f" (Trang {doc.page})"

            if doc.url:
                row += f"\n  {doc.url}"

            rows.append(row)

        return "\n".join(rows)

    @classmethod
    def prepare(
        cls,
        docs: list[RetrievedDocument],
    ) -> list[RetrievedDocument]:

        docs = cls.remove_duplicate(
            docs,
        )

        docs = sorted(
            docs,
            key=lambda x: x.score,
            reverse=True,
        )

        docs = docs[: cls.MAX_DOCS]

        result = []

        for doc in docs:

            content = doc.content

            if len(content) > cls.MAX_CONTENT:
                content = content[: cls.MAX_CONTENT] + "..."

            result.append(
                RetrievedDocument(
                    id=doc.id,
                    content=content,
                    source=doc.source,
                    score=doc.score,
                    metadata=doc.metadata,
                )
            )

        return result

    @staticmethod
    def remove_duplicate(
        docs: list[RetrievedDocument],
    ) -> list[RetrievedDocument]:

        result = []

        seen = set()

        for doc in docs:

            # Dùng thêm Điều/Khoản/Điểm (nếu có) vào key để không
            # gộp nhầm 2 điều luật khác nhau nhưng vô tình có 150 ký
            # tự đầu content giống nhau (vd: cùng mở đầu "Điều ...
            # quy định về...").
            key = (
                doc.source,
                doc.metadata.get("dieu"),
                doc.metadata.get("khoan"),
                doc.metadata.get("diem"),
                doc.page,
                doc.content[:150],
            )

            if key in seen:
                continue

            seen.add(key)

            result.append(doc)

        return result
