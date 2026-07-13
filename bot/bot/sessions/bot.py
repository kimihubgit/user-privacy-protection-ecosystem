import sys
from telethon import TelegramClient
from telethon.tl.types import User

# Khởi tạo client
client = TelegramClient('userbot', 11452866, '330f621925451aa071fe983882e4188d')

async def main():
    # ID bạn lấy từ profile (Ví dụ: 933171163)
    raw_id = 933171163  
    
    try:
        target_id = int(raw_id)
        print(f"🔄 Đang thử kiểm tra ID {target_id} trong bộ nhớ cache local...")
        
        try:
            # Bước 1: Thử lấy thực thể bằng ID số trước
            entity = await client.get_entity(target_id)
            
        except ValueError:
            # Bước 2: Kích hoạt chế độ cứu trợ nếu chưa có cache
            print("\n⚠️ HỆ THỐNG: ID này hoàn toàn mới, file session chưa lưu 'access_hash'.")
            print("💡 ĐỂ SỬA LỖI: Vui lòng nhập Username hoặc Số điện thoại của tài khoản này để bot kích hoạt Resolve mạng.")
            
            # Yêu cầu nhập mồi từ bàn phím (hoặc bạn có thể gán cứng một biến username vào đây)
            fallback_target = input("👉 Nhập Username (vídụ: BotFather) hoặc SĐT (vídụ: +84...): ").strip()
            
            if not fallback_target:
                print("❌ Bạn không nhập gì, hủy tiến trình.")
                return
                
            print(f"🔍 Đang gửi ResolveRequest lên server Telegram để nạp cache cho target: {fallback_target}...")
            entity = await client.get_entity(fallback_target)
            print("✅ Đã nạp cache thành công vào file session!")

        # Bước 3: Đọc và phân tích thông tin sau khi đã có entity hợp lệ
        if isinstance(entity, User):
            print("\n" + "="*30)
            print("   KẾT QUẢ CHECK TÀI KHOẢN")
            print("="*30)
            print(f"🔹 Tên hiển thị: {entity.first_name} {entity.last_name or ''}")
            print(f"🔹 Username: @{entity.username}" if entity.username else "🔹 Username: Không có")
            print(f"🔹 ID Số chuẩn: {entity.id}")
            
            if entity.bot:
                print("🔹 Phân loại: 🤖 BOT (Tài khoản tự động)")
            else:
                print("🔹 Phân loại: 👤 USER (Người dùng thật)")
            print("="*30)
        else:
            print("📢 Đối tượng này thuộc về một Group hoặc Channel, không phải tài khoản cá nhân.")

    except Exception as e:
        print(f"\n❌ Lỗi phát sinh không thể xử lý: {e}")

with client:
    client.loop.run_until_complete(main())