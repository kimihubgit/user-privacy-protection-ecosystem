"""
app.data.languages
===================

Language reference data for content-language detection context. No logic.

Schema:

    {
        "code": str,   # ISO 639-1 code
        "name": str,   # English name
    }
"""

LANGUAGES = [
    {"code": "vi", "name": "Vietnamese"},
    {"code": "en", "name": "English"},
    {"code": "zh", "name": "Chinese"},
    {"code": "ja", "name": "Japanese"},
    {"code": "ko", "name": "Korean"},
    {"code": "th", "name": "Thai"},
    {"code": "id", "name": "Indonesian"},
    {"code": "ms", "name": "Malay"},
    {"code": "tl", "name": "Filipino"},
    {"code": "fr", "name": "French"},
    {"code": "de", "name": "German"},
    {"code": "es", "name": "Spanish"},
    {"code": "pt", "name": "Portuguese"},
    {"code": "ru", "name": "Russian"},
    {"code": "ar", "name": "Arabic"},
    {"code": "hi", "name": "Hindi"},
]
