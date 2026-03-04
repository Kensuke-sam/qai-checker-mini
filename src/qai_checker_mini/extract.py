"""Extract numbers, headings, list items, and terms from a document."""

from __future__ import annotations

import re
from dataclasses import dataclass


@dataclass
class NumberHit:
    lineno: int
    value: str       # raw matched text, e.g. "15,000,000円"
    context: str     # the full line text (for matching across docs)


@dataclass
class DocInfo:
    numbers: list[NumberHit]
    headings: list[tuple[int, str]]  # (line_no, heading text)
    steps: list[tuple[int, str]]     # (line_no, list-item text)
    terms: set[str]


# Matches integers, decimals, comma-separated numbers, optionally followed by
# a short unit-like suffix (e.g. "100MB", "3.14%", "1,200円").
# Use [0-9] look-behind/ahead to avoid splitting on Japanese word chars.
_NUM_RE = re.compile(
    r"(?<![0-9.])"
    r"(\d{1,3}(?:,\d{3})*(?:\.\d+)?|\d+(?:\.\d+)?)"
    r"([A-Za-z%°円個件台本枚名人日月年時分秒回目]*)"
    r"(?![0-9])"
)

# Terms: ASCII words (>=2 chars), katakana runs, CamelCase, snake_case.
_TERM_RE = re.compile(
    r"[A-Z][a-z]+(?:[A-Z][a-z]+)+"  # CamelCase
    r"|[a-z]+(?:_[a-z]+)+"          # snake_case
    r"|[\u30A0-\u30FF]{2,}"         # katakana >=2
    r"|[A-Za-z][A-Za-z0-9]{1,}",    # general ascii token >=2
    re.UNICODE,
)


def _strip_numbers(line: str) -> str:
    """Replace all numbers in a line with a placeholder for context matching."""
    return _NUM_RE.sub("__NUM__", line).strip()


def _extract_numbers(text: str) -> list[NumberHit]:
    results: list[NumberHit] = []
    for lineno, line in enumerate(text.splitlines(), 1):
        for m in _NUM_RE.finditer(line):
            raw = m.group(0)
            results.append(NumberHit(lineno=lineno, value=raw, context=line.strip()))
    return results


def _extract_headings(text: str) -> list[tuple[int, str]]:
    results: list[tuple[int, str]] = []
    for lineno, line in enumerate(text.splitlines(), 1):
        m = re.match(r"^(#{1,6})\s+(.*)", line)
        if m:
            results.append((lineno, m.group(2).strip()))
    return results


def _extract_steps(text: str) -> list[tuple[int, str]]:
    results: list[tuple[int, str]] = []
    for lineno, line in enumerate(text.splitlines(), 1):
        m = re.match(r"^[ \t]*(?:[-*]|\d+\.)\s+(.*)", line)
        if m:
            results.append((lineno, m.group(1).strip()))
    return results


def _extract_terms(text: str) -> set[str]:
    return set(_TERM_RE.findall(text))


def extract_all(text: str) -> DocInfo:
    return DocInfo(
        numbers=_extract_numbers(text),
        headings=_extract_headings(text),
        steps=_extract_steps(text),
        terms=_extract_terms(text),
    )
