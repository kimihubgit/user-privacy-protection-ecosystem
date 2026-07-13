import requests
import re
from pymongo import MongoClient
import schedule
import time
from datetime import datetime

# -----------------------------------------
# CẤU HÌNH CHUNG
# -----------------------------------------
MONGO_URI = "mongodb+srv://vkhai2k5_db_user:16UKwC39liXlh1Gi@payment.oc6hemx.mongodb.net/"
DB_NAME = "scam_urls"

HEADERS = {
    'Referer': 'https://chongluadao.vn/',
    'Upgrade-Insecure-Requests': '1',
    'User-Agent': 'Mozilla/5.0 (Linux; Android 15; Pixel 9) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Mobile Safari/537.36',
    'sec-ch-ua': '"Not;A=Brand";v="8", "Chromium";v="150", "Google Chrome";v="150"',
    'sec-ch-ua-mobile': '?1',
    'sec-ch-ua-platform': '"Android"'
}

def fetch_data(url):
    """Tải HTML và trích xuất danh sách (URL, Domain) bằng Regex."""
    print(f"[*] Đang tải dữ liệu từ {url}...")
    try:
        response = requests.get(url, headers=HEADERS, timeout=15)
        response.raise_for_status()
        
        pattern = r'url:\s*"([^"]+)",\s*domain:\s*"([^"]+)"'
        matches = re.findall(pattern, response.text)
        
        if not matches:
            print(f"[-] Không tìm thấy dữ liệu mảng tại {url}.")
            return []
            
        print(f"[+] Trích xuất thành công {len(matches)} bản ghi từ web.")
        return matches

    except Exception as e:
        print(f"[!] Lỗi khi tải dữ liệu từ {url}: {e}")
        return []

def sync_to_mongodb(matches, collection_name, status_label):
    """Định dạng dữ liệu, lọc trùng lặp và đẩy lên MongoDB."""
    if not matches:
        return

    scraped_documents = [
        {
            "url": url_val,
            "domain": domain_val,
            "status": status_label,
            "category": "",
            "description": "",
            "reported_by": "chongluadao"
        }
        for url_val, domain_val in matches
    ]

    try:
        print(f"[*] Đang đồng bộ vào collection '{collection_name}'...")
        client = MongoClient(MONGO_URI)
        collection = client[DB_NAME][collection_name]

        extracted_urls = [d["url"] for d in scraped_documents]

        # Kiểm tra các URL đã tồn tại
        existing_docs = collection.find({"url": {"$in": extracted_urls}}, {"url": 1})
        existing_urls = {doc["url"] for doc in existing_docs}

        # Lọc bản ghi mới
        new_documents = [d for d in scraped_documents if d["url"] not in existing_urls]

        if new_documents:
            result = collection.insert_many(new_documents)
            print(f"[+] Thành công! Thêm {len(result.inserted_ids)} bản ghi mới vào '{collection_name}'.")
            print(f"[-] Đã bỏ qua {len(scraped_documents) - len(new_documents)} bản ghi bị trùng lặp.\n")
        else:
            print(f"[-] Tất cả dữ liệu đều đã có trong '{collection_name}'. Không có bản ghi mới.\n")

    except Exception as e:
        print(f"[!] Lỗi cơ sở dữ liệu ({collection_name}): {e}\n")
    finally:
        client.close()

def job_crawl_data():
    """Hàm thực thi chính khi đến giờ hẹn"""
    thoi_gian_hien_tai = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
    print(f"\n=======================================================")
    print(f" KÍCH HOẠT TIẾN TRÌNH CÀO DỮ LIỆU LÚC: {thoi_gian_hien_tai}")
    print(f"=======================================================")
    
    # 1. Xử lý Denylist
    denylist_url = 'https://chongluadao.vn/database/denylist'
    denylist_matches = fetch_data(denylist_url)
    sync_to_mongodb(denylist_matches, collection_name="urls_list", status_label="malicious")
    
    # 2. Xử lý Allowlist
    allowlist_url = 'https://chongluadao.vn/database/allowlist'
    allowlist_matches = fetch_data(allowlist_url)
    sync_to_mongodb(allowlist_matches, collection_name="allow_urls_list", status_label="safe")
    
    print(f"=== TẠM DỪNG TIẾN TRÌNH - CHỜ ĐẾN ĐỢT CHẠY TIẾP THEO ===\n")

if __name__ == "__main__":
    # Đặt lịch: Chạy hàm `job_crawl_data` vào lúc 23:50 mỗi ngày
    schedule.every().day.at("23:50").do(job_crawl_data)
    
    print("======================================================")
    print(" SCRIPT ĐÃ KHỞI CHẠY VÀ ĐANG Ở TRẠNG THÁI NGỦ (SLEEP)")
    print(" Lịch trình: Tự động chạy vào lúc 23:50 HÀNG NGÀY.")
    print(" LƯU Ý: Vui lòng duy trì mạng và không tắt Terminal này.")
    print("======================================================")
    
    # Vòng lặp vô hạn chạy liên tục để kiểm tra thời gian
    while True:
        schedule.run_pending()
        time.sleep(1)  # Nghỉ 1 giây sau mỗi lần kiểm tra để tránh ngốn CPU (0% CPU)