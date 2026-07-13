"""Đọc toàn bộ tài liệu PDF từ thư mục dữ liệu."""

import logging

from langchain_community.document_loaders import DirectoryLoader, PyPDFLoader

import config

logger = logging.getLogger(__name__)


def load_documents(data_path: str = config.DATA_PATH):
    """
    Load toàn bộ file PDF trong `data_path`.

    Parameters
    ----------
    data_path : str
        Đường dẫn thư mục chứa PDF.

    Returns
    -------
    list[Document]
    """
    loader = DirectoryLoader(
        data_path,
        glob="*.pdf",
        loader_cls=PyPDFLoader,
    )

    documents = loader.load()

    logger.info("Đã load %d documents từ %s", len(documents), data_path)

    return documents
