from pathlib import Path
from dotenv import load_dotenv
import os

# backend/
BASE_DIR = Path(__file__).resolve().parents[2]

load_dotenv(BASE_DIR / ".env")

# =========================
# Application
# =========================

APP_NAME = os.getenv("APP_NAME", "Phishing Detector")
APP_VERSION = os.getenv("APP_VERSION", "1.0.0")

API_PREFIX = "/api/v1"

DEBUG = os.getenv("DEBUG", "true").lower() == "true"

HOST = os.getenv("HOST", "0.0.0.0")
PORT = int(os.getenv("PORT", 8000))

# =========================
# AI
# =========================

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
GEMINI_MODEL = os.getenv("GEMINI_MODEL", "gemini-2.5-flash")