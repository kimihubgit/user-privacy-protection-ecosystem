import sys
import datetime
from telethon import TelegramClient
from telethon.tl.types import User, UserStatusOnline, UserStatusOffline, UserStatusRecently, UserStatusLastWeek, UserStatusLastMonth
from telethon.tl.functions.users import GetFullUserRequest

# Khởi tạo client
client = TelegramClient('userbot', 11452866, '330f621925451aa071fe983882e4188d')

def parse_status(status):
    """Hàm phân tích trạng thái hoạt động (Online/Offline) của User"""
    if isinstance(status, UserStatusOnline):
        return "🟢 Đang hoạt động (Online)"
    elif isinstance(status, UserStatusOffline):
        # Chuyển thời gian về định dạng dễ đọc
        return f"🔴 Ngoại tuyến. Hoạt động lần cuối: {status.was_online.strftime('%d/%m/%Y %H:%M:%S')} (UTC)"
    elif isinstance(status, UserStatusRecently):
        return "🟡 Mới hoạt động gần đây (Recently)"
    elif isinstance(status, UserStatusLastWeek):
        return "⚫ Hoạt động trong vòng 1 tuần qua"
    elif isinstance(status, UserStatusLastMonth):
        return "⚫ Hoạt động trong vòng 1 tháng qua"
    return "⚪ Ẩn trạng thái"

async def main():
    # ID bạn lấy từ profile 
    raw_id = '@callmesenpay'  
    
    try:
        target_id = '@Sympmods'
        print(f"🔄 Đang thử kiểm tra ID {target_id} trong bộ nhớ cache local...")
        
        try:
            # Bước 1: Thử lấy thực thể cơ bản bằng ID số trước
            entity = await client.get_entity(target_id)
            print(entity)
            
        except ValueError:
            # Bước 2: Kích hoạt chế độ cứu trợ nhập mồi nếu chưa có cache
            print("\n⚠️ HỆ THỐNG: ID này hoàn toàn mới, file session chưa lưu 'access_hash'.")
            fallback_target = input("👉 Nhập nhanh Username hoặc SĐT để nạp cache: ").strip()
            
            if not fallback_target:
                print("❌ Hủy tiến trình.")
                return
                
            entity = await client.get_entity(fallback_target)
            print("✅ Đã nạp cache thành công!")

        # Bước 3: Đọc sâu dữ liệu bằng GetFullUserRequest (Lấy Bio, SĐT, Kho ảnh...)
        if isinstance(entity, User):
            print("🔄 Đang đồng bộ thông tin chi tiết từ Server Telegram...")
            full_user_data = await client(GetFullUserRequest(entity))
            
            full_user = full_user_data.full_user
            user_info = full_user_data.users[0]

            # Bóc tách dữ liệu nâng cao
            first_name = user_info.first_name or ""
            last_name = user_info.last_name or ""
            full_name = f"{first_name} {last_name}".strip()
            
            username = f"@{user_info.username}" if user_info.username else "Không có"
            phone = f"+{user_info.phone}" if user_info.phone else "Ẩn số điện thoại"
            bio = full_user.about if full_user.about else "Trống"
            
            # Trạng thái Online / Offline
            status_text = parse_status(user_info.status)
            
            # Phân loại tài khoản
            if user_info.bot:
                account_type = "🤖 BOT (Tài khoản tự động)"
            else:
                account_type = "👤 USER (Người dùng thật)"

            # In kết quả chi tiết ra màn hình
            print("\n" + "="*40)
            print("       THÔNG TIN CHI TIẾT TÀI KHOẢN")
            print("="*40)
            print(f"🔹 Phân loại: {account_type}")
            print(f"🔹 Tên hiển thị: {full_name}")
            print(f"🔹 Username: {username}")
            print(f"🔹 ID Số chuẩn: {user_info.id}")
            print(f"🔹 Số điện thoại: {phone}")
            print(f"🔹 Trạng thái: {status_text}")
            print(f"🔹 Tài khoản Premium: {'Có ⭐' if user_info.premium else 'Không'}")
            print(f"🔹 Tiểu sử (Bio):\n{bio}")
            print("="*40)
            
        else:
            print("📢 Đối tượng này thuộc về một Group hoặc Channel, không phải tài khoản Người dùng/Bot.")

    except Exception as e:
        print(f"\n❌ Lỗi phát sinh: {e}")

with client:
    client.loop.run_until_complete(main())