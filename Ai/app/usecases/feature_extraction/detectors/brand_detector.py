"""
Brand Detector

Sử dụng ALL_BRANDS từ data/brands/ để phát hiện thương hiệu
và kiểm tra xem domain có đang giả mạo thương hiệu đó không.
"""

from __future__ import annotations

from data.brands import ALL_BRANDS

# Build lookup index một lần lúc import — tránh tính toán lặp mỗi request.
# alias_lower → {display_name, official_domains, risk_profile}
_ALIAS_INDEX: dict[str, dict] = {}

for _brand in ALL_BRANDS:
    _entry = {
        "display_name": _brand["display_name"],
        "domains": [d.lower() for d in _brand["domains"]],
        "risk_profile": _brand.get("risk_profile", "medium"),
    }
    for _alias in _brand["aliases"]:
        _ALIAS_INDEX[_alias.lower()] = _entry


class BrandDetector:
    """
    Phát hiện thương hiệu bị mạo danh trong trang web.

    Logic:
        1. Tìm alias khớp trong visible_text (lowercase).
        2. Kiểm tra domain hiện tại có thuộc official domains không.
        3. Nếu alias khớp nhưng domain không thuộc official → impersonation.
    """

    def detect(self, text: str, domain: str) -> dict:
        lower_text = text.lower()
        lower_domain = domain.lower()

        for alias, entry in _ALIAS_INDEX.items():
            if alias not in lower_text:
                continue

            # Kiểm tra domain có hợp lệ không
            is_official = any(
                lower_domain == od or lower_domain.endswith("." + od)
                for od in entry["domains"]
            )

            return {
                "detected_brand": entry["display_name"],
                "brand_impersonation": not is_official,
            }

        return {"detected_brand": None, "brand_impersonation": False}
