from enum import Enum


class DocumentType(str, Enum):
    """
    Loại tài liệu.
    """

    LUAT = "luat"

    NGHI_DINH = "nghi_dinh"

    THONG_TU = "thong_tu"

    QUYET_DINH = "quyet_dinh"

    OTHER = "other"