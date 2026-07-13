import datetime
from telethon import TelegramClient
from telethon.tl.functions.channels import GetFullChannelRequest
client = TelegramClient('userbot', 11452866, '330f621925451aa071fe983882e4188d')

async def main():
    raw_id = 2332133583
    
    # Chuẩn hóa ID về dạng số nguyên âm hệ thống (bắt đầu bằng -100)
    if str(raw_id).startswith("-100"):
        channel_id = int(raw_id)
    else:
        channel_id = int(f"-100{raw_id}")
    entity = await client.get_entity("@+OPkGU89mfOw1MjQ5")
    print(entity)
    channel_full = await client(GetFullChannelRequest(entity))
    print(channel_full)
    try:
        
        
        full_chat = channel_full.full_chat
        main_channel = channel_full.chats[0]

        title = main_channel.title
        username = main_channel.username if main_channel.username else "Không có (Private)"
        about = full_chat.about if full_chat.about else "Trống"
        members = full_chat.participants_count

        # Ngày tài khoản userbot của bạn join vào channel
        joined_date = main_channel.date
        formatted_joined_date = joined_date.strftime("%d/%m/%Y %H:%M:%S") if joined_date else "Không rõ"

        print("==== KẾT QUẢ PHÂN TÍCH TELEGRAM CHANNEL ====")
        print(f"🔹 Tên Channel: {title}")
        print(f"🔹 Username: @{username}")
        print(f"🔹 ID Chuẩn: {channel_id}")
        print(f"🔹 Số thành viên: {members} người")
        print(f"🔹 DateCreate: {formatted_joined_date} (UTC)") # Sẽ ra 24/07/2025
        print(f"🔹 Mô tả (About):\n{about}")
        print("===========================================")

    except Exception as e:
        print(f"❌ Lỗi thực tế: {e}")
        print("💡 Lời khuyên: Nếu báo lỗi ChannelPrivate hoặc Invalid, chắc chắn Group/Channel này là PRIVATE và tài khoản chưa join nên không thể giải mã thực thể.")

with client:
    client.loop.run_until_complete(main())