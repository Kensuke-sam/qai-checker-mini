"""CLI entry-point using argparse."""

from __future__ import annotations

import argparse
import pathlib
import sys

from qai_checker_mini.extract import extract_all
from qai_checker_mini.compare import compare
from qai_checker_mini.render import render


def build_parser() -> argparse.ArgumentParser:
    p = argparse.ArgumentParser(
        prog="qai-checker-mini",
        description="Compare two documents and report discrepancies.",
    )
    p.add_argument("file_a", type=pathlib.Path, help="Path to document A")
    p.add_argument("file_b", type=pathlib.Path, help="Path to document B")
    p.add_argument(
        "--format",
        choices=("md", "json"),
        default="md",
        dest="fmt",
        help="Output format (default: md)",
    )
    p.add_argument(
        "--topk",
        type=int,
        default=30,
        help="Max terminology-variant candidates to show (default: 30)",
    )
    p.add_argument(
        "--min-sim",
        type=float,
        default=0.86,
        help="Minimum similarity threshold for terminology variants (default: 0.86)",
    )
    return p


def main(argv: list[str] | None = None) -> None:
    args = build_parser().parse_args(argv)

    for p in (args.file_a, args.file_b):
        if not p.exists():
            print(f"Error: file not found: {p}", file=sys.stderr)
            sys.exit(1)

    text_a = args.file_a.read_text(encoding="utf-8")
    text_b = args.file_b.read_text(encoding="utf-8")

    info_a = extract_all(text_a)
    info_b = extract_all(text_b)

    result = compare(info_a, info_b, topk=args.topk, min_sim=args.min_sim)

    output = render(result, fmt=args.fmt)
    print(output)
