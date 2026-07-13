import os
from pathlib import Path
from dotenv import load_dotenv

# Fix httpx/urllib3 parsing bug for IPv6 loopback in NO_PROXY
if "NO_PROXY" in os.environ:
    os.environ["NO_PROXY"] = (
        os.environ["NO_PROXY"]
        .replace(",::1", "")
        .replace("::1,", "")
        .replace("::1", "")
    )

# backend/ base directory
BASE_DIR = Path(__file__).resolve().parents[2]
ENV_FILE = BASE_DIR / ".env"

load_dotenv(dotenv_path=ENV_FILE)

# General settings
APP_NAME = os.getenv("APP_NAME", "Phishing Detector")
VERSION = os.getenv("APP_VERSION", "1.0.0")
API_PREFIX = "/api/v1"
DEBUG = os.getenv("DEBUG", "true").lower() == "true"
HOST = os.getenv("HOST", "0.0.0.0")
PORT = int(os.getenv("PORT", 8000))

# Gemini LLM settings
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
GEMINI_MODEL = os.getenv("GEMINI_MODEL", "gemini-2.5-flash")
