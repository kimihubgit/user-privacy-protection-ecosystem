"""Entry point: chạy `python main.py` để bắt đầu chat với chatbot."""

import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent / "src"))

from cli import run  
if __name__ == "__main__":
    run()
