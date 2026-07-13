"""
app.data.suspicious_extensions
================================

⏳ Deferred/optional dataset — add to as detectors need it.

File extension reference data used to flag risky attachments/downloads.
No logic.
"""

HIGH_RISK_EXTENSIONS = [
    ".exe",
    ".scr",
    ".bat",
    ".cmd",
    ".com",
    ".pif",
    ".msi",
    ".vbs",
    ".vbe",
    ".js",
    ".jse",
    ".jar",
    ".ps1",
    ".hta",
    ".wsf",
    ".lnk",
    ".reg",
    ".apk",
    ".dll",
]

MEDIUM_RISK_EXTENSIONS = [
    ".zip",
    ".rar",
    ".7z",
    ".iso",
    ".img",
    ".docm",
    ".xlsm",
    ".pptm",
    ".html",
    ".htm",
]

LOW_RISK_EXTENSIONS = [
    ".pdf",
    ".docx",
    ".xlsx",
    ".pptx",
    ".txt",
    ".csv",
    ".png",
    ".jpg",
    ".jpeg",
]
