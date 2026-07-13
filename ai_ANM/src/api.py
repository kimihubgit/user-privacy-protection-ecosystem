"""API Server: Cung cấp endpoint cho chatbot hỏi đáp pháp luật."""

import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel

import config
from chain import build_rag_chain
from context import format_context, get_citations
from embeddings import load_embedding_model, load_reranker
from retrieval import retrieve_documents
from vectorstore import get_or_build_vectorstore

logger = logging.getLogger(__name__)

# State lưu trữ các mô hình sau khi load
app_state = {}


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Quản lý vòng đời ứng dụng: Load models khi startup và dọn dẹp khi shutdown."""
    logger.info("Bắt đầu khởi tạo các mô hình RAG cho API...")
    try:
        embedding_model = load_embedding_model()
        reranker = load_reranker()
        vectorstore = get_or_build_vectorstore(chunks=None, embedding_model=embedding_model)
        rag_chain = build_rag_chain()

        app_state["vectorstore"] = vectorstore
        app_state["reranker"] = reranker
        app_state["rag_chain"] = rag_chain
        logger.info("Khởi tạo mô hình thành công!")
    except Exception as e:
        logger.exception("Lỗi nghiêm trọng khi khởi tạo các mô hình RAG")
        raise e

    yield
    # Dọn dẹp tài nguyên khi shutdown
    app_state.clear()
    logger.info("Đã dọn dẹp tài nguyên API.")


app = FastAPI(
    title="RAG Chatbot API - Pháp luật An ninh mạng & An toàn thông tin",
    description="API cung cấp dịch vụ hỏi đáp RAG dựa trên các văn bản luật Việt Nam.",
    version="1.0.0",
    lifespan=lifespan,
)


class QueryRequest(BaseModel):
    question: str


class QueryResponse(BaseModel):
    response: str
    citations: list[str]


@app.get("/health", summary="Kiểm tra trạng thái hệ thống")
async def health_check():
    """Kiểm tra xem hệ thống và các mô hình đã sẵn sàng hay chưa."""
    initialized = (
        "vectorstore" in app_state
        and "reranker" in app_state
        and "rag_chain" in app_state
    )
    return {
        "status": "healthy" if initialized else "initializing",
        "models_loaded": initialized,
    }


@app.post("/chat", response_model=QueryResponse, summary="Hỏi đáp pháp luật RAG")
async def chat(request: QueryRequest):
    """
    Tiếp nhận câu hỏi, thực hiện truy xuất văn bản luật, 
    rerank ngữ cảnh và gọi LLM trả về câu trả lời có trích dẫn nguồn.
    """
    question = request.question.strip()
    if not question:
        raise HTTPException(status_code=400, detail="Câu hỏi không được để trống.")

    vectorstore = app_state.get("vectorstore")
    reranker = app_state.get("reranker")
    rag_chain = app_state.get("rag_chain")

    if not (vectorstore and reranker and rag_chain):
        raise HTTPException(
            status_code=503,
            detail="Các mô hình đang được tải hoặc chưa được khởi tạo thành công. Vui lòng thử lại sau.",
        )

    try:
        # 1. Truy xuất các tài liệu liên quan và thực hiện rerank
        documents = retrieve_documents(question, vectorstore, reranker)
        context = format_context(documents) if documents else ""

        # 2. Gọi RAG chain sinh câu trả lời
        response = rag_chain.invoke({"question": question, "context": context})

        # 3. Trích xuất danh sách nguồn tham khảo
        citations = get_citations(documents) if documents else []

        return QueryResponse(response=response, citations=citations)

    except Exception as e:
        logger.exception("Lỗi khi xử lý câu hỏi hỏi đáp RAG")
        raise HTTPException(status_code=500, detail=f"Lỗi hệ thống: {str(e)}")
