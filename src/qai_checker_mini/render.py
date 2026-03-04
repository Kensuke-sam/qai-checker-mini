"""Render CompareResult as Markdown or JSON."""

from __future__ import annotations

import json

from qai_checker_mini.compare import CompareResult


def _render_md(r: CompareResult) -> str:
    lines: list[str] = []

    # --- numbers ---
    lines.append("## numbers\n")
    if r.numbers:
        lines.append("| issue | a | b | location |")
        lines.append("|---|---|---|---|")
        for row in r.numbers:
            lines.append(
                f"| {row['issue']} | {row['a']} | {row['b']} | {row['location']} |"
            )
    else:
        lines.append("No numeric discrepancies found.")
    lines.append("")

    # --- missing ---
    lines.append("## missing\n")

    lines.append("### headings_only_in_a\n")
    for h in r.headings_only_in_a:
        lines.append(f"- {h}")
    if not r.headings_only_in_a:
        lines.append("(none)")
    lines.append("")

    lines.append("### headings_only_in_b\n")
    for h in r.headings_only_in_b:
        lines.append(f"- {h}")
    if not r.headings_only_in_b:
        lines.append("(none)")
    lines.append("")

    lines.append("### steps_only_in_a\n")
    for s in r.steps_only_in_a:
        lines.append(f"- {s}")
    if not r.steps_only_in_a:
        lines.append("(none)")
    lines.append("")

    lines.append("### steps_only_in_b\n")
    for s in r.steps_only_in_b:
        lines.append(f"- {s}")
    if not r.steps_only_in_b:
        lines.append("(none)")
    lines.append("")

    # --- terminology ---
    lines.append("## terminology\n")
    if r.terminology:
        lines.append("| term_a | term_b | similarity |")
        lines.append("|---|---|---|")
        for row in r.terminology:
            lines.append(
                f"| {row['term_a']} | {row['term_b']} | {row['similarity']} |"
            )
    else:
        lines.append("No terminology variants found.")
    lines.append("")

    return "\n".join(lines)


def _render_json(r: CompareResult) -> str:
    data = {
        "numbers": r.numbers,
        "missing": {
            "headings_only_in_a": r.headings_only_in_a,
            "headings_only_in_b": r.headings_only_in_b,
            "steps_only_in_a": r.steps_only_in_a,
            "steps_only_in_b": r.steps_only_in_b,
        },
        "terminology": r.terminology,
    }
    return json.dumps(data, ensure_ascii=False, indent=2)


def render(result: CompareResult, *, fmt: str = "md") -> str:
    if fmt == "json":
        return _render_json(result)
    return _render_md(result)
