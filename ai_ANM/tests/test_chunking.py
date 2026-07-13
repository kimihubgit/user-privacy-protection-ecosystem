import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent / "src"))

from chunking import extract_metadata


def test_extract_metadata_document_type():
    text = "LUẬT AN NINH MẠNG\nĐiều 1. Phạm vi điều chỉnh"
    metadata = extract_metadata(text)
    assert metadata.get("document_type") == "LUẬT"
    assert metadata.get("article") == "Điều 1"


def test_extract_metadata_empty_text():
    metadata = extract_metadata("")
    assert isinstance(metadata, dict)
