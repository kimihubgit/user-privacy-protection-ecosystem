from dataclasses import dataclass, field


@dataclass(slots=True)
class RetrievedDocument:

    id: str

    content: str

    source: str

    score: float = 0.0

    metadata: dict = field(
        default_factory=dict,
    )

    @property
    def page(self):
        return self.metadata.get("page")

    @property
    def url(self):
        return self.metadata.get("url")

    @property
    def title(self):
        return self.metadata.get("title")

    @property
    def category(self):
        return self.metadata.get("category")

    @property
    def namespace(self):
        return self.metadata.get("namespace")

    @property
    def language(self):
        return self.metadata.get("language")

    # =====================================================
    # Metadata luật (Điều/Khoản/Điểm...) — schema mới của
    # namespace cyber_law.
    # =====================================================

    @property
    def dieu(self):
        return self.metadata.get("dieu")

    @property
    def dieu_ten(self):
        return self.metadata.get("dieu_ten")

    @property
    def khoan(self):
        return self.metadata.get("khoan")

    @property
    def diem(self):
        return self.metadata.get("diem")

    @property
    def chuong(self):
        return self.metadata.get("chuong")

    @property
    def chuong_ten(self):
        return self.metadata.get("chuong_ten")

    @property
    def muc(self):
        return self.metadata.get("muc")

    @property
    def muc_ten(self):
        return self.metadata.get("muc_ten")

    @property
    def ten_van_ban(self):
        return self.metadata.get("ten_van_ban")

    @property
    def so_hieu(self):
        return self.metadata.get("so_hieu")

    @property
    def loai_van_ban(self):
        return self.metadata.get("loai_van_ban")

    @property
    def co_quan_ban_hanh(self):
        return self.metadata.get("co_quan_ban_hanh")

    @property
    def ngay_ban_hanh(self):
        return self.metadata.get("ngay_ban_hanh")

    @property
    def source_file(self):
        return self.metadata.get("source_file")

    @property
    def legal_citation(self) -> str | None:
        """
        Trích dẫn pháp lý dạng:
        "Điều 8 (Tên điều) - Khoản 2 - Điểm a, b, c, Tên văn bản (số hiệu)"

        Trả None nếu tài liệu không có thông tin Điều (vd: tài liệu
        scam_knowledge, web_search...) -> ContextBuilder sẽ fallback về
        định dạng nguồn cũ (source/page).
        """

        if not self.dieu:
            return None

        parts = [f"Điều {self.dieu}"]

        if self.dieu_ten:
            parts[-1] += f" ({self.dieu_ten})"

        if self.khoan:
            parts.append(f"Khoản {self.khoan}")

        if self.diem:
            parts.append(f"Điểm {self.diem}")

        citation = " - ".join(parts)

        doc_name = self.ten_van_ban or self.source_file or ""

        if doc_name:
            citation += f", {doc_name}"

        if self.so_hieu:
            citation += f" (số {self.so_hieu})"

        return citation