"""
Evaluation Harness

Đo hiệu năng của 3 Agent bằng bộ dữ liệu có nhãn (dataset.json):

1. Planner Agent      -> Accuracy phân loại intent.
2. Retrieval (Hybrid) -> Recall@K (so với expected_dieu / expected_doc_ids).
3. Evaluation Agent   -> Accuracy / Precision / Recall khi đánh giá
                         evidence có "relevant" hay không.

Chạy từ thư mục gốc project (đã cài đủ dependency + .env có key thật):

    python -m scripts.eval.run_eval

Lưu ý: retrieval_cases trong dataset.json cần bạn tự điền
expected_dieu (số Điều luật đúng) hoặc expected_doc_ids (id thật
trong Pinecone) dựa trên dữ liệu đã index — không có nhãn thì recall
sẽ hiện "N/A".
"""

from __future__ import annotations

import asyncio
import json
from pathlib import Path

from application.models.agent_context import AgentContext
from application.models.evidence import Evidence
from application.models.llm_result import LLMResult

from config.di_container import (
    planner_agent,
    retriever,
    evaluation_agent,
    answer_validation_agent,
)
from config.settings import settings

from domain.entities.retrieved_document import RetrievedDocument


DATASET_PATH = Path(__file__).parent / "dataset.json"


def _pct(value: float | None) -> str:
    return f"{value:.2%}" if value is not None else "N/A"


async def eval_planner(cases: list[dict]) -> tuple[float, list[tuple]]:

    agent = planner_agent()

    rows = []

    for case in cases:

        context = AgentContext(message=case["question"])

        plan = await agent.plan(context)

        ok = plan.intent == case["expected_intent"]

        rows.append(
            (case["question"], case["expected_intent"], plan.intent, ok),
        )

    correct = sum(1 for row in rows if row[3])

    accuracy = correct / len(rows) if rows else 0.0

    return accuracy, rows


K_VALUES = [1, 3, 5]


def _is_hit(doc: RetrievedDocument, expected_ids: set, expected_dieu) -> bool:

    if expected_ids and doc.id in expected_ids:
        return True

    if expected_dieu and doc.dieu == expected_dieu:
        return True

    return False


async def eval_retrieval(
    cases: list[dict],
) -> tuple[dict[int, float] | None, float | None, list[tuple]]:
    """
    Đo Recall@k cho từng k trong K_VALUES + MRR (Mean Reciprocal Rank).

    Recall@k: trong top-k tài liệu trả về, có ít nhất 1 tài liệu đúng
    (theo expected_doc_ids hoặc expected_dieu) hay không.

    MRR: 1 / vị trí (rank) của tài liệu đúng đầu tiên tìm thấy trong
    top_k lớn nhất (K_VALUES[-1]); 0 nếu không tìm thấy trong phạm vi
    đó. Phản ánh tài liệu đúng nằm CÀNG GẦN đầu danh sách càng tốt,
    khác Recall@k vốn chỉ trả lời có/không.
    """

    r = retriever()

    max_k = max(K_VALUES)

    recalls_by_k: dict[int, list[float]] = {k: [] for k in K_VALUES}

    reciprocal_ranks: list[float] = []

    rows = []

    for case in cases:

        namespace = getattr(
            settings,
            case["namespace_setting"],
        )

        docs = await r.retrieve(
            query=case["query"],
            top_k=max_k,
            namespace=namespace,
        )

        expected_ids = set(case.get("expected_doc_ids") or [])
        expected_dieu = case.get("expected_dieu")

        has_label = bool(expected_ids or expected_dieu)

        rank = None

        if has_label:

            for i, doc in enumerate(docs, start=1):

                if _is_hit(doc, expected_ids, expected_dieu):
                    rank = i
                    break

            reciprocal_ranks.append(1.0 / rank if rank else 0.0)

            for k in K_VALUES:
                recalls_by_k[k].append(
                    1.0 if (rank is not None and rank <= k) else 0.0,
                )

        rows.append(
            (case["query"], [d.id for d in docs[:max_k]], rank),
        )

    if not reciprocal_ranks:
        return None, None, rows

    avg_recall_by_k = {
        k: sum(vals) / len(vals)
        for k, vals in recalls_by_k.items()
    }

    mrr = sum(reciprocal_ranks) / len(reciprocal_ranks)

    return avg_recall_by_k, mrr, rows


async def eval_evaluation_agent(
    cases: list[dict],
) -> tuple[dict, list[tuple]]:

    agent = evaluation_agent()

    tp = fp = tn = fn = 0

    rows = []

    for case in cases:

        evidence = Evidence(
            documents=[
                RetrievedDocument(
                    id="test",
                    content=case["evidence_text"],
                    source="test",
                    score=1.0,
                ),
            ],
        )

        result = await agent.evaluate(
            question=case["question"],
            evidence=evidence,
        )

        predicted = result.relevant
        expected = case["expected_relevant"]

        if predicted and expected:
            tp += 1
        elif predicted and not expected:
            fp += 1
        elif not predicted and not expected:
            tn += 1
        else:
            fn += 1

        rows.append((case["question"], expected, predicted))

    total = tp + fp + tn + fn

    metrics = {
        "accuracy": (tp + tn) / total if total else None,
        "precision": tp / (tp + fp) if (tp + fp) else None,
        "recall": tp / (tp + fn) if (tp + fn) else None,
    }

    return metrics, rows


async def eval_answer_validation(
    cases: list[dict],
) -> tuple[dict, list[tuple]]:
    """
    Đo AnswerValidationAgent có phát hiện đúng câu trả lời KHÔNG được
    Evidence hỗ trợ (hallucination) hay không.

    Positive class = "not grounded" (câu trả lời có bịa thông tin) —
    vì đây là trường hợp quan trọng cần bắt được, giống cách tính
    precision/recall cho phát hiện gian lận/lỗi.
    """

    agent = answer_validation_agent()

    tp = fp = tn = fn = 0

    rows = []

    for case in cases:

        evidence = Evidence(
            documents=[
                RetrievedDocument(
                    id="test",
                    content=case["evidence_text"],
                    source="test",
                    score=1.0,
                ),
            ],
        )

        llm_result = LLMResult(
            reply=case["answer_text"],
            success=True,
        )

        result = await agent.validate(
            question=case["question"],
            llm_result=llm_result,
            evidence=evidence,
        )

        predicted_grounded = result.metadata.get("grounded")
        expected_grounded = case["expected_grounded"]

        # positive = "not grounded" (hallucination)
        predicted_positive = predicted_grounded is False
        expected_positive = expected_grounded is False

        if predicted_positive and expected_positive:
            tp += 1
        elif predicted_positive and not expected_positive:
            fp += 1
        elif not predicted_positive and not expected_positive:
            tn += 1
        else:
            fn += 1

        rows.append(
            (
                case["question"],
                case["answer_text"],
                expected_grounded,
                predicted_grounded,
            ),
        )

    total = tp + fp + tn + fn

    metrics = {
        "accuracy": (tp + tn) / total if total else None,
        "precision": tp / (tp + fp) if (tp + fp) else None,
        "recall": tp / (tp + fn) if (tp + fn) else None,
    }

    return metrics, rows


async def main() -> None:

    dataset = json.loads(
        DATASET_PATH.read_text(encoding="utf-8"),
    )

    print("=" * 70)
    print("1. PLANNER AGENT — Intent Classification Accuracy")
    print("=" * 70)

    accuracy, rows = await eval_planner(
        dataset["planner_cases"],
    )

    for question, expected, predicted, ok in rows:

        mark = "✅" if ok else "❌"

        print(
            f"{mark} predicted={predicted:<15} expected={expected:<15} | {question}",
        )

    print(f"\nAccuracy: {_pct(accuracy)} "
          f"({sum(r[3] for r in rows)}/{len(rows)})\n")

    print("=" * 70)
    print("2. RETRIEVAL (Hybrid Dense + BM25) — Recall@k & MRR")
    print("=" * 70)

    recall_by_k, mrr, rows = await eval_retrieval(
        dataset["retrieval_cases"],
    )

    for query, ids, rank in rows:

        rank_text = f"rank={rank}" if rank else "không tìm thấy"

        print(f"- {query}")
        print(f"  top_k ids: {ids}")
        print(f"  {rank_text}\n")

    if recall_by_k is not None:

        for k in sorted(recall_by_k):
            print(f"Recall@{k}: {_pct(recall_by_k[k])}")

        print(f"MRR:      {mrr:.3f}\n")

    else:
        print(
            "Chưa có case nào được gắn nhãn expected_dieu/"
            "expected_doc_ids trong dataset.json -> điền để đo "
            "recall thật.\n",
        )

    print("=" * 70)
    print("3. EVALUATION AGENT — Relevant Classification")
    print("=" * 70)

    metrics, rows = await eval_evaluation_agent(
        dataset["evaluation_cases"],
    )

    for question, expected, predicted in rows:

        mark = "✅" if expected == predicted else "❌"

        print(
            f"{mark} expected_relevant={expected} predicted={predicted} | {question}",
        )

    print(f"\nAccuracy:  {_pct(metrics['accuracy'])}")
    print(f"Precision: {_pct(metrics['precision'])}")
    print(f"Recall:    {_pct(metrics['recall'])}")

    print()
    print("=" * 70)
    print("4. ANSWER VALIDATION — Groundedness (câu trả lời so với Evidence)")
    print("=" * 70)

    av_metrics, av_rows = await eval_answer_validation(
        dataset["answer_validation_cases"],
    )

    for question, answer, expected, predicted in av_rows:

        mark = "✅" if expected == predicted else "❌"

        print(f"{mark} expected_grounded={expected} predicted={predicted}")
        print(f"   Q: {question}")
        print(f"   A: {answer}\n")

    print("(Positive class = KHÔNG grounded / có hallucination)")
    print(f"Accuracy:  {_pct(av_metrics['accuracy'])}")
    print(f"Precision: {_pct(av_metrics['precision'])}")
    print(f"Recall:    {_pct(av_metrics['recall'])}")


if __name__ == "__main__":
    asyncio.run(main())
