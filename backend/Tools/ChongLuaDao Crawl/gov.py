import json
from pymongo import MongoClient

# -----------------------------------------
# 1. Cấu hình MongoDB
# -----------------------------------------
MONGO_URI = "mongodb+srv://vkhai2k5_db_user:16UKwC39liXlh1Gi@payment.oc6hemx.mongodb.net/"
DB_NAME = "scam_urls"
COLLECTION_NAME = "allow_urls_list" # Thay đổi tên collection theo ý muốn của bạn


def main():
    try:
        with open('data.json', 'r', encoding='utf-8') as f:
            # json.load(f) sẽ parse thẳng file thành dictionary
            parsed_data = json.load(f) 
    except FileNotFoundError:
        print("❌ Không tìm thấy file JSON. Vui lòng kiểm tra lại tên file.")
        return
    
    # Lấy danh sách items an toàn
    items = parsed_data.get("data", {}).get("items", [])
    
    if not items:
        print("Không tìm thấy item nào trong JSON.")
        return

    # -----------------------------------------
    # 3. Chuẩn bị dữ liệu theo cấu trúc mới
    # -----------------------------------------
    documents_to_insert = []
    for item in items:
        # Xử lý URL (thêm https:// nếu cần)
        raw_name = item.get("domain", "")
        url = f"https://{raw_name}"

        new_doc = {
            "url": url,
            "domain": raw_name,
            "status": "safe", # Hardcode theo format bạn yêu cầu
            "category": item.get("categoryLabel", ""),
            "description": item.get("companyName", ""),
            "reported_by": "gov" # Hardcode theo format bạn yêu cầu
        }
        documents_to_insert.append(new_doc)

    # -----------------------------------------
    # 4. Kết nối và đẩy lên MongoDB
    # -----------------------------------------
    try:
        # Kết nối tới cluster
        client = MongoClient(MONGO_URI)
        db = client[DB_NAME]
        collection = db[COLLECTION_NAME]

        # Insert nhiều document cùng lúc bằng insert_many
        result = collection.insert_many(documents_to_insert)
        print(f"✅ Đã đẩy thành công {len(result.inserted_ids)} bản ghi lên MongoDB!")
        
    except Exception as e:
        print(f"❌ Có lỗi xảy ra trong quá trình kết nối/insert DB: {e}")
    finally:
        # Đóng kết nối
        client.close()

if __name__ == "__main__":
    main()