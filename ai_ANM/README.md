# Chatbot Pháp Luật (RAG)

Chatbot hỏi-đáp pháp luật Việt Nam (An ninh mạng & An toàn thông tin) dựa trên RAG
(Retrieval-Augmented Generation), sử dụng FAISS + Cross-Encoder reranker + Groq LLM.

## Cấu trúc project

```
chatbot-law/
├── main.py                     # chạy chatbot: python main.py
├── .env                        # API_KEY thật (tự tạo, không commit)
├── requirements.txt
│
├── data/
│   ├── pdf/                    # đặt file PDF luật vào đây
│   └── faiss_index/            # vector DB, tự sinh khi build index
│
├── src/chatbot_law/            # package chính
│   ├── config.py
│   ├── data_loader.py
│   ├── chunking.py
│   ├── embeddings.py
│   ├── vectorstore.py
│   ├── retrieval.py
│   ├── context.py
│   ├── prompts.py
│   ├── chain.py
│   └── cli.py
│
├── scripts/build_index.py      # build/rebuild FAISS index
└── tests/
```

## Cài đặt

```bash
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
pip install -r requirements.txt
```

Tạo file `.env` từ mẫu và điền API key:

```bash
cp .env
# sửa .env: GROQ_API_KEY=your_key
```

## Sử dụng

1. Đặt các file PDF luật vào `data/pdf/`.
2. Build FAISS index (chỉ cần chạy lại khi thêm/sửa PDF):

```bash
python scripts/build_index.py
```

3. Chạy chatbot:

```bash
python main.py
```

Thêm `--debug` để xem log chi tiết (khoảng cách retrieval, v.v.):

```bash
python main.py --debug
```

## Chạy test

```bash
pip install pytest
pytest tests/
```
