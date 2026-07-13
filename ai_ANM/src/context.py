"""Chuyển documents đã truy xuất thành context cho LLM và danh sách trích dẫn."""

import os


def format_context(documents) -> str:
    """Ghép documents thành 1 chuỗi context, kèm nguồn và số trang."""

    contexts = []

    for document in documents:
        filename = os.path.basename(document.metadata.get("source", ""))
        page = document.metadata.get("page", 0) + 1

        contexts.append(
            f"""
Nguồn: {filename}
Trang: {page}

{document.page_content}
"""
        )

    return "\n\n".join(contexts)


def get_citations(documents) -> list[str]:
    """Trích danh sách nguồn tham khảo duy nhất (giữ thứ tự xuất hiện)."""

    citations = [
        f"{os.path.basename(doc.metadata.get('source', ''))} (Trang {doc.metadata.get('page', 0) + 1})"
        for doc in documents
    ]

    return list(dict.fromkeys(citations))
