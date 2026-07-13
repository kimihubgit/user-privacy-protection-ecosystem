"""Build mới hoặc load lại FAISS vector database."""

import logging
import os
import config

from langchain_community.vectorstores import FAISS


logger = logging.getLogger(__name__)


def build_vectorstore(chunks, embedding_model, faiss_path: str = config.FAISS_PATH) -> FAISS:
    """Tạo FAISS index mới từ chunks và lưu xuống đĩa."""

    if not chunks:
        raise ValueError("Danh sách 'chunks' đang rỗng. Không thể tạo Vector Database!")

    vectorstore = FAISS.from_documents(chunks, embedding_model)
    vectorstore.save_local(faiss_path)

    logger.info("Đã tạo và lưu FAISS index tại %s", faiss_path)

    return vectorstore


def load_vectorstore(embedding_model, faiss_path: str = config.FAISS_PATH) -> FAISS:
    """Load lại FAISS index đã tồn tại trên đĩa."""

    vectorstore = FAISS.load_local(
        faiss_path,
        embedding_model,
        allow_dangerous_deserialization=True,
    )

    logger.info("Đã load FAISS index từ %s", faiss_path)

    return vectorstore


def get_or_build_vectorstore(chunks, embedding_model, faiss_path: str = config.FAISS_PATH) -> FAISS:
    """
    Load FAISS index nếu đã tồn tại, ngược lại build mới từ chunks.

    `chunks` có thể là None nếu chỉ muốn load index có sẵn (runtime chat,
    không cần đọc lại PDF).
    """
    index_file = os.path.join(faiss_path, "index.faiss")

    if os.path.exists(index_file):
        return load_vectorstore(embedding_model, faiss_path)

    if chunks is None:
        raise FileNotFoundError(
            f"Không tìm thấy FAISS index tại {faiss_path}. "
            "Hãy chạy `python scripts/build_index.py` trước."
        )

    return build_vectorstore(chunks, embedding_model, faiss_path)
