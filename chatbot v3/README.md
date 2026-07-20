# Chatbot RAG Backend (Gemini + Pinecone)

Backend cho chatbot AI của website Chống Lừa Đảo, theo kiến trúc **RAG (Retrieval-Augmented Generation)**:

```
User hỏi
   │
   ▼
[1] Gemini Embedding  → tạo vector cho câu hỏi
   │
   ▼
[2] Pinecone           → tìm top-K đoạn văn bản liên quan (đã có sẵn dữ liệu)
   │
   ▼
[3] Ghép prompt         → persona (agent) + ngữ cảnh truy hồi + lịch sử hội thoại
   │
   ▼
[4] Gemini Generate     → sinh câu trả lời tiếng Việt
   │
   ▼
Trả JSON { response, sources } về frontend
```

## Khớp với frontend hiện có

`vite.config.js` của frontend đã cấu hình sẵn proxy:

```js
proxy: {
  '/chat-api': {
    target: 'http://localhost:8003',
    rewrite: (path) => path.replace(/^\/chat-api/, '')
  }
}
```

→ Backend này phải chạy ở **cổng 8003** và expose route `POST /chat` (không có prefix `/chat-api`).
Frontend gọi `fetch('/chat-api/chat', ...)`, Vite sẽ tự chuyển thành `http://localhost:8003/chat`.

Request body: `{ question: string, agentId?: string, history?: Array<{sender, text}> }`
Response body: `{ response: string, sources?: [...] }` — frontend hiện chỉ đọc `data.response`.

## Cài đặt

```bash
cd chatbot-backend
npm install
cp .env.example .env
# điền GEMINI_API_KEY, PINECONE_API_KEY, PINECONE_INDEX_NAME...
npm run dev
```

## ⚠️ Lưu ý quan trọng về embedding

Vì dữ liệu trong Pinecone **đã được nạp sẵn từ trước**, bạn bắt buộc phải:

1. Xác định chính xác **model embedding** đã dùng để tạo vector khi nạp dữ liệu vào Pinecone
   (ví dụ `text-embedding-004`, `gemini-embedding-001`...) và **số chiều (dimension)** của index.
2. Cấu hình đúng `GEMINI_EMBEDDING_MODEL` và `GEMINI_EMBEDDING_DIMENSION` trong `.env` để trùng khớp.
   Nếu câu hỏi được embed bằng model/chiều khác với dữ liệu đã lưu, kết quả truy hồi (retrieval)
   sẽ sai lệch hoặc không trả về kết quả nào.
3. Kiểm tra `PINECONE_TEXT_FIELD` — tên field trong `metadata` chứa nội dung văn bản gốc của mỗi chunk
   (mặc định giả định là `text`, hãy đổi lại nếu dữ liệu của bạn đặt tên khác, ví dụ `content`, `chunk_text`...).

Bạn có thể kiểm tra nhanh cấu trúc dữ liệu hiện có bằng cách gọi `index.describeIndexStats()`
hoặc xem lại script/pipeline đã dùng để nạp dữ liệu vào Pinecone trước đó.

## Cấu trúc thư mục

```
src/
  config.js              # đọc biến môi trường
  server.js               # khởi tạo Express app
  routes/chat.js           # route POST /chat
  services/geminiService.js   # embedding + generate qua Gemini
  services/pineconeService.js # truy vấn vector Pinecone
  services/ragService.js      # ghép pipeline RAG hoàn chỉnh
  agents/personas.js          # system prompt cho từng "trợ lý" (AI, Hoàng Minh, Minh An...)
```

## Đa persona (multi-agent)

Frontend cho phép người dùng chọn 1 trong 6 "trợ lý" (agent pill ở đầu trang chat: AI, Hoàng Minh,
Minh An, Tiểu Lâm, Tiểu Mỹ, Tiểu Hồng). Backend nhận `agentId` tương ứng và áp dụng persona
riêng (định nghĩa trong `src/agents/personas.js`) khi ghép system prompt — cùng một nguồn dữ liệu
Pinecone, nhưng văn phong/trọng tâm trả lời sẽ khác nhau theo từng trợ lý.

## Triển khai production

- Đặt `chatbot-backend` chạy như một service riêng (PM2, Docker, hoặc container trên Cloud Run/EC2...).
- Đổi `CORS_ORIGIN` thành domain thật của frontend khi build production, và đổi `target` trong
  cấu hình reverse proxy (Nginx/Vite chỉ dùng cho dev) trỏ đúng vào service backend.
- Không commit file `.env` chứa API key thật lên git.

## Có thể mở rộng thêm

- **Streaming**: đổi `generateContent` sang `generateContentStream` + Server-Sent Events để trả lời
  hiển thị dần từng chữ trên giao diện.
- **Rerank**: thêm bước rerank (ví dụ Cohere Rerank) sau khi lấy top-K từ Pinecone để tăng độ chính xác.
- **Rate limiting**: thêm `express-rate-limit` để chống spam endpoint chat.
- **Ingestion script**: nếu sau này cần nạp thêm dữ liệu mới vào Pinecone, có thể viết thêm
  script riêng (chunk văn bản → embed bằng đúng model đã chọn ở trên → upsert vào Pinecone).
