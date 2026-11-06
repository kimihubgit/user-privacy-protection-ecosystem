import sys

file_path = r'C:\Users\vkhai\.gemini\antigravity-ide\brain\6648da3b-744f-434a-bdd3-82774f751f63\kiguard_essay_complete_chapters.md'

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

old_section = """### 3.3. Kiến trúc Thư mục Dự án

Toàn bộ mã nguồn dự án được tổ chức cấu trúc thư mục mạch lạc theo chuẩn Monorepo:

```
user-privacy-protection-ecosystem/
├── backend/                      # Core Backend bằng Golang (Gin)
│   ├── cmd/                      # Các điểm khởi chạy ứng dụng (Main entrypoints)
│   │   ├── auth/                 # Main Service Auth (Port 8081)
│   │   └── check/                # Main Service Check URL (Port 8082)
│   ├── internal/                 # Mã nguồn nội bộ Backend (Encapsulated code)
│   │   ├── auth/                 # Xử lý Logic Đăng ký, Passkey WebAuthn & JWT RS256
│   │   ├── check/                # Engine RAM Cuckoo Filter & Singleflight Worker
│   │   ├── database/             # Driver kết nối MongoDB & Khởi tạo Index
│   │   ├── middleware/           # Middleware Auth RS256, CORS, Rate Limit, Security Headers
│   │   └── models/               # Go Struct Models (User, ScamURL, Report, CheckLog)
│   ├── config/                   # Cấu hình môi trường & Load Keys RSA
│   ├── go.mod                    # Quản lý phụ thuộc Go Modules
│   └── go.sum
│
├── extension/                    # Chrome Extension Manifest V3
│   ├── chrome-ex/src/
│   │   ├── background/           # Background Service Worker
│   │   │   ├── background.js     # Entrypoint Service Worker
│   │   │   └── services/         # Services chuyên biệt (NavigationShield, TrackingParams, ProxyAdvanced, Gpc, CookieAutoDelete)
│   │   ├── content/              # Content Scripts tác động cây DOM
│   │   │   └── content.js        # Engine MutationObserver & CSS Blur PII
│   │   ├── popup/                # Giao diện Popup Extension Main Toolbar
│   │   └── manifest.json         # Khai báo Quyền hạn Extension Manifest V3
│
├── frontend/                     # Cổng thông tin Web Portal (React.js + Vite)
│   ├── src/
│   │   ├── assets/               # Hình ảnh, biểu tượng SVG, tài nguyên tĩnh
│   │   ├── components/           # Các UI Components tái sử dụng (Navbar, Sidebar, Modal)
│   │   ├── pages/                # Các màn hình (Home, Login, PasskeyRegister, Dashboard, Reports, AdminAudit)
│   │   ├── services/             # Axios Client RESTful API & Kết nối WebSocket
│   │   └── App.jsx               # Routing chính React Router v6
│   ├── package.json
│   └── vite.config.js
│
├── Ai/                           # AI Phishing Detector (Python FastAPI)
│   ├── main.py                   # REST API endpoints (/detect, /check/ai-scan)
│   ├── collector/                # Modules cào dữ liệu WHOIS, DNS, HTML DOM
│   └── requirements.txt          # Các thư viện Python phụ thuộc
│
├── ai_ANM/                       # AI ANM Security Chatbot (RAG Engine)
│   ├── main.py                   # WebSocket endpoint (/ws/chat)
│   ├── vector_db/                # CSDL Vector FAISS lưu trữ dữ liệu Luật ANM 2018
│   └── requirements.txt
│
├── bot/                          # Telegram Bot Service (Python)
│   └── bot.js / bot.py           # Tiếp nhận lệnh /check và gọi Backend Check
└── README.md                     # Tài liệu hướng dẫn cài đặt & vận hành hệ thống
```

#### Mô tả Chi tiết các Thư mục Chính:
*   `backend/cmd`: Chứa các hàm `main()` riêng biệt để khởi chạy song song 2 dịch vụ độc lập `auth_server` (Port 8081) và `check_server` (Port 8082).
*   `backend/internal/middleware`: Chứa Middleware kiểm tra Token JWT RS256, Rate Limiter chống DDoS và Security Headers bảo mật.
*   `extension/chrome-ex/src/background/services`: Chứa các dịch vụ chạy ngầm của Extension xử lý xóa tham số theo dõi (`TrackingParamsService.js`), định tuyến Proxy (`ProxyAdvancedService.js`) và chèn Header GPC (`GpcService.js`).
*   `Ai/collector`: Chứa bộ công cụ cào thông tin WHOIS tên miền, trích xuất bản ghi DNS và phân tích cấu trúc cây DOM HTML của trang web nghi ngờ."""

new_section = """### 3.3. Kiến trúc Thư mục Dự án (Project Directory Architecture)

#### 3.3.1. Mô hình Kiến trúc Tổ chức Mã nguồn (Architectural Pattern)

Mã nguồn của Hệ sinh thái KiGuard được thiết kế kết hợp 4 mô hình kiến trúc chuẩn trong kỹ thuật phần mềm hiện đại:

1.  **Mô hình Kiến trúc Monorepo Đa Dịch vụ (Multi-service Monorepo Architecture)**:
    Toàn bộ 4 phân hệ độc lập (Core Backend Golang, Chrome Extension Manifest V3, Web Portal ReactJS và AI Services Python) được quản lý tập trung trong cùng một kho lưu trữ (Repository) duy nhất. Mô hình này giúp duy trì **Single Source of Truth**, đồng bộ phiên bản mã nguồn giữa Client và Server mà không phải quản lý nhiều repo rời rạc.

2.  **Mô hình Kiến trúc Sạch Standard Go Layout (Standard Go Project Layout)**:
    Phân hệ Core Backend Golang tuân thủ nghiêm ngặt chuẩn kiến trúc thư mục cộng đồng Go:
    *   Tách biệt tuyệt đối giữa các file thực thi điểm khởi chạy (`cmd/`) và các module logic xử lý nghiệp vụ nội bộ (`internal/`).
    *   Ứng dụng nguyên lý **Encapsulation & Dependency Inversion**: Thư mục `internal/` được trình biên dịch Go bảo vệ, ngăn chặn các gói bên ngoài import dữ liệu hoặc logic private trái phép.

3.  **Mô hình Component-Based Architecture (Frontend Web Portal)**:
    Phân hệ Web Portal thiết kế theo kiến trúc dựa trên thành phần (Component-based) của React.js, chia nhỏ giao diện thành các đơn vị UI độc lập, có khả năng tái sử dụng cao (`components/`, `pages/`, `layouts/`).

4.  **Mô hình Modular Service Worker Architecture (Chrome Extension Manifest V3)**:
    Phân hệ Extension phân rã các tính năng bảo vệ thành các dịch vụ chạy ngầm chuyên biệt (`NavigationShield`, `TrackingParamsService`, `ProxyAdvancedService`, `GpcService`, `CookieAutoDeleteService`) dưới sự quản lý của một Service Worker trung tâm (`background.js`).

---

#### 3.3.2. Ưu điểm và Lợi thế Kỹ thuật của Kiến trúc

*   **Tính Đóng gói và Bảo mật Cao (Strict Encapsulation & Security)**:
    Việc đặt toàn bộ business logic trong thư mục `backend/internal/` đảm bảo mã nguồn Backend không bị truy cập hoặc phụ thuộc vòng (circular dependency). Các struct models, helper functions chỉ được xuất bản qua các Interface chuẩn.
*   **Tối ưu hóa Tiến trình Quản lý và Triển khai (CI/CD Pipeline Optimization)**:
    Cấu trúc Monorepo cho phép xây dựng các kịch bản Docker build và CI/CD thử nghiệm tự động. Khi có thay đổi ở phân hệ nào, tiến trình tích hợp liên tục chỉ cần kiểm thử phân hệ đó mà không phải rebuild lại toàn bộ dự án.
*   **Khả năng Mở rộng theo Chiều ngang (High Scalability & Loose Coupling)**:
    Sự phân rã độc lập giữa Core Backend (Golang) và các Dịch vụ AI (Python FastAPI) giúp hai phân hệ có thể nâng cấp, bảo trì hoặc mở rộng số lượng node Server trên Docker/Kubernetes một cách hoàn toàn độc lập, không làm ảnh hưởng đến tính sẵn sàng của hệ thống.
*   **Khả năng Tái sử dụng và Dễ Bảo trì (Maintainability & Reusability)**:
    Các components giao diện (Navbar, Cards, Modals) và các helper services được mô đun hóa giúp lập trình viên dễ dàng khoanh vùng lỗi, bảo trì mã nguồn và thêm tính năng mới mà không lo tác động lây lan (side-effects).

---

#### 3.3.3. Sơ đồ Cây Thư mục Mã nguồn Chi tiết (Directory Tree)

```
user-privacy-protection-ecosystem/
├── backend/                      # Core Backend bằng Golang (Gin Framework)
│   ├── cmd/                      # Các điểm khởi chạy ứng dụng (Main Entrypoints)
│   │   ├── auth/                 # Entrypoint khởi chạy Auth Server (Port 8081)
│   │   │   └── main.go
│   │   └── check/                # Entrypoint khởi chạy Check Server (Port 8082)
│   │       └── main.go
│   ├── internal/                 # Mã nguồn nội bộ (Encapsulated Internal Modules)
│   │   ├── auth/                 # Logic Đăng ký, Đăng nhập, Passkey WebAuthn & JWT RS256
│   │   ├── check/                # Engine RAM Cuckoo Filter, Cache & Singleflight Worker
│   │   ├── database/             # Driver kết nối MongoDB & Khởi tạo Indexes
│   │   ├── middleware/           # Middlewares: Auth RS256, CORS, Rate Limit, Security Headers
│   │   └── models/               # Struct Models: User, ScamURL, Report, CheckLog, Passkey
│   ├── config/                   # Quản lý file cấu hình & Load RSA Certificate Keys
│   ├── go.mod                    # Quản lý phụ thuộc Go Modules
│   └── go.sum
│
├── extension/                    # Chrome Extension Manifest V3 (Client Shield)
│   ├── chrome-ex/src/
│   │   ├── background/           # Background Service Worker & Modular Services
│   │   │   ├── background.js     # Entrypoint Service Worker chính
│   │   │   └── services/         # Services chuyên biệt
│   │   │       ├── NavigationShield.js     # Intercept & Quét Fast Check URL ngầm
│   │   │       ├── TrackingParamsService.js# Xóa tham số fbclid, gclid, utm_*
│   │   │       ├── ProxyAdvancedService.js # Định tuyến Proxy mã hóa ẩn danh
│   │   │       ├── GpcService.js           # Inject Header Sec-GPC: 1
│   │   │       ├── AntibotService.js       # Anti Canvas/WebGL Fingerprinting
│   │   │       └── CookieAutoDeleteService.js # Tự động dọn Cookie khi đóng Tab
│   │   ├── content/              # Content Scripts tác động trực tiếp cây DOM trang web
│   │   │   └── content.js        # Engine MutationObserver & CSS Blur PII (5 cơ chế)
│   │   ├── popup/                # Giao diện Popup Extension Main Toolbar
│   │   │   ├── popup.html
│   │   │   └── popup.js
│   │   └── manifest.json         # File khai báo Quyền hạn & Cấu hình Extension Manifest V3
│
├── frontend/                     # Cổng thông tin Web Portal (React.js 18 + Vite)
│   ├── src/
│   │   ├── assets/               # Hình ảnh tĩnh, SVG Icons, CSS Global Styles
│   │   ├── components/           # UI Components tái sử dụng (Navbar, Sidebar, Footer, Modals)
│   │   ├── pages/                # Các Màn hình Chức năng chính
│   │   │   ├── Home.jsx          # Trang chủ Landing Page
│   │   │   ├── Login.jsx         # Trang Đăng nhập Email/Password & Google OAuth2
│   │   │   ├── PasskeyAuth.jsx   # Trang Đăng ký / Đăng nhập Passkey WebAuthn
│   │   │   ├── Dashboard.jsx     # Bảng điều khiển Quản lý Hồ sơ & Passkey cá nhân
│   │   │   ├── ReportScam.jsx    # Form Gửi đơn Báo cáo Lừa đảo & Lịch sử báo cáo
│   │   │   ├── ScammerSearch.jsx # Trang Tra cứu Danh bạ Scammer Registry
│   │   │   ├── ChatbotANM.jsx    # Trang Hỏi đáp Trợ lý Luật An ninh mạng RAG
│   │   │   └── AdminAudit.jsx    # Dashboard Kiểm duyệt Báo cáo & Thống kê Admin
│   │   ├── services/             # Axios Client RESTful API & Kết nối WebSocket
│   │   └── App.jsx               # Routing chính React Router v6 & Context Providers
│   ├── package.json
│   └── vite.config.js
│
├── Ai/                           # Dịch vụ Phân tích Độc hại AI Phishing (Python FastAPI)
│   ├── main.py                   # REST API endpoints (/detect, /check/ai-scan)
│   ├── collector/                # Modules cào dữ liệu WHOIS, DNS, HTML DOM Parser
│   └── requirements.txt          # Danh sách thư viện Python phụ thuộc
│
├── ai_ANM/                       # Dịch vụ Trợ lý Luật ANM Chatbot RAG (Python FastAPI)
│   ├── main.py                   # WebSocket endpoint (/ws/chat)
│   ├── vector_db/                # CSDL Vector FAISS nạp chỉ mục văn bản Luật ANM 2018
│   └── requirements.txt
│
├── bot/                          # Dịch vụ Telegram Bot Tra cứu Tên miền (Python)
│   └── bot.py                    # Tiếp nhận lệnh /check <url> & Kết nối Backend Check
└── README.md                     # Hướng dẫn chi tiết Cài đặt, Cấu hình & Vận hành Hệ thống
```

---

#### 3.3.4. Mô tả Chi tiết Chức năng và Tác dụng từng Thư mục

##### 1. Phân hệ Core Backend (`backend/`)
*   `backend/cmd/`: Chứa các file `main.go` là điểm khởi chạy ứng dụng. Việc chia làm 2 thư mục con `cmd/auth/` và `cmd/check/` cho phép biên dịch độc lập thành 2 file nhị phân (binaries) riêng biệt, chạy ở 2 cổng mạng `8081` và `8082` độc lập.
*   `backend/internal/auth/`: Chứa toàn bộ logic nghiệp vụ xác thực người dùng. Bao gồm hàm băm mật khẩu Bcrypt, sinh và xác minh Token JWT RS256, và quy trình xử lý Challenge / Assertion chữ ký số sinh trắc học của chuẩn Passkey FIDO2/WebAuthn.
*   `backend/internal/check/`: Chứa bộ máy kiểm tra URL trọng yếu của hệ thống. Tích hợp cấu trúc dữ liệu **RAM Cuckoo Filter** cho phép tra cứu $O(1)$, cơ chế **`singleflight.Group`** ngăn chặn nghẽn request trùng lặp và hàng đợi **Go Channel đệm** ghi log bất đồng bộ.
*   `backend/internal/database/`: Chứa Driver khởi tạo kết nối MongoDB Client, cấu hình Connection Pool (`MaxPoolSize`, `MinPoolSize`) và định nghĩa các hàm tạo Index B-Tree / TTL Index tự động.
*   `backend/internal/middleware/`: Chứa các hàm trung gian xử lý yêu cầu HTTP trước khi chuyển tới controller: xác minh Token JWT RS256 (`RequireAuth`), giới hạn tần suất truy cập (`RateLimiter`), cho phép kết nối tên miền (`CORS`) và chèn HTTP Headers bảo mật.
*   `backend/internal/models/`: Định nghĩa các cấu trúc dữ liệu Go (`struct`) đại diện cho các bảng tài liệu MongoDB: `User`, `ScamURL`, `Report`, `CheckLog`, `PasskeyCredential`.

##### 2. Phân hệ Chrome Extension Client Shield (`extension/chrome-ex/src/`)
*   `extension/chrome-ex/src/background/`: Chứa Service Worker chạy ngầm theo chuẩn Manifest V3.
    *   `services/NavigationShield.js`: Lắng nghe sự kiện `chrome.webNavigation.onBeforeNavigate`, gửi request Fast Check về Backend Check và ngắt điều hướng trình duyệt nếu gặp trang lừa đảo.
    *   `services/TrackingParamsService.js`: Tự động nhận diện và bóc tách xóa các mã vết tiếp thị ngầm (`fbclid`, `gclid`, `utm_*`) ngay khi URL vừa được nhấp.
    *   `services/ProxyAdvancedService.js` & `GpcService.js`: Quản lý kết nối Proxy mã hóa ẩn địa chỉ IP thực và chèn HTTP Request Header `Sec-GPC: 1` để từ chối bị theo dõi.
    *   `services/CookieAutoDeleteService.js`: Lắng nghe sự kiện đóng Tab trình duyệt để tự động xóa Cookie theo dõi thuộc về tên miền tương ứng.
*   `extension/chrome-ex/src/content/`: Chứa Content Script nhúng trực tiếp vào mọi trang web người dùng lướt qua. Sử dụng `MutationObserver` lắng nghe biến động cây DOM và bọc thẻ CSS mờ (`filter: blur(5px)`) bảo vệ thông tin PII 5 cơ chế.
*   `extension/chrome-ex/src/popup/`: Chứa giao diện người dùng hiển thị khi nhấp vào biểu tượng Extension trên thanh công cụ trình duyệt, cho phép người dùng bật/tắt nhanh các chế độ bảo vệ.

##### 3. Phân hệ Web Portal Frontend (`frontend/src/`)
*   `frontend/src/components/`: Chứa các thành phần UI dùng chung như thanh điều hướng (`Navbar`), thanh bên (`Sidebar`), các hộp thoại xác nhận (`Modal`) và thẻ hiển thị trạng thái an toàn (`SafetyCard`).
*   `frontend/src/pages/`: Chứa các màn hình giao diện trang web độc lập.
    *   `PasskeyAuth.jsx`: Giao diện tương tác sinh trắc học với WebAuthn API trình duyệt.
    *   `AdminAudit.jsx`: Giao diện Bảng điều khiển dành riêng cho Moderator/Admin thực hiện duyệt đơn báo cáo và xem biểu đồ thống kê.
    *   `ChatbotANM.jsx`: Giao diện khung Chat hỗ trợ stream câu trả lời tư vấn Luật An ninh mạng qua kết nối WebSocket real-time.
*   `frontend/src/services/`: Chứa các module giao tiếp dữ liệu ngoài, cấu hình Axios Client tự động đính kèm Token JWT và quản lý kết nối WebSocket.

##### 4. Phân hệ AI Services & Bot (`Ai/`, `ai_ANM/`, `bot/`)
*   `Ai/collector/`: Chứa các mô đun cào thông tin thô từ tên miền nghi ngờ: trích xuất tuổi tên miền từ máy chủ WHOIS, lấy danh bạ bản ghi DNS và phân tích thẻ HTML DOM tìm kiếm dấu hiệu giả mạo thương hiệu.
*   `ai_ANM/vector_db/`: Chứa cơ sở dữ liệu Vector **FAISS** lưu trữ bản đồ nhúng 768 chiều của toàn bộ các Điều khoản thuộc **Luật An ninh mạng 2018**, phục vụ cho engine tìm kiếm RAG Cosine Similarity.
*   `bot/`: Chứa tiến trình Telegram Bot lắng nghe tin nhắn từ người dùng ứng dụng Telegram, bóc tách lệnh `/check <url>` và phản hồi thông báo an toàn trực quan."""

if old_section in content:
    new_content = content.replace(old_section, new_section)
    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(new_content)
    print("SUCCESSFULLY REPLACED SECTION 3.3!")
else:
    print("ERROR: COULD NOT MATCH OLD SECTION STRICTLY.")
