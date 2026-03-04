"""Compare two DocInfo objects and produce a result dict."""

from __future__ import annotations

import difflib
from dataclasses import dataclass

from qai_checker_mini.extract import DocInfo, _strip_numbers, _NUM_RE


@dataclass
class CompareResult:
    numbers: list[dict]
    headings_only_in_a: list[str]
    headings_only_in_b: list[str]
    steps_only_in_a: list[str]
    steps_only_in_b: list[str]
    terminology: list[dict]


def _compare_numbers(a: DocInfo, b: DocInfo) -> list[dict]:
    """Context-based number comparison.

    Group numbers by their "context" (line text with numbers replaced by a
    placeholder). When the same context appears in both docs but with different
    numeric values, report the discrepancy.
    """
    issues: list[dict] = []

    # Build context -> list of (lineno, [values]) maps.
    def _build_ctx_map(doc: DocInfo) -> dict[str, list[tuple[int, list[str]]]]:
        ctx_map: dict[str, list[tuple[int, list[str]]]] = {}
        seen_lines: dict[int, bool] = {}
        for hit in doc.numbers:
            if hit.lineno in seen_lines:
                continue
            seen_lines[hit.lineno] = True
            ctx = _strip_numbers(hit.context)
            vals = [m.group(0) for m in _NUM_RE.finditer(hit.context)]
            ctx_map.setdefault(ctx, []).append((hit.lineno, vals))
        return ctx_map

    map_a = _build_ctx_map(a)
    map_b = _build_ctx_map(b)

    for ctx in sorted(set(map_a) & set(map_b)):
        entries_a = map_a[ctx]
        entries_b = map_b[ctx]
        # Compare pairwise (simplistic: zip the lists).
        for (ln_a, vals_a), (ln_b, vals_b) in zip(entries_a, entries_b):
            if vals_a == vals_b:
                continue
            max_len = max(len(vals_a), len(vals_b))
            for i in range(max_len):
                va = vals_a[i] if i < len(vals_a) else "(missing)"
                vb = vals_b[i] if i < len(vals_b) else "(missing)"
                if va != vb:
                    issues.append({
                        "issue": ctx.replace("__NUM__", "___", 1)[:60],
                        "a": va,
                        "b": vb,
                        "location": f"A:L{ln_a} / B:L{ln_b}",
                    })

    return issues


def _compare_headings(a: DocInfo, b: DocInfo) -> tuple[list[str], list[str]]:
    set_a = {h for _, h in a.headings}
    set_b = {h for _, h in b.headings}
    return sorted(set_a - set_b), sorted(set_b - set_a)


def _compare_steps(a: DocInfo, b: DocInfo) -> tuple[list[str], list[str]]:
    set_a = {s for _, s in a.steps}
    set_b = {s for _, s in b.steps}
    return sorted(set_a - set_b), sorted(set_b - set_a)


def _compare_terms(
    a: DocInfo, b: DocInfo, *, topk: int, min_sim: float
) -> list[dict]:
    only_a = a.terms - b.terms
    only_b = b.terms - a.terms

    candidates: list[dict] = []
    seen: set[tuple[str, str]] = set()

    for ta in sorted(only_a):
        for tb in sorted(only_b):
            key = (min(ta, tb), max(ta, tb))
            if key in seen:
                continue
            ratio = difflib.SequenceMatcher(None, ta.lower(), tb.lower()).ratio()
            if ratio >= min_sim:
                seen.add(key)
                candidates.append(
                    {"term_a": ta, "term_b": tb, "similarity": round(ratio, 3)}
                )

    candidates.sort(key=lambda c: c["similarity"], reverse=True)
    return candidates[:topk]


def compare(
    a: DocInfo,
    b: DocInfo,
    *,
    topk: int = 30,
    min_sim: float = 0.86,
) -> CompareResult:
    h_only_a, h_only_b = _compare_headings(a, b)
    s_only_a, s_only_b = _compare_steps(a, b)

    return CompareResult(
        numbers=_compare_numbers(a, b),
        headings_only_in_a=h_only_a,
        headings_only_in_b=h_only_b,
        steps_only_in_a=s_only_a,
        steps_only_in_b=s_only_b,
        terminology=_compare_terms(a, b, topk=topk, min_sim=min_sim),
    )
