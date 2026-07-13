
import re
from telethon import TelegramClient
from telethon.tl.functions.contacts import GetContactsRequest, ImportContactsRequest, DeleteContactsRequest
from telethon.tl.types import InputPhoneContact


client = TelegramClient('userbot', 11452866, '330f621925451aa071fe983882e4188d')
async def main():
    # 1. Lấy tin nhắn chứa danh sách số điện thoại (Ví dụ lấy từ 1 chat cụ thể)
    # Bạn thay 'me' bằng username hoặc ID của nơi bạn gửi danh sách số điện thoại
    entity = '@MissRose_bot' 
    async for message in client.iter_messages(entity, limit=1):
        if not message.text:
            continue
            
        # Dùng Regex để lọc ra tất cả các chuỗi số có độ dài từ 9 đến 12 ký tự
        phone_numbers = re.findall(r'\b\d{9,12}\b', message.text)
        
        if not phone_numbers:
            print("❌ Không tìm thấy số điện thoại nào trong tin nhắn gần nhất.")
            return

        print(f"🔍 Tìm thấy {len(phone_numbers)} số điện thoại. Bắt đầu check profile...")
        print("-" * 50)

        # 2. Chuẩn bị danh sách contact để import (Telegram yêu cầu định dạng quốc tế, VD: +84...)
        input_contacts = []
        for phone in phone_numbers:
            # Nếu số bắt đầu bằng '0', đổi thành '+84' (Mã vùng VN)
            formatted_phone = phone
            if phone.startswith('0'):
                formatted_phone = '+84' + phone[1:]
            elif not phone.startswith('+'):
                formatted_phone = '+' + phone
                
            # Tạo object InputPhoneContact (client_id lấy bừa là số điện thoại luôn để phân biệt)
            input_contacts.append(InputPhoneContact(
                client_id=int(phone),
                phone=formatted_phone,
                first_name="Check",
                last_name=phone
            ))

        try:
            # Gửi yêu cầu import danh sách số điện thoại này vào Telegram
            # Lưu ý: Đừng gửi danh sách quá lớn một lúc (Nên chia nhỏ < 50 số/lần để tránh bị giới hạn FLOOD)
            result = await client(ImportContactsRequest(contacts=input_contacts))
            user_entities_to_delete = []
            # Kết quả trả về chứa danh sách các 'users' tồn tại tài khoản Telegram
            for user in result.users:
                print(f"✅ Tìm thấy tài khoản:")
                print(f" 🔹 Tên: {user.first_name} {user.last_name or ''}")
                print(f" 🔹 Username: @{user.username}" if user.username else " 🔹 Username: Không có")
                print(f" 🔹 Telegram ID: {user.id}")
                print(f" 🔹 Số điện thoại gốc: {user.phone}")
                print("-" * 30)
                user_entities_to_delete.append(user)
                
            if not result.users:
                print("ℹ️ Không có số điện thoại nào trong danh sách đăng ký Telegram (hoặc họ chặn tìm kiếm bằng SĐT).")

            if user_entities_to_delete:
                # Xóa các user tìm thấy dựa trên thực thể (Entity/ID) của họ
                await client(DeleteContactsRequest(id=user_entities_to_delete))
                print("🧹 Đã tự động xóa các tài khoản vừa check khỏi danh bạ Telegram của bạn.")
            else:
                print("🧹 Danh bạ sạch sẽ (Do không có số nào đăng ký Telegram để mà lưu).")
        except Exception as e:
            print(f"❌ Có lỗi xảy ra khi check: {e}")

with client:
    client.loop.run_until_complete(main())