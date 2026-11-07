"""
Logger & Terminal Visualizer for ChatbotAi

Cung cấp cấu hình logging chuẩn mực, màu sắc ANSI, định dạng trực quan
và các hàm hỗ trợ hiển thị tiến trình (Pipeline Stepping) cho Agent Orchestrator.
"""

from __future__ import annotations

import logging
import os
import sys
import time
from datetime import datetime
from typing import Any

from config.settings import settings

# Kích hoạt ANSI Colors trên Windows Command Prompt / PowerShell nếu cần
if sys.platform == "win32":
    try:
        import ctypes
        kernel32 = ctypes.windll.kernel32
        # ENABLE_VIRTUAL_TERMINAL_PROCESSING = 0x0004
        kernel32.SetConsoleMode(kernel32.GetStdHandle(-11), 7)
    except Exception:
        pass


class LogColors:
    RESET = "\033[0m"
    BOLD = "\033[1m"
    DIM = "\033[2m"

    # Foreground
    RED = "\033[91m"
    GREEN = "\033[92m"
    YELLOW = "\033[93m"
    BLUE = "\033[94m"
    MAGENTA = "\033[95m"
    CYAN = "\033[96m"
    WHITE = "\033[97m"
    GRAY = "\033[90m"


class ColorFormatter(logging.Formatter):
    """Formatter có màu sắc cho console."""

    LEVEL_MAP = {
        logging.DEBUG: f"{LogColors.GRAY}DEBUG{LogColors.RESET}",
        logging.INFO: f"{LogColors.CYAN}INFO{LogColors.RESET} ",
        logging.WARNING: f"{LogColors.YELLOW}WARN{LogColors.RESET} ",
        logging.ERROR: f"{LogColors.RED}ERROR{LogColors.RESET}",
        logging.CRITICAL: f"{LogColors.BOLD}{LogColors.RED}CRIT{LogColors.RESET} ",
    }

    def format(self, record: logging.LogRecord) -> str:
        time_str = datetime.fromtimestamp(record.created).strftime("%H:%M:%S")
        level_str = self.LEVEL_MAP.get(record.levelno, record.levelname)
        return f"{LogColors.DIM}{time_str}{LogColors.RESET} │ {level_str} │ {record.getMessage()}"


logger = logging.getLogger("ai_anti_scam_chatbot")

if not logger.handlers:
    handler = logging.StreamHandler(sys.stdout)
    handler.setFormatter(ColorFormatter())
    logger.addHandler(handler)
    logger.setLevel(logging.DEBUG if settings.DEBUG else logging.INFO)
    logger.propagate = False


# =========================================================================
# HELPER FUNCTIONS CHO TERMINAL GIAO DIỆN ĐẸP (PIPELINE STEPPING)
# =========================================================================

def print_banner(host: str = "0.0.0.0", port: int = 8003) -> None:
    """In banner khởi động đẹp mắt và thông số hệ thống."""
    w = 68
    print()
    print(f"{LogColors.CYAN}{LogColors.BOLD}╔{'═' * w}╗{LogColors.RESET}")
    print(f"{LogColors.CYAN}{LogColors.BOLD}║{'🛡️   CHATBOT AI - ANTI-SCAM INTELLIGENT ASSISTANT'.center(w)}║{LogColors.RESET}")
    print(f"{LogColors.CYAN}║{'Hệ sinh thái bảo vệ người dùng trước lừa đảo không gian mạng'.center(w)}║{LogColors.RESET}")
    print(f"{LogColors.CYAN}╠{'═' * w}╣{LogColors.RESET}")
    
    info_lines = [
        f"API Server     : http://{host}:{port} (Chatbot Engine)",
        f"FastAPI Docs   : http://{host}:{port}/docs",
        f"Gemini Model   : {settings.GEMINI_MODEL}",
        f"Environment    : {settings.ENVIRONMENT.upper()} (Debug: {settings.DEBUG})",
        f"Pinecone Index : scam-law-index (Namespace: cyber_law, scam)",
        f"Cache Layer    : {'Redis @ ' + settings.REDIS_URL if settings.REDIS_URL else 'No Cache (Memory/Direct)'}",
    ]
    
    for line in info_lines:
        padded = f" • {line}".ljust(w)
        print(f"{LogColors.CYAN}║{LogColors.RESET}{padded}{LogColors.CYAN}║{LogColors.RESET}")
        
    print(f"{LogColors.CYAN}╚{'═' * w}╝{LogColors.RESET}")
    print(f"{LogColors.GREEN}{LogColors.BOLD}✔ Chatbot AI Engine đã sẵn sàng tiếp nhận yêu cầu từ Web & Extension!{LogColors.RESET}\n")


def log_request_start(message: str) -> None:
    """In phần mở đầu nhận request chat."""
    preview = message.strip().replace("\n", " ")
    if len(preview) > 90:
        preview = preview[:87] + "..."
    print(f"\n{LogColors.CYAN}{LogColors.BOLD}╭─── 📥 [CHATBOT REQUEST] ──────────────────────────────────────────{LogColors.RESET}")
    print(f"{LogColors.CYAN}│{LogColors.RESET} {LogColors.BOLD}Tin nhắn:{LogColors.RESET} \"{preview}\"")


def log_step(step_idx: int, total_steps: int, agent_name: str, detail: str) -> None:
    """In từng bước xử lý của Agent."""
    step_str = f"[{step_idx}/{total_steps}]"
    print(f"{LogColors.CYAN}│{LogColors.RESET} ├── {LogColors.YELLOW}{step_str}{LogColors.RESET} {LogColors.BOLD}{agent_name}:{LogColors.RESET} {detail}")


def log_request_complete(elapsed_seconds: float, token_summary: str = "") -> None:
    """In phần kết thúc request thành công."""
    elapsed_str = f"{elapsed_seconds:.2f}s"
    token_str = f" │ {token_summary}" if token_summary else ""
    print(f"{LogColors.CYAN}╰─── {LogColors.GREEN}{LogColors.BOLD}✔ [HOÀN TẤT]{LogColors.RESET} trong {LogColors.GREEN}{elapsed_str}{LogColors.RESET}{token_str} ───────────────────────{LogColors.RESET}\n")


def log_pipeline_error(source: str, err: Exception, message: str = "") -> None:
    """In lỗi pipeline có cấu trúc, lịch sự và rõ ràng."""
    err_time = datetime.now().strftime("%H:%M:%S")
    print(f"\n{LogColors.RED}{LogColors.BOLD}╭─── 🚨 [CHATBOT ERROR - {err_time}] ──────────────────────────────{LogColors.RESET}")
    print(f"{LogColors.RED}│{LogColors.RESET} {LogColors.BOLD}Vị trí (Source):{LogColors.RESET} {source}")
    if message:
        print(f"{LogColors.RED}│{LogColors.RESET} {LogColors.BOLD}Tin nhắn input :{LogColors.RESET} \"{message[:80]}\"")
    print(f"{LogColors.RED}│{LogColors.RESET} {LogColors.BOLD}Loại lỗi       :{LogColors.RESET} {type(err).__name__}")
    print(f"{LogColors.RED}│{LogColors.RESET} {LogColors.BOLD}Chi tiết       :{LogColors.RESET} {err}")
    print(f"{LogColors.RED}╰───────────────────────────────────────────────────────────────────{LogColors.RESET}\n")
