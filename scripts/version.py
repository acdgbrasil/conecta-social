#!/usr/bin/env python3
from __future__ import annotations

import argparse
import subprocess
import sys
from dataclasses import dataclass
from typing import Sequence


@dataclass
class CliArgs:
    bump_type: str
    dry_run: bool
    extra: list[str]


def parse_args(argv: Sequence[str]) -> CliArgs:
    parser = argparse.ArgumentParser(
        description="Wrapper para versionamento semver via `bun pm version`."
    )
    parser.add_argument(
        "bump_type",
        choices=["patch", "minor", "major", "prerelease"],
        help="Tipo de incremento semver.",
    )
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="Exibe o comando sem executar alteracoes.",
    )
    known, extra = parser.parse_known_args(argv)
    return CliArgs(
        bump_type=known.bump_type,
        dry_run=known.dry_run,
        extra=strip_separator(extra),
    )


def strip_separator(values: list[str]) -> list[str]:
    if values and values[0] == "--":
        return values[1:]
    return values


def main(argv: Sequence[str]) -> int:
    args = parse_args(argv)
    cmd = ["bun", "pm", "version", args.bump_type, *args.extra]

    if args.dry_run:
        print("[dry-run]", " ".join(cmd))
    else:
        try:
            subprocess.run(cmd, check=True)
        except subprocess.CalledProcessError as exc:
            return exc.returncode

    print("\nProximos passos:")
    print("- Atualize changelog/report no handbook (reports/daily ou reports/refactor).")
    print('- Gere tag anotada: git tag -a v<nova-versao> -m "<mensagem>" && git push --tags')
    print("- Verifique pacotes afetados (workspaces) e publique se aplicavel.")
    print("- Rode a suite: bun test")
    return 0


if __name__ == "__main__":
    raise SystemExit(main(sys.argv[1:]))
