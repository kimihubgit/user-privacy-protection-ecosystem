# 🛡️ Hệ Thống Bảo Vệ Người Dùng & Đảm Bảo Quyền Riêng Tư (KiGuard Ecosystem)

Hệ thống tích hợp đa nền tảng giúp giám sát, phân tích các URL độc hại, giả mạo (scam/phishing) và bảo vệ thông tin người dùng. Hệ sinh thái này bao gồm các ứng dụng web (Frontend), các API hỗ trợ (Backend Auth, Backend Check), hệ thống AI phân tích và chatbot thông minh, tiện ích mở rộng Chrome (Extension), và Telegram Bot bảo mật.

---

## 📋 Yêu Cầu Hệ Thống

Trước khi khởi chạy, hãy đảm bảo máy tính của bạn đã cài đặt đầy đủ các môi trường sau:
* **Go**: Phiên bản `1.18` trở lên (để chạy các dịch vụ Backend bằng Go).
* **Node.js**: Phiên bản `18.x` hoặc `20.x` trở lên cùng với `npm`.
* **Python**: Phiên bản `3.10` trở lên (để chạy AI chatbot và Phishing Detector).
* **MongoDB**: Chạy cục bộ trên cổng `27017` hoặc sử dụng MongoDB Atlas.

---

## 🔌 Sơ Đồ Cổng Dịch Vụ (Port Mapping)

Dưới đây là cổng mặc định của các dịch vụ trong hệ thống để tránh xung đột cổng khi chạy:

| Tên Dịch Vụ | Công Nghệ | Cổng Mặc Định | Thư Mục Dự Án | Mô Tả |
| :--- | :--- | :--- | :--- | :--- |
| **Backend Check** | Go (Gin) | `8082` | `backend/backend check` | API kiểm tra URL độc hại, quản lý blocklist |
| **Backend Auth** | Go (Gin) | `8081` | `backend/backend auth` | API quản lý xác thực người dùng & Passkeys |
| **Frontend** | React + Vite | `5173` | `frontend` | Giao diện quản lý & Dashboard của người dùng/Admin |
| **AI ANM** | Python (FastAPI) | `8003` | `ai_ANM` | Chatbot tư vấn an ninh mạng (LangChain + RAG) |
| **Ai (Phishing)** | Python (FastAPI) | `8000` | `Ai` | API phân tích và phát hiện phishing tự động |

---

## 🚀 Hướng Dẫn Khởi Chạy Từng Thành Phần

Khuyến nghị khởi chạy theo thứ tự dưới đây để đảm bảo luồng hoạt động ổn định:

### 1. Khởi Động MongoDB
Chạy MongoDB cục bộ (Local) hoặc cấu hình MongoDB Atlas. Đảm bảo MongoDB đang chạy trước khi bắt đầu khởi động các Backend.

---

### 2. Dịch vụ Backend Check (Go)
Dịch vụ này chịu trách nhiệm chuẩn hóa URL, nhận diện Heuristics, quản lý blocklist và xử lý báo cáo từ người dùng.

1. Di chuyển vào thư mục:
   ```bash
   cd "backend/backend check"
   ```
2. Tạo file `.env` từ file `.env.example` và thiết lập các biến môi trường phù hợp (ví dụ: `MONGO_URI`, `ADMIN_API_KEY`).
3. Tải các thư viện liên quan:
   ```bash
   go mod tidy
   ```
4. Khởi chạy ứng dụng:
   ```bash
   go run main.go
   ```

---

### 3. Dịch vụ Backend Auth (Go)
Dịch vụ quản lý xác thực, đăng ký, đăng nhập và WebAuthn (Passkeys) cho hệ thống.

1. Di chuyển vào thư mục:
   ```bash
   cd "backend/backend auth"
   ```
2. Tạo file `.env` từ file `.env.example` và cấu hình cổng `PORT=8081` cùng khóa JWT Private/Public key phù hợp.
3. Tải các thư viện liên quan:
   ```bash
   go mod tidy
   ```
4. Khởi chạy ứng dụng:
   ```bash
   go run cmd/api/main.go
   ```

---

### 4. Giao Diện Người Dùng - Frontend (React + Vite)
Trang web quản trị, dashboard thống kê và giao diện chatbot cho người dùng.

1. Di chuyển vào thư mục:
   ```bash
   cd frontend
   ```
2. Tạo file `.env` từ file `.env.example` và đảm bảo thiết lập đúng địa chỉ kết nối đến hai Backend ở trên:
   ```env
   VITE_API_AUTH_URL=http://localhost:8081
   VITE_API_CHECK_URL=http://localhost:8082
   ```
3. Cài đặt các gói phụ thuộc:
   ```bash
   npm install
   ```
4. Khởi chạy ở chế độ phát triển:
   ```bash
   npm run dev
   ```
5. Truy cập ứng dụng tại địa chỉ: [http://localhost:5173](http://localhost:5173)

---

### 5. Tiện Ích Chrome Extension (Vue + Tailwind)
Bảo vệ người dùng trực tiếp trên trình duyệt, cảnh báo khi truy cập vào các trang độc hại và cho phép báo cáo nhanh.

1. Di chuyển vào thư mục:
   ```bash
   cd extension/chrome-ex
   ```
2. Cài đặt các gói phụ thuộc:
   ```bash
   npm install
   ```
3. Biên dịch extension sang thư mục phân phối (`dist`):
   ```bash
   npm run build
   ```
4. Cài đặt vào trình duyệt Chrome:
   - Mở Chrome và điều hướng đến địa chỉ `chrome://extensions/`.
   - Bật **Developer mode** (Chế độ nhà phát triển) ở góc trên bên phải.
   - Click chọn **Load unpacked** (Tải tiện ích đã giải nén).
   - Chọn thư mục `extension/chrome-ex/dist` vừa được tạo ra sau khi build.

---

### 6. AI ANM - Security Chatbot API (Python)
Dịch vụ chatbot AI giải đáp thắc mắc an toàn thông tin sử dụng LangChain & FAISS RAG.

1. Di chuyển vào thư mục:
   ```bash
   cd ai_ANM
   ```
2. Cài đặt các thư viện Python cần thiết:
   ```bash
   pip install -r requirements.txt
   ```
3. Khởi chạy dịch vụ ở chế độ API Server (chạy trên cổng `8003`):
   ```bash
   python main.py --api
   ```
4. *(Tùy chọn)* Nếu muốn chạy thử ở giao diện dòng lệnh (CLI):
   ```bash
   python main.py
   ```

---

### 7. AI Phishing Detector API (Python)
Mô hình và bộ công cụ AI phát hiện phishing nâng cao bằng cách kiểm tra DNS, WHOIS, và tích hợp Gemini API.

1. Di chuyển vào thư mục:
   ```bash
   cd Ai
   ```
2. Cài đặt các thư viện Python:
   ```bash
   pip install -r requirements.txt
   ```
3. Thiết lập khóa API trong file `.env`:
   ```env
   GEMINI_API_KEY=your_gemini_api_key
   GEMINI_MODEL=gemini-2.5-flash
   ```
4. Khởi chạy API với Uvicorn (chạy mặc định trên cổng `8000`):
   ```bash
   uvicorn main:app --reload --port 8000
   ```

---

### 8. Telegram Security Bot (Python)
Bot tự động hóa trên Telegram hỗ trợ người dùng kiểm tra nhanh URL lừa đảo, quyên góp và nhận thông báo bảo mật.

1. Di chuyển vào thư mục:
   ```bash
   cd bot
   ```
2. Cài đặt các thư viện:
   ```bash
   pip install -r requirements.txt
   ```
3. Cấu hình file `.env` từ file `.env.example` với `BOT_TOKEN` lấy từ `@BotFather` và các cấu hình DB liên quan.
4. Chạy file batch cài đặt môi trường (nếu trên Windows) hoặc chạy trực tiếp file python:
   ```bash
   python main.py
   ```

---

### 9. Công Cụ Crawl Dữ Liệu
Để khởi tạo dữ liệu mẫu về các trang web độc hại từ cộng đồng và nguồn dữ liệu uy tín của chính phủ:

1. Di chuyển vào thư mục:
   ```bash
   cd "crawl chongluadao"
   ```
2. Chạy script để crawl dữ liệu từ ChongLuaDao:
   ```bash
   python chongluadao.py
   ```
3. Chạy script để crawl dữ liệu cổng thông tin chính phủ:
   ```bash
   python gov.py
   ```
