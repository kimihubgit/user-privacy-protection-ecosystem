"""
app.data.mime_types
====================

MIME type reference data used to classify fetched resources / attachments.
No logic.
"""

SAFE_MIME_TYPES = [
    "text/html",
    "text/plain",
    "text/css",
    "image/png",
    "image/jpeg",
    "image/gif",
    "image/svg+xml",
    "image/webp",
    "font/woff",
    "font/woff2",
    "application/json",
]

DOCUMENT_MIME_TYPES = [
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/vnd.ms-excel",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "application/vnd.ms-powerpoint",
    "application/vnd.openxmlformats-officedocument.presentationml.presentation",
]

HIGH_RISK_MIME_TYPES = [
    "application/x-msdownload",
    "application/x-msdos-program",
    "application/x-executable",
    "application/vnd.microsoft.portable-executable",
    "application/x-sh",
    "application/x-bat",
    "application/java-archive",
    "application/x-msi",
    "application/x-ms-installer",
    "application/octet-stream",
    "application/vnd.ms-htmlhelp",
    "application/hta",
]

ARCHIVE_MIME_TYPES = [
    "application/zip",
    "application/x-rar-compressed",
    "application/x-7z-compressed",
    "application/x-tar",
    "application/gzip",
]
