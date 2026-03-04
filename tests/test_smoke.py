"""Smoke test: run the CLI on example files and verify basic structure."""

import subprocess
import sys
from pathlib import Path

EXAMPLES = Path(__file__).resolve().parent.parent / "examples"


def test_cli_runs_and_has_sections():
    result = subprocess.run(
        [sys.executable, "-m", "qai_checker_mini", str(EXAMPLES / "doc_a.md"), str(EXAMPLES / "doc_b.md")],
        capture_output=True,
        text=True,
    )
    assert result.returncode == 0, f"stderr: {result.stderr}"
    out = result.stdout
    assert "## numbers" in out
    assert "## missing" in out
    assert "## terminology" in out


def test_json_format():
    result = subprocess.run(
        [sys.executable, "-m", "qai_checker_mini", "--format", "json",
         str(EXAMPLES / "doc_a.md"), str(EXAMPLES / "doc_b.md")],
        capture_output=True,
        text=True,
    )
    assert result.returncode == 0
    import json
    data = json.loads(result.stdout)
    assert "numbers" in data
    assert "missing" in data
    assert "terminology" in data
