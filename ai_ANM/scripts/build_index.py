"""Script build/rebuild FAISS index từ PDF trong data/pdf.

Chạy: python scripts/build_index.py
"""

import logging
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent / "src"))

from chunking import split_documents  
from data_loader import load_documents  
from embeddings import load_embedding_model  
from vectorstore import build_vectorstore  

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger(__name__)


def main():
    logger.info("Bắt đầu build FAISS index...")

    documents = load_documents()
    if not documents:
        logger.error("Không tìm thấy PDF nào trong data/pdf. Dừng lại.")
        return

    chunks = split_documents(documents)
    embedding_model = load_embedding_model()

    build_vectorstore(chunks, embedding_model)

    logger.info("Hoàn tất build FAISS index.")


if __name__ == "__main__":
    main()
