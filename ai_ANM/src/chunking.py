"""Chia tài liệu thành các đoạn nhỏ, ưu tiên giữ cấu trúc văn bản pháp luật
(Chương -> Mục -> Điều -> Khoản) và bổ sung metadata ngữ nghĩa."""

import logging
import os
import re

from langchain_text_splitters import RecursiveCharacterTextSplitter

logger = logging.getLogger(__name__)

LEGAL_SEPARATORS = [
    r"\nĐiều\s+\d+",
    r"\n\d+\.\s",
    r"\n[a-zđ]\)\s",
]

MARKDOWN_SEPARATORS = [
    "\n#{1,6}",
    "'''\n",
    "\n\\*\\*\\*+\n",
    "\n---+\n",
    "\n___+\n",
    "\n\n",
    "\n",
    " ",
    "",
]

ALL_SEPARATORS = LEGAL_SEPARATORS + MARKDOWN_SEPARATORS

METADATA_PATTERNS = {
    "document_type": r"^(LUẬT|NGHỊ ĐỊNH|THÔNG TƯ|QUYẾT ĐỊNH)",
    "document_number": r"(?:Số hiệu|Số:?)\s*([0-9\/\w\-\.\:]+)",
    "article": r"(Điều\s+\d+)",
    "clause": r"(Khoản\s+\d+|\n\d+\.)",
    "point": r"(Điểm\s+[a-zđ]|[a-zđ]\))",
}


def parse_filename_metadata(filename: str) -> dict:
    """Trích xuất thông tin cơ bản từ tên file văn bản pháp luật."""
    metadata = {}
    name_without_ext = os.path.splitext(filename)[0]
    
    # Chuẩn hóa ký tự
    clean_name = name_without_ext.replace("_", ".").replace("-", ".").strip()
    
    # 1. Tìm loại văn bản
    if "luat" in clean_name.lower():
        metadata["document_type"] = "LUẬT"
    elif "nghi.dinh" in clean_name.lower() or "nd" in clean_name.lower():
        metadata["document_type"] = "NGHỊ ĐỊNH"
    elif "thong.tu" in clean_name.lower() or "tt" in clean_name.lower():
        metadata["document_type"] = "THÔNG TƯ"
        
    # 2. Tìm số hiệu văn bản (ví dụ: 24.2018.QH14 hoặc 53.2022.ND.CP)
    match_num = re.search(r"(\d+)[\.\/](\d+)[\.\/](QH\d+|ND[\.\-]?CP|TT[\.\-]?BCA|TT[\.\-]?BTTTT|BCA|TT)", clean_name, re.IGNORECASE)
    if match_num:
        num, year, suffix = match_num.group(1), match_num.group(2), match_num.group(3).upper()
        if "ND" in suffix:
            suffix = "NĐ-CP"
        elif "TT" in suffix and "BCA" in suffix:
            suffix = "TT-BCA"
        elif "TT" in suffix and "BTTTT" in suffix:
            suffix = "TT-BTTTT"
        metadata["document_number"] = f"{num}/{year}/{suffix}"
        
    # 3. Trích xuất tiêu đề (nếu có phần mô tả trong tên file)
    parts = clean_name.split(".")
    for part in parts:
        part_clean = part.strip()
        if any(keyword in part_clean.lower() for keyword in ["luat", "luật", "nghi dinh", "nghị định", "thong tu", "thông tư"]):
            metadata["title"] = part_clean
            break
            
    return metadata


def extract_metadata(text: str) -> dict:
    """Trích xuất metadata ngữ nghĩa (loại VB, số điều/khoản...) từ nội dung chunk."""

    metadata = {}

    for key, pattern in METADATA_PATTERNS.items():
        match = re.search(pattern, text, re.MULTILINE | re.IGNORECASE)
        if match:
            metadata[key] = match.group(1).strip()

    title = text.split("\n")[0].strip()
    if len(title) < 200:
        metadata["title"] = title

    return metadata


def split_documents(documents, chunk_size: int = 1000, chunk_overlap: int = 200):
    """
    Chia documents thành chunks và enrich metadata.

    Parameters
    ----------
    documents : list[Document]
    chunk_size : int
    chunk_overlap : int

    Returns
    -------
    list[Document]
    """
    text_splitter = RecursiveCharacterTextSplitter(
        separators=ALL_SEPARATORS,
        chunk_size=chunk_size,
        chunk_overlap=chunk_overlap,
        length_function=len,
        is_separator_regex=True,
    )

    chunks = text_splitter.split_documents(documents)

    for idx, chunk in enumerate(chunks):
        pdf_meta = chunk.metadata
        source_name = os.path.basename(pdf_meta.get("source", ""))
        
        semantic_meta = extract_metadata(chunk.page_content)
        filename_meta = parse_filename_metadata(source_name)

        # Kết hợp thông tin: ưu tiên metadata ngữ nghĩa trích xuất từ nội dung chunk,
        # và bổ sung thông tin thiếu từ tên file (như loại văn bản, số hiệu, tiêu đề).
        chunk.metadata = {
            **filename_meta,
            **semantic_meta,
            "chunk_id": idx,
            "page": pdf_meta.get("page", 0),
            "total_pages": pdf_meta.get("total_pages"),
            "source": source_name,
        }

    logger.info("Đã tạo %d chunks", len(chunks))

    return chunks
