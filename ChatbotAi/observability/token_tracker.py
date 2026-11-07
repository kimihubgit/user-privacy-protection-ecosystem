"""
Token Usage Tracker

Ghi lại số token input/output của MỖI lần gọi LLM (theo từng Agent:
planner, evaluation, query_rewrite, risk_analysis, response,
answer_validation, outside_scope...) trong 1 request.
"""

from __future__ import annotations

from contextvars import ContextVar
from dataclasses import dataclass

from config.settings import settings


@dataclass(slots=True)
class TokenRecord:

    agent: str

    provider: str

    input_tokens: int

    output_tokens: int

    @property
    def total_tokens(self) -> int:
        return self.input_tokens + self.output_tokens


_records: ContextVar[list[TokenRecord] | None] = ContextVar(
    "token_records",
    default=None,
)


def reset() -> None:
    """Gọi ở đầu mỗi request để bắt đầu 1 phiên đếm token mới."""
    _records.set([])


def record(
    *,
    agent: str,
    provider: str,
    input_tokens: int,
    output_tokens: int,
) -> None:
    """Ghi lại 1 lần gọi LLM. Bỏ qua an toàn nếu chưa reset()."""

    current = _records.get()

    if current is None:
        current = []
        _records.set(current)

    current.append(
        TokenRecord(
            agent=agent,
            provider=provider,
            input_tokens=input_tokens or 0,
            output_tokens=output_tokens or 0,
        )
    )


def get_records() -> list[TokenRecord]:
    return list(_records.get() or [])


def get_summary() -> str:
    """Trả về chuỗi tóm tắt ngắn gọn: vd 'Tokens: 1,870 in / 177 out (Tổng: 2,047)'."""
    records = get_records()
    if not records:
        return "0 tokens"

    total_input = sum(r.input_tokens for r in records)
    total_output = sum(r.output_tokens for r in records)
    total_all = sum(r.total_tokens for r in records)

    return f"Tokens: {total_input:,} in / {total_output:,} out (Tổng: {total_all:,})"


def _format_table(rows: list[list[str]], headers: list[str]) -> str:
    widths = [
        max(len(str(row[i])) for row in ([headers] + rows))
        for i in range(len(headers))
    ]

    def _line(cells: list[str]) -> str:
        return " │ ".join(
            str(cell).ljust(widths[i]) for i, cell in enumerate(cells)
        )

    top_border = "┌─" + "─┬─".join("─" * w for w in widths) + "─┐"
    header_sep = "├─" + "─┼─".join("─" * w for w in widths) + "─┤"
    bottom_border = "└─" + "─┴─".join("─" * w for w in widths) + "─┘"

    lines = [top_border, "│ " + _line(headers) + " │", header_sep]
    for row in rows[:-1]:
        lines.append("│ " + _line(row) + " │")
    lines.append(header_sep)
    lines.append("│ " + _line(rows[-1]) + " │")
    lines.append(bottom_border)

    return "\n".join(lines)


def render_table() -> str:
    """Trả về bảng token dạng khung Unicode đẹp mắt."""
    records = get_records()

    if not records:
        return "(Không có lệnh gọi LLM nào)"

    rows = [
        [
            r.agent,
            r.provider,
            f"{r.input_tokens:,}",
            f"{r.output_tokens:,}",
            f"{r.total_tokens:,}",
        ]
        for r in records
    ]

    total_input = sum(r.input_tokens for r in records)
    total_output = sum(r.output_tokens for r in records)
    total_all = sum(r.total_tokens for r in records)

    rows.append(["TỔNG CỘNG", "", f"{total_input:,}", f"{total_output:,}", f"{total_all:,}"])

    return _format_table(
        rows,
        headers=["Agent", "Provider", "Input", "Output", "Total"],
    )


def print_table() -> None:
    """Chỉ in bảng chi tiết khi bật DEBUG mode."""
    if settings.DEBUG:
        records = get_records()
        if records:
            print("\n" + render_table() + "\n")
