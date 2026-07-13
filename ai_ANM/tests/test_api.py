import sys
from pathlib import Path
from unittest.mock import MagicMock, patch

import pytest
from fastapi.testclient import TestClient

# Thêm src vào sys.path để import các module dễ dàng
sys.path.insert(0, str(Path(__file__).resolve().parent.parent / "src"))

# Mock các hàm load model tại thời điểm import để tránh tải mô hình thật
with patch("embeddings.load_embedding_model"), \
     patch("embeddings.load_reranker"), \
     patch("vectorstore.get_or_build_vectorstore"), \
     patch("chain.build_rag_chain"):
    from api import app, app_state


@pytest.fixture
def client():
    """Fixture cung cấp TestClient cùng với các mô hình được giả lập (mocked)."""
    mock_vectorstore = MagicMock()
    mock_reranker = MagicMock()
    mock_rag_chain = MagicMock()

    app_state["vectorstore"] = mock_vectorstore
    app_state["reranker"] = mock_reranker
    app_state["rag_chain"] = mock_rag_chain

    with TestClient(app) as c:
        yield c

    app_state.clear()


def test_health_check_healthy(client):
    """Kiểm tra trạng thái healthy khi các mô hình đã được tải."""
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json() == {"status": "healthy", "models_loaded": True}


def test_health_check_initializing():
    """Kiểm tra trạng thái initializing khi chưa tải xong mô hình."""
    with TestClient(app) as client:
        # Xóa app_state sau khi startup đã chạy để giả lập trạng thái chưa sẵn sàng
        app_state.clear()
        response = client.get("/health")
        assert response.status_code == 200
        assert response.json() == {"status": "initializing", "models_loaded": False}


@patch("api.retrieve_documents")
@patch("api.format_context")
@patch("api.get_citations")
def test_chat_success(mock_get_citations, mock_format_context, mock_retrieve_documents, client):
    """Kiểm tra xử lý câu hỏi hỏi đáp thành công và định dạng đúng phản hồi."""
    # Thiết lập mock dữ liệu truy xuất và sinh văn bản
    mock_doc = MagicMock()
    mock_retrieve_documents.return_value = [mock_doc]
    mock_format_context.return_value = "Ngữ cảnh mẫu từ văn bản pháp luật"
    mock_get_citations.return_value = ["luat_an_ninh_mang.pdf (Trang 5)"]

    # Thiết lập mock phản hồi từ LLM Chain
    app_state["rag_chain"].invoke.return_value = "Câu trả lời tư vấn pháp luật mẫu."

    # Gọi API
    response = client.post("/chat", json={"question": "Hành vi nào bị nghiêm cấm?"})

    assert response.status_code == 200
    data = response.json()
    assert data["response"] == "Câu trả lời tư vấn pháp luật mẫu."
    assert data["citations"] == ["luat_an_ninh_mang.pdf (Trang 5)"]

    # Xác nhận các hàm liên quan được gọi đúng tham số
    mock_retrieve_documents.assert_called_once_with(
        "Hành vi nào bị nghiêm cấm?", app_state["vectorstore"], app_state["reranker"]
    )
    mock_format_context.assert_called_once_with([mock_doc])
    mock_get_citations.assert_called_once_with([mock_doc])
    app_state["rag_chain"].invoke.assert_called_once_with(
        {"question": "Hành vi nào bị nghiêm cấm?", "context": "Ngữ cảnh mẫu từ văn bản pháp luật"}
    )


def test_chat_empty_question(client):
    """Kiểm tra báo lỗi 400 khi câu hỏi rỗng."""
    response = client.post("/chat", json={"question": "   "})
    assert response.status_code == 400
    assert "detail" in response.json()


def test_chat_service_unavailable():
    """Kiểm tra báo lỗi 503 khi service chưa sẵn sàng (chưa tải xong model)."""
    with TestClient(app) as client:
        # Xóa app_state sau khi startup đã chạy để giả lập trạng thái chưa sẵn sàng
        app_state.clear()
        response = client.post("/chat", json={"question": "Hành vi bị cấm?"})
        assert response.status_code == 503
        assert "detail" in response.json()
