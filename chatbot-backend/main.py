import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent / "src"))

if __name__ == "__main__":
    if "--api" in sys.argv:
        import uvicorn
        
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
        
        print(f"Khởi chạy API Server tại http://{host}:{port} ...")
        # Sử dụng uvicorn để khởi động API từ src/api.py
        uvicorn.run("api:app", host=host, port=port, reload=True)
    else:
        from cli import run  
        run()

