# So Sánh Giải Pháp Caching: RocksDB vs Redis vs Go Cache

Tài liệu này phân tích và so sánh chi tiết 3 giải pháp lưu trữ đệm (Caching / Local Storage) phổ biến nhất hiện nay cho hệ thống Go Backend của bạn: **RocksDB**, **Redis**, và **Go Cache (In-Memory)**. Từ đó giúp bạn đưa ra quyết định kiến trúc chính xác nhất cho dự án Protect User / Check Scam.

---

## 1. Bảng So Sánh Tổng Quan

| Tiêu Chí | RocksDB (Embedded Key-Value) | Redis (In-Memory Server) | Go Cache (In-Memory RAM) |
| :--- | :--- | :--- | :--- |
| **Cơ Chế Lưu Trữ** | Nhúng trong App, lưu xuống SSD | Chạy độc lập, lưu trên RAM | Lưu trực tiếp trên RAM của App |
| **Độ Trễ (Latency)** | Cực thấp (~0.1ms - đọc từ đĩa/SSD) | Thấp (~1-2ms - qua kết nối mạng nội bộ) | Siêu thấp (< 0.001ms - đọc trực tiếp từ RAM) |
| **Lưu Trữ Bền Vững** | **Có (Tự động ghi xuống SSD)** | **Có** (Có thể cấu hình ghi xuống đĩa) | **Không** (Mất sạch dữ liệu khi restart app) |
| **Giới Hạn Bộ Nhớ** | Không giới hạn bởi RAM (bằng dung lượng ổ cứng) | Giới hạn bởi dung lượng RAM của Server | Giới hạn bởi dung lượng RAM của App |
| **Môi Trường Windows** | **Phức tạp** (Cần gcc compiler / cgo) | **Trung bình** (Cần Docker hoặc WSL) | **Cực kỳ dễ** (Go thuần 100%) |
| **Khả Năng Scaling** | Khó scale ngang (dữ liệu gắn liền với đĩa máy chủ) | Dễ scale (Cluster, Sentinel, Replication) | Không thể share giữa nhiều instance app |

---

## 2. Phân Tích Chi Tiết Từng Giải Pháp

### 2.1. RocksDB (Embedded Persistent Key-Value)

RocksDB chạy trực tiếp trong tiến trình Go của bạn, tự động quản lý bộ nhớ đệm trên RAM và tự ghi dữ liệu xuống đĩa cứng (SSD) thông qua cấu trúc cây LSM.

> [!TIP]
> **Điểm mạnh:**
> *   **Không mất dữ liệu:** Khi khởi động lại Server, dữ liệu đệm vẫn còn nguyên trên đĩa cứng, không mất thời gian nạp lại từ database gốc.
> *   **Không tốn tài nguyên mạng:** Do chạy nhúng, không cần kết nối TCP/IP để đọc dữ liệu.
> *   **Tiết kiệm RAM:** Bạn có thể lưu trữ hàng chục triệu bản ghi scam (vài GB dữ liệu) mà không sợ làm tràn bộ nhớ RAM của Server.

> [!WARNING]
> **Điểm yếu:**
> *   **Biên dịch phức tạp trên Windows:** Vì viết bằng C++, Go phải gọi qua `cgo`. Việc build dự án trên Windows sẽ yêu cầu bạn cài đặt các công cụ như MinGW-w64.
> *   **Tải dữ liệu phân tán khó khăn:** Nếu bạn chạy 2-3 instance backend Check Scam để chịu tải, mỗi máy sẽ có 1 file database RocksDB riêng biệt, rất khó để đồng bộ dữ liệu tức thời giữa các máy.

---

### 2.2. Redis (In-Memory Database Server)

Redis là một dịch vụ cơ sở dữ liệu Key-Value chạy độc lập. Cực kỳ phổ biến trong các kiến trúc Microservices.

> [!TIP]
> **Điểm mạnh:**
> *   **Dùng chung dữ liệu (Shared Cache):** Cả 2 backend `backend auth` và `backend check` đều có thể kết nối vào 1 server Redis để chia sẻ cache.
> *   **Tính năng phong phú:** Hỗ trợ TTL (tự động xóa cache sau một thời gian), Pub/Sub (truyền tin nhắn thời gian thực), và nhiều kiểu dữ liệu phức tạp.
> *   **Dễ scale:** Hỗ trợ Redis Cluster để scale lên hàng triệu lượt truy cập mà không gặp khó khăn.

> [!WARNING]
> **Điểm yếu:**
> *   **Độ trễ do mạng:** Vẫn mất khoảng 1-2ms độ trễ mạng nội bộ (Network Overhead) để lấy dữ liệu từ Redis Server.
> *   **Tốn kém chi phí RAM:** Vì dữ liệu lưu hoàn toàn trên RAM, nếu tập dữ liệu blacklist scam của bạn lên tới hàng chục GB, bạn sẽ phải thuê Server cấu hình RAM rất khủng $\rightarrow$ chi phí vận hành cao.

---

### 2.3. Go Cache (In-Memory - Ví dụ: `sync.Map` hoặc thư viện `go-cache`)

Sử dụng cấu trúc dữ liệu Map thuần của Go được lưu trực tiếp trên RAM của ứng dụng.

> [!TIP]
> **Điểm mạnh:**
> *   **Tốc độ nhanh nhất:** Đọc/ghi trực tiếp từ RAM trong cùng tiến trình ứng dụng $\rightarrow$ Tốc độ đo bằng nano-giây.
> *   **Dễ phát triển:** 100% Go thuần, chạy trên Windows, Linux hay macOS chỉ bằng một nút bấm mà không cần cài đặt thêm bất kỳ phần mềm nào khác.
> *   **An toàn:** Không có độ trễ kết nối, không có rủi ro rò rỉ mạng.

> [!WARNING]
> **Điểm yếu:**
> *   **Mất sạch dữ liệu khi Restart:** Bất kỳ khi nào bạn tắt/bật lại server Go hoặc cập nhật code, bộ nhớ đệm sẽ bị xóa sạch. Hệ thống sẽ phải truy vấn lại MongoDB Atlas để nạp lại dữ liệu ban đầu.
> *   **Tràn bộ nhớ (Out of Memory):** Nếu bạn nhét hàng triệu bản ghi scam vào RAM của App, nó có thể làm tràn RAM dẫn đến việc hệ điều hành tắt tiến trình Go đột ngột (OOM Killer).

---

## 3. Đề Xuất Kiến Trúc Cho Dự Án Của Bạn

Dựa trên quy mô dự án hiện tại của bạn, đây là bảng phân bổ hợp lý nhất để đạt hiệu suất tối đa:

| Tính Năng / Nhu Cầu | Giải Pháp Đề Xuất | Lý Do |
| :--- | :--- | :--- |
| **Xác thực sự tồn tại của Email (Auth)** | **Cuckoo Filter (In-Memory)** | Vì danh sách user của bạn dưới 1,000,000 người, Cuckoo Filter tự viết bằng Go thuần chỉ tốn **~1-2MB RAM**, truy vấn cực nhanh và dễ chạy local trên Windows. |
| **Lưu Session ngắn hạn của Passkeys** | **Go Cache (`sync.Map`)** | Phiên đăng ký/đăng nhập Passkeys chỉ tồn tại trong vòng 5-10 phút. Dữ liệu siêu nhỏ và ngắn hạn nên lưu trực tiếp trên RAM là tiện lợi nhất. |
| **Truy vấn nhanh danh sách Scam (Check Scam)** | **Redis** (Hoặc **MongoDB Index** ở giai đoạn hiện tại) | Do danh sách scam cần cập nhật liên tục từ cộng đồng, dùng Redis giúp đồng bộ ngay lập tức và hỗ trợ tính năng tự động xóa (TTL) nếu cần. |
| **Giới hạn tấn công spam API (Rate Limit)** | **Go Cache** (Giai đoạn DEV) / **Redis** (Giai đoạn PROD) | Dùng Redis để lưu trữ số lượt gọi của mỗi IP là giải pháp chuẩn công nghiệp, giúp chặn đứng các đợt tấn công DDoS. |

---

## 4. Kết Luận

1.  **Nếu bạn đang code local trên Windows:** Tránh sử dụng RocksDB để tránh việc cài đặt gcc/cgo phức tạp. Hãy ưu tiên sử dụng **Go Cache** cho các dữ liệu nhỏ/ngắn hạn và tận dụng **MongoDB Indexes** để truy vấn nhanh.
2.  **Khi đưa lên Production (Deploy lên Ubuntu/VPS Linux):** Hãy thêm **Redis** vào làm lớp đệm trung gian giữa Go Backend và MongoDB Atlas. Đây là mô hình chuẩn, ổn định và dễ vận hành nhất cho các dự án Web App/API tại Việt Nam.
