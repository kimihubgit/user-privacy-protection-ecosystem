"""
Token Usage Tracker

Ghi lại số token input/output của MỖI lần gọi LLM (theo từng Agent:
planner, evaluation, query_rewrite, risk_analysis, response,
answer_validation, outside_scope...) trong 1 request, rồi in ra
bảng điều khiển (dashboard) tổng kết ở cuối request.

Dùng contextvar thay vì biến global thường để an toàn khi nhiều
request chạy đồng thời (asyncio) — mỗi request có 1 danh sách
record riêng, không bị lẫn giữa các request.
"""

from __future__ import annotations

from contextvars import ContextVar
from dataclasses import dataclass


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
    """Ghi lại 1 lần gọi LLM. Bỏ qua an toàn nếu chưa reset() (vd:
    script/test gọi thẳng adapter mà không qua orchestrator)."""

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


def _format_table(rows: list[list[str]], headers: list[str]) -> str:

    widths = [
        max(len(str(row[i])) for row in ([headers] + rows))
        for i in range(len(headers))
    ]

    def _line(cells: list[str]) -> str:
        return " | ".join(
            str(cell).ljust(widths[i]) for i, cell in enumerate(cells)
        )

    separator = "-+-".join("-" * w for w in widths)

    lines = [_line(headers), separator]
    lines.extend(_line(row) for row in rows)

    return "\n".join(lines)


def render_table() -> str:
    """Trả về bảng token dạng text, kèm tổng cộng theo Agent và tổng
    toàn bộ request."""

    records = get_records()

    if not records:
        return "(Không có lệnh gọi LLM nào được ghi nhận)"

    rows = [
        [
            r.agent,
            r.provider,
            str(r.input_tokens),
            str(r.output_tokens),
            str(r.total_tokens),
        ]
        for r in records
    ]

    total_input = sum(r.input_tokens for r in records)
    total_output = sum(r.output_tokens for r in records)
    total_all = sum(r.total_tokens for r in records)

    rows.append(["TỔNG CỘNG", "", str(total_input), str(total_output), str(total_all)])

    return _format_table(
        rows,
        headers=["Agent", "Provider", "Input", "Output", "Total"],
    )


def print_table() -> None:

    print("\n========== TOKEN USAGE ==========")
    print(render_table())
    print("==================================\n")