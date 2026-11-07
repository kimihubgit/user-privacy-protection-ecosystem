import sys
from pathlib import Path

# Thêm thư mục gốc của ChatbotAi vào sys.path
sys.path.insert(0, str(Path(__file__).resolve().parent))

if __name__ == "__main__":
    if "--api" in sys.argv:
        import uvicorn
        from observability.logger import print_banner
        
        # Thiết lập mặc định
        host = "0.0.0.0"
        port = 8003
        
        # Đọc tham số host và port nếu được truyền vào
        for arg in sys.argv:
            if arg.startswith("--host="):
                host = arg.split("=")[1]
            elif arg.startswith("--port="):
                try:
                    port = int(arg.split("=")[1])
                except ValueError:
                    pass
        
        print_banner(host=host, port=port)
        
        # Sử dụng uvicorn để khởi động API từ interface_adapters/api/main.py
        uvicorn.run("interface_adapters.api.main:app", host=host, port=port, reload=True)
    else:
        print("Chạy chế độ API bằng lệnh: python main.py --api")
