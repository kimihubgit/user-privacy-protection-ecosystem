"""Cấu hình tập trung cho toàn bộ hệ thống RAG."""

import os
from pathlib import Path

from dotenv import load_dotenv

load_dotenv()

# ==========================================================
# ĐƯỜNG DẪN
# ==========================================================

BASE_DIR = Path(__file__).resolve().parent.parent

DATA_PATH = str(BASE_DIR / "data" / "pdf")
FAISS_PATH = str(BASE_DIR / "data" / "faiss_index")

# ==========================================================
# MODELS
# ==========================================================

EMBEDDING_MODEL_NAME = "bkai-foundation-models/vietnamese-bi-encoder"
LLM_MODEL_NAME = "llama-3.1-8b-instant"
RERANKER_MODEL_NAME = "cross-encoder/mmarco-mMiniLMv2-L12-H384-v1"

# ==========================================================
# API KEY (đọc từ .env, KHÔNG hardcode)
# ==========================================================

GROQ_API_KEY = os.getenv("GROQ_API_KEY")

# ==========================================================
# RETRIEVAL PARAMETERS
# ==========================================================

TOP_K = 5             # số chunk cuối cùng đưa vào LLM sau khi rerank
FETCH_K = 20           # số chunk lấy ra từ FAISS trước khi rerank
LAMBDA_MULT = 0.7      # hệ số MMR (nếu dùng MMR search)

# Với FAISS IndexFlatL2: distance càng nhỏ càng giống.
DISTANCE_THRESHOLD = 0.75
