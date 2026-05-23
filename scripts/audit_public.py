#!/usr/bin/env python3
"""Fail on obvious private or machine-local material before publishing."""

from __future__ import annotations

import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SKIP_DIRS = {".git", "node_modules", "public", ".quartz-cache"}
SECRET_PATTERNS = [
    re.compile(r"-----BEGIN (?:RSA |OPENSSH |EC |DSA )?PRIVATE KEY-----"),
    re.compile(r"(?i)\b(api[_-]?key|secret|token|password)\s*[:=]\s*['\"]?[A-Za-z0-9_./+=-]{16,}"),
    re.compile(r"\b[A-Z]:\\Users\\[^\\\s]+"),
    re.compile(r"/Users/[^/\s]+"),
    re.compile(r"/home/[^/\s]+"),
]
FORBIDDEN_PARTS = {
    ".obsidian/plugins",
    ".obsidian/cache",
    ".obsidian/logs",
}


def rel(path: Path) -> str:
    return path.resolve().relative_to(ROOT).as_posix()


def iter_files() -> list[Path]:
    files: list[Path] = []
    for path in ROOT.rglob("*"):
        parts = set(path.relative_to(ROOT).parts)
        if parts & SKIP_DIRS:
            continue
        if path == Path(__file__).resolve():
            continue
        if path.is_file():
            files.append(path)
    return files


def main() -> int:
    errors: list[str] = []
    for path in iter_files():
        name = rel(path)
        if any(part in name for part in FORBIDDEN_PARTS):
            errors.append(f"forbidden Obsidian state: {name}")
            continue
        if path.suffix.lower() in {".png", ".jpg", ".jpeg", ".gif", ".webp", ".pdf"}:
            continue
        try:
            text = path.read_text(encoding="utf-8")
        except UnicodeDecodeError:
            continue
        for pattern in SECRET_PATTERNS:
            if pattern.search(text):
                errors.append(f"possible private material in {name}")
                break
    for error in errors:
        print(error, file=sys.stderr)
    if errors:
        return 1
    print("public audit passed")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
