#!/usr/bin/env python3
"""Run unit tests and enforce minimum line coverage from Bun output."""

from __future__ import annotations

import re
import subprocess
import sys


UNIT_PATHS = [
    "src/shared/tests/unit",
    "src/shared/adapters/tests/unit",
    "src/infrastructure/runtime/bun/tests/unit",
    "src/modules/social-care/application/tests/unit",
    "src/modules/social-care/domain/tests/unit",
    "src/modules/social-care/interface/adapter/commands/tests/unit",
    "src/modules/social-care/interface/adapter/http",
    "src/modules/social-care/interface/adapter/persistence/tests/unit",
]

ALL_FILES_LINE_RE = re.compile(
    r"^\s*All files\s*\|\s*[^|]+\|\s*([0-9]+(?:\.[0-9]+)?)\s*\|",
    re.MULTILINE,
)


def parse_min_coverage(argv: list[str]) -> float:
    if len(argv) < 2:
        return 98.0
    try:
        return float(argv[1])
    except ValueError:
        print(f"Invalid minimum coverage value: {argv[1]}", file=sys.stderr)
        raise SystemExit(2)


def run_unit_tests() -> subprocess.CompletedProcess[str]:
    cmd = ["bun", "test", *UNIT_PATHS]
    return subprocess.run(
        cmd,
        stdout=subprocess.PIPE,
        stderr=subprocess.STDOUT,
        text=True,
        check=False,
    )


def extract_line_coverage(output: str) -> float:
    match = ALL_FILES_LINE_RE.search(output)
    if not match:
        print("Could not parse unit line coverage from bun output.", file=sys.stderr)
        raise SystemExit(2)
    return float(match.group(1))


def main(argv: list[str]) -> int:
    min_coverage = parse_min_coverage(argv)
    result = run_unit_tests()
    output = result.stdout or ""
    print(output, end="")

    if result.returncode != 0:
        return result.returncode

    line_coverage = extract_line_coverage(output)
    print(
        f"Unit line coverage (Bun All files): {line_coverage:.2f}% "
        f"(minimum {min_coverage:.2f}%)"
    )

    if line_coverage + 1e-9 < min_coverage:
        return 1
    return 0


if __name__ == "__main__":
    raise SystemExit(main(sys.argv))
