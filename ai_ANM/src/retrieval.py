"""Truy xuất tài liệu liên quan từ FAISS, lọc theo ngưỡng khoảng cách
và xếp hạng lại bằng Cross-Encoder."""

import logging
import config

logger = logging.getLogger(__name__)


def retrieve_documents(
    question: str,
    vectorstore,
    reranker,
    top_k: int = config.TOP_K,
    fetch_k: int = config.FETCH_K,
    distance_threshold: float = config.DISTANCE_THRESHOLD,
):
    """
    Truy xuất documents liên quan nhất tới câu hỏi.

    Workflow
    --------
    1. FAISS similarity search (L2 distance).
    2. Nếu khoảng cách gần nhất > threshold -> coi như không liên quan.
    3. Rerank candidates bằng Cross-Encoder.
    4. Trả về top_k documents.

    Parameters
    ----------
    question : str
    vectorstore : FAISS
    reranker : CrossEncoder
    top_k : int
    fetch_k : int
    distance_threshold : float

    Returns
    -------
    list[Document]
    """
    results = vectorstore.similarity_search_with_score(query=question, k=fetch_k)

    if not results:
        return []

    best_distance = results[0][1]
    logger.debug("Nearest L2 distance: %.4f", best_distance)

    if best_distance > distance_threshold:
        logger.info("Câu hỏi bị từ chối: distance %.4f > threshold %.4f", best_distance, distance_threshold)
        return []

    candidates = [document for document, _ in results]

    pairs = [[question, document.page_content] for document in candidates]
    rerank_scores = reranker.predict(pairs)

    ranked_documents = sorted(
        zip(candidates, rerank_scores),
        key=lambda item: item[1],
        reverse=True,
    )

    top_documents = [document for document, _ in ranked_documents[:top_k]]

    return top_documents
