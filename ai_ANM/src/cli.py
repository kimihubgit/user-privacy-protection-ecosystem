"""Giao diện dòng lệnh: vòng lặp hỏi-đáp liên tục với chatbot."""
import argparse
import logging
import config

from chain import build_rag_chain
from context import format_context, get_citations
from embeddings import load_embedding_model, load_reranker
from retrieval import retrieve_documents
from vectorstore import get_or_build_vectorstore

LINE = "=" * 80


def parse_args():
    parser = argparse.ArgumentParser(description="Chatbot pháp luật RAG")
    parser.add_argument(
        "--log-level",
        default="INFO",
        choices=["DEBUG", "INFO", "WARNING", "ERROR"],
        help="Mức log hiển thị (mặc định: INFO)",
    )
    parser.add_argument(
        "--debug",
        action="store_true",
        help="Bật chế độ debug (tương đương --log-level DEBUG)",
    )
    return parser.parse_args()


def setup_logging(level: str):
    logging.basicConfig(
        level=level,
        format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
    )


def run():
    args = parse_args()
    setup_logging("DEBUG" if args.debug else args.log_level)

    logger = logging.getLogger(__name__)

    print(LINE)
    print("Đang khởi tạo chatbot, vui lòng đợi...")
    print(LINE)

    embedding_model = load_embedding_model()
    reranker = load_reranker()
    vectorstore = get_or_build_vectorstore(chunks=None, embedding_model=embedding_model)
    rag_chain = build_rag_chain()

    print(LINE)
    print("RAG Chatbot - Pháp luật An ninh mạng & An toàn thông tin")
    print("Nhập 'exit' để thoát.")
    print(LINE)

    while True:
        question = input("\nBạn: ").strip()

        if question.lower() == "exit":
            print("\nKết thúc chương trình.")
            break

        if not question:
            continue

        documents = retrieve_documents(question, vectorstore, reranker)
        context = format_context(documents) if documents else ""

        try:
            response = rag_chain.invoke({"question": question, "context": context})
        except Exception as error:
            logger.exception("Lỗi khi gọi LLM")
            print("\nBot: Xin lỗi, đã xảy ra lỗi khi gọi mô hình ngôn ngữ.")
            print(f"Chi tiết lỗi: {error}")
            print(LINE)
            continue

        print("\n" + LINE)
        print("BOT")
        print(LINE)
        print(response)

        if documents:
            citations = get_citations(documents)
            print("\nNguồn tham khảo:")
            for citation in citations:
                print(f"• {citation}")

        print(LINE)


if __name__ == "__main__":
    run()
