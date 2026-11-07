"""
Inspect Query

Công cụ hỗ trợ điền `expected_dieu` / `expected_doc_ids` vào
dataset.json cho eval retrieval (xem run_eval.py).

VectorStorePort không có hàm "fetch theo id", nên cách thực tế nhất
để biết Pinecone của bạn đang có gì là CHẠY THỬ một truy vấn và xem
kết quả trả về kèm đầy đủ metadata (id, Điều, Khoản, tên văn bản...).
Bạn tự đọc nội dung, xác nhận kết quả nào thực sự đúng, rồi copy
`id` hoặc `dieu` của nó vào dataset.json.

Chạy từ thư mục gốc project (cần .env có key Pinecone/Gemini thật):

    python -m scripts.eval.inspect_query "mức xử phạt lừa đảo qua mạng" --namespace law
    python -m scripts.eval.inspect_query "giả mạo ngân hàng" --namespace scam --top_k 10

Sau khi tìm được tài liệu đúng trong danh sách in ra, điền vào
dataset.json:

    {
      "query": "...",
      "namespace_setting": "PINECONE_NAMESPACE_LAW",
      "expected_dieu": "8",            <- copy từ cột "dieu" bên dưới
      "expected_doc_ids": ["<id>"]     <- hoặc copy từ cột "id"
    }

Chỉ cần điền MỘT trong hai (expected_dieu hoặc expected_doc_ids) là
đủ để run_eval.py tính được Recall@k/MRR — không cần điền cả hai.
"""

from __future__ import annotations

import argparse
import asyncio

from config.di_container import embedding_adapter, vector_store
from config.settings import settings

from infrastructure.retrieval.hybrid_retriever import HybridRetriever
from infrastructure.retrieval.pinecone_retriever import PineconeRetriever


NAMESPACE_CHOICES = {
    "law": "PINECONE_NAMESPACE_LAW",
    "scam": "PINECONE_NAMESPACE_SCAM",
}


def _snippet(text: str, length: int = 140) -> str:

    text = " ".join(text.split())

    return text if len(text) <= length else text[:length] + "..."


async def inspect(query: str, namespace_key: str, top_k: int) -> None:

    namespace = getattr(
        settings,
        NAMESPACE_CHOICES[namespace_key],
    )

    # Dựng retriever "thô" (không qua CachedRetriever) để luôn lấy
    # kết quả mới nhất từ Pinecone, không bị cache Redis che khuất
    # dữ liệu vừa index/cập nhật.
    dense_retriever = PineconeRetriever(
        embedding=embedding_adapter(),
        vector_store=vector_store(),
    )

    hybrid_retriever = HybridRetriever(
        dense_retriever=dense_retriever,
        alpha=0.5,
    )

    docs = await hybrid_retriever.retrieve(
        query=query,
        top_k=top_k,
        namespace=namespace,
    )

    print(f"\nQuery: {query!r}  (namespace={namespace})\n")

    if not docs:
        print("Không có kết quả nào — kiểm tra lại namespace hoặc dữ liệu đã index.")
        return

    for i, doc in enumerate(docs, start=1):

        label = (
            f"Điều {doc.dieu}" if doc.dieu else None
        )

        doc_name = doc.ten_van_ban or doc.source_file or doc.source

        print(f"[{i}] id={doc.id}  score={doc.score:.4f}")

        if label:
            print(f"    dieu={doc.dieu!r}  ten_van_ban={doc_name!r}  so_hieu={doc.so_hieu!r}")
        else:
            print(f"    source={doc_name!r}")

        print(f"    content: {_snippet(doc.content)}\n")


def main() -> None:

    parser = argparse.ArgumentParser(
        description="Xem metadata (id/dieu) của kết quả retrieval để điền ground truth vào dataset.json",
    )

    parser.add_argument("query", help="Câu truy vấn cần tra cứu")

    parser.add_argument(
        "--namespace",
        choices=list(NAMESPACE_CHOICES),
        required=True,
        help="law = PINECONE_NAMESPACE_LAW, scam = PINECONE_NAMESPACE_SCAM",
    )

    parser.add_argument(
        "--top_k",
        type=int,
        default=10,
        help="Số kết quả hiển thị (mặc định 10, nên để rộng hơn 5 để dễ chọn)",
    )

    args = parser.parse_args()

    asyncio.run(
        inspect(args.query, args.namespace, args.top_k),
    )


if __name__ == "__main__":
    main()
