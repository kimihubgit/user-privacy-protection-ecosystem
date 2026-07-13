import sys
from pathlib import Path
from types import SimpleNamespace

sys.path.insert(0, str(Path(__file__).resolve().parent.parent / "src"))

from context import format_context, get_citations


def _make_doc(source, page, content="nội dung mẫu"):
    return SimpleNamespace(metadata={"source": source, "page": page}, page_content=content)


def test_get_citations_dedup_and_order():
    docs = [
        _make_doc("luat_a.pdf", 0),
        _make_doc("luat_b.pdf", 2),
        _make_doc("luat_a.pdf", 0),
    ]
    citations = get_citations(docs)
    assert citations == ["luat_a.pdf (Trang 1)", "luat_b.pdf (Trang 3)"]


def test_format_context_includes_source_and_page():
    docs = [_make_doc("luat_a.pdf", 0, content="Điều 1. Nội dung")]
    context = format_context(docs)
    assert "luat_a.pdf" in context
    assert "Trang: 1" in context
    assert "Điều 1. Nội dung" in context
