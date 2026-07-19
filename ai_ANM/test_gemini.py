from google import genai
from config.settings import settings

print("MODEL =", settings.GEMINI_MODEL)
print("KEY =", settings.GEMINI_API_KEY[:10] + "...")

client = genai.Client(api_key=settings.GEMINI_API_KEY)

response = client.models.generate_content(
    model=settings.GEMINI_MODEL,
    contents="Xin chào"
)

print(response.text)