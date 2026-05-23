#!/usr/bin/env python3
"""Deterministic maintenance tooling for the core LLM Wiki."""

from __future__ import annotations

import argparse
import json
import os
import re
import sys
from datetime import date
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
RAW_DIR = ROOT / "Raw" / "Sources"
WIKI_DIR = ROOT / "Wiki"
SCHEMA_DIR = ROOT / "Schema"
CATALOG = WIKI_DIR / "catalog.jsonl"
MANIFEST = SCHEMA_DIR / "source-manifest.jsonl"
WIKI_FOLDERS = {
    "Topics": "topic",
    "Concepts": "concept",
    "Entities": "entity",
    "Projects": "project",
    "Logs": "log",
}
ALLOWED_TAGS = set(WIKI_FOLDERS.values())
REQUIRED_SOURCE_FIELDS = {"Title", "Reference", "Created", "Processed", "tags"}


def rel(path: Path) -> str:
    return path.resolve().relative_to(ROOT).as_posix()


def read_text(path: Path) -> str:
    return path.read_text(encoding="utf-8")


def write_text(path: Path, text: str) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(text, encoding="utf-8", newline="\n")


def split_frontmatter(text: str) -> tuple[dict[str, object], str]:
    if not text.startswith("---\n"):
        return {}, text
    end = text.find("\n---", 4)
    if end == -1:
        return {}, text
    raw = text[4:end]
    body = text[end + 4 :].lstrip("\n")
    return parse_simple_yaml(raw), body


def parse_scalar(value: str) -> object:
    value = value.strip()
    if value in {"true", "True"}:
        return True
    if value in {"false", "False"}:
        return False
    if value == "[]":
        return []
    if value.startswith("[") and value.endswith("]"):
        inner = value[1:-1].strip()
        if not inner:
            return []
        return [parse_scalar(part.strip()) for part in inner.split(",")]
    if value.startswith('"') and value.endswith('"'):
        return value[1:-1]
    if re.fullmatch(r"-?\d+", value):
        return int(value)
    return value


def parse_simple_yaml(raw: str) -> dict[str, object]:
    data: dict[str, object] = {}
    current: str | None = None
    for line in raw.splitlines():
        if not line.strip():
            continue
        if line.startswith("  - ") and current:
            data.setdefault(current, [])
            if isinstance(data[current], list):
                data[current].append(parse_scalar(line[4:]))
            continue
        if ":" in line and not line.startswith(" "):
            key, value = line.split(":", 1)
            key = key.strip()
            value = value.strip()
            current = key
            data[key] = [] if value == "" else parse_scalar(value)
    return data


def md_files(folder: Path) -> list[Path]:
    if not folder.exists():
        return []
    return sorted(p for p in folder.rglob("*.md") if p.name.lower() != "index.md")


def raw_sources() -> list[Path]:
    return md_files(RAW_DIR)


def compiled_notes() -> list[Path]:
    notes: list[Path] = []
    for name in WIKI_FOLDERS:
        notes.extend(md_files(WIKI_DIR / name))
    return sorted(notes)


def title_for(path: Path, fm: dict[str, object], body: str) -> str:
    for key in ("title", "Title"):
        value = fm.get(key)
        if isinstance(value, str) and value:
            return value
    for line in body.splitlines():
        if line.startswith("# "):
            return line[2:].strip()
    return path.stem.replace("-", " ").title()


def primary_tag(fm: dict[str, object], fallback: str | None = None) -> str:
    tags = fm.get("tags")
    if isinstance(tags, list):
        for tag in tags:
            if isinstance(tag, str) and tag in ALLOWED_TAGS:
                return tag
        if tags and isinstance(tags[0], str):
            return tags[0]
    if isinstance(tags, str):
        return tags
    return fallback or ""


def catalog_entries() -> list[dict[str, object]]:
    entries: list[dict[str, object]] = []
    for path in compiled_notes():
        fm, body = split_frontmatter(read_text(path))
        folder_tag = WIKI_FOLDERS.get(path.parent.name)
        entries.append(
            {
                "path": rel(path),
                "title": title_for(path, fm, body),
                "tag": primary_tag(fm, folder_tag),
                "topics": fm.get("topics", []),
                "sources": fm.get("sources", []),
                "updated": fm.get("updated", ""),
            }
        )
    return entries


def source_coverage_map() -> dict[str, list[str]]:
    coverage: dict[str, list[str]] = {}
    for entry in catalog_entries():
        note_path = str(entry["path"])
        sources = entry.get("sources", [])
        if isinstance(sources, list):
            for source in sources:
                if isinstance(source, str):
                    coverage.setdefault(source, []).append(note_path)
    return {k: sorted(v) for k, v in sorted(coverage.items())}


def read_manifest() -> dict[str, dict[str, object]]:
    if not MANIFEST.exists():
        return {}
    records: dict[str, dict[str, object]] = {}
    for line_no, line in enumerate(read_text(MANIFEST).splitlines(), 1):
        if not line.strip():
            continue
        try:
            item = json.loads(line)
        except json.JSONDecodeError as exc:
            raise SystemExit(f"{rel(MANIFEST)}:{line_no}: invalid JSON: {exc}") from exc
        if isinstance(item.get("path"), str):
            records[str(item["path"])] = item
    return records


def build_indexes() -> None:
    entries = catalog_entries()
    write_text(CATALOG, "".join(json.dumps(e, sort_keys=True) + "\n" for e in entries))
    lines = ["# Wiki Index", "", f"Updated: {date.today().isoformat()}", ""]
    for folder, tag in WIKI_FOLDERS.items():
        folder_entries = [e for e in entries if e["tag"] == tag]
        lines.extend([f"## {folder}", ""])
        if not folder_entries:
            lines.extend(["No notes yet.", ""])
            continue
        for entry in folder_entries:
            lines.append(f"- [{entry['title']}]({Path(str(entry['path'])).name})")
        lines.append("")
    write_text(WIKI_DIR / "index.md", "\n".join(lines).rstrip() + "\n")
    for folder, tag in WIKI_FOLDERS.items():
        folder_entries = [e for e in entries if e["tag"] == tag]
        folder_lines = [f"# {folder} Index", ""]
        if not folder_entries:
            folder_lines.extend(["No notes yet.", ""])
        for entry in folder_entries:
            folder_lines.append(f"- [{entry['title']}]({Path(str(entry['path'])).name})")
        write_text(WIKI_DIR / folder / "index.md", "\n".join(folder_lines).rstrip() + "\n")
    print(f"built {len(entries)} catalog entries")


def lint_compiled() -> int:
    errors: list[str] = []
    for path in compiled_notes():
        fm, _ = split_frontmatter(read_text(path))
        note = rel(path)
        tag = primary_tag(fm)
        if tag not in ALLOWED_TAGS:
            errors.append(f"{note}: tags must include one allowed tag")
        sources = fm.get("sources")
        if not isinstance(sources, list):
            errors.append(f"{note}: sources must be a list")
            sources = []
        count = fm.get("source_count")
        if count != len(sources):
            errors.append(f"{note}: source_count {count!r} != {len(sources)}")
        for source in sources:
            if not isinstance(source, str) or not source.startswith("Raw/Sources/"):
                errors.append(f"{note}: source must point under Raw/Sources/: {source!r}")
                continue
            if not (ROOT / source).exists():
                errors.append(f"{note}: missing source {source}")
    for error in errors:
        print(error, file=sys.stderr)
    if errors:
        return 1
    print(f"lint passed for {len(compiled_notes())} compiled notes")
    return 0


def source_records(accept_covered: bool = False) -> list[dict[str, object]]:
    manifest = read_manifest()
    coverage = source_coverage_map()
    records: list[dict[str, object]] = []
    today = date.today().isoformat()
    for path in raw_sources():
        fm, body = split_frontmatter(read_text(path))
        source_path = rel(path)
        covered_by = coverage.get(source_path, [])
        processed = bool(fm.get("Processed"))
        if accept_covered and covered_by:
            processed = True
        previous = manifest.get(source_path, {})
        records.append(
            {
                "path": source_path,
                "title": title_for(path, fm, body),
                "processed": processed,
                "covered_by": covered_by,
                "updated": previous.get("updated", today) if previous else today,
            }
        )
    return records


def source_scan(args: argparse.Namespace) -> int:
    records = source_records(accept_covered=args.accept_covered)
    for record in records:
        print(json.dumps(record, sort_keys=True))
    if args.update:
        write_text(MANIFEST, "".join(json.dumps(r, sort_keys=True) + "\n" for r in records))
        print(f"updated {rel(MANIFEST)}")
    return 0


def source_lint() -> int:
    errors: list[str] = []
    coverage = source_coverage_map()
    for path in raw_sources():
        fm, _ = split_frontmatter(read_text(path))
        note = rel(path)
        missing = sorted(REQUIRED_SOURCE_FIELDS - set(fm))
        if missing:
            errors.append(f"{note}: missing source fields: {', '.join(missing)}")
        tags = fm.get("tags")
        if not (isinstance(tags, list) and "source" in tags):
            errors.append(f"{note}: tags must include source")
        if bool(fm.get("Processed")) and not coverage.get(note):
            errors.append(f"{note}: Processed is true but no Wiki note covers it")
    for record in read_manifest().values():
        if record.get("processed") and not record.get("covered_by"):
            errors.append(f"{record.get('path')}: manifest processed source has no coverage")
    for error in errors:
        print(error, file=sys.stderr)
    if errors:
        return 1
    print(f"source-lint passed for {len(raw_sources())} sources")
    return 0


def source_delta() -> int:
    known = set(read_manifest())
    current = {rel(p) for p in raw_sources()}
    missing = sorted(current - known)
    if not missing:
        print("no source delta")
    else:
        for path in missing:
            print(path)
    return 0


def source_coverage() -> int:
    coverage = source_coverage_map()
    for path in [rel(p) for p in raw_sources()]:
        covered = coverage.get(path, [])
        print(json.dumps({"path": path, "covered_by": covered}, sort_keys=True))
    return 0


def search_catalog(args: argparse.Namespace) -> int:
    if not CATALOG.exists():
        print("catalog missing; run build first", file=sys.stderr)
        return 1
    terms = [t.lower() for t in re.findall(r"\w+", args.query)]
    matches: list[tuple[int, dict[str, object]]] = []
    for line in read_text(CATALOG).splitlines():
        if not line.strip():
            continue
        item = json.loads(line)
        haystack = json.dumps(item).lower()
        score = sum(1 for term in terms if term in haystack)
        if score:
            matches.append((score, item))
    for _, item in sorted(matches, key=lambda pair: (-pair[0], str(pair[1].get("path")))):
        print(json.dumps(item, sort_keys=True))
    if not matches:
        print("no matches")
    return 0


def append_log(args: argparse.Namespace) -> int:
    path = WIKI_DIR / "log.md"
    existing = read_text(path) if path.exists() else "# Wiki Log\n\n"
    entry = f"## {date.today().isoformat()} - {args.title}\n\n{args.details}\n\n"
    write_text(path, existing.rstrip() + "\n\n" + entry)
    print(f"appended {rel(path)}")
    return 0


def doctor() -> int:
    required = [RAW_DIR, ROOT / "Raw" / "Files", WIKI_DIR, SCHEMA_DIR, ROOT / "_templates", ROOT / "scripts"]
    errors = [f"missing folder: {rel(path)}" for path in required if not path.exists()]
    if sys.version_info < (3, 10):
        errors.append("Python 3.10 or newer is recommended")
    print(f"python: {sys.version.split()[0]}")
    print(f"raw sources: {len(raw_sources())}")
    print(f"compiled notes: {len(compiled_notes())}")
    print(f"catalog: {'present' if CATALOG.exists() else 'missing'}")
    print(f"source manifest: {'present' if MANIFEST.exists() else 'missing'}")
    for error in errors:
        print(error, file=sys.stderr)
    return 1 if errors else 0


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    sub = parser.add_subparsers(dest="command", required=True)
    sub.add_parser("doctor")
    sub.add_parser("build")
    sub.add_parser("lint")
    scan = sub.add_parser("source-scan")
    scan.add_argument("--update", action="store_true")
    scan.add_argument("--accept-covered", action="store_true")
    sub.add_parser("source-lint")
    sub.add_parser("source-delta")
    sub.add_parser("source-coverage")
    search = sub.add_parser("search-catalog")
    search.add_argument("--query", required=True)
    log = sub.add_parser("log")
    log.add_argument("--title", required=True)
    log.add_argument("--details", required=True)
    args = parser.parse_args(argv)
    if args.command == "doctor":
        return doctor()
    if args.command == "build":
        build_indexes()
        return 0
    if args.command == "lint":
        return lint_compiled()
    if args.command == "source-scan":
        return source_scan(args)
    if args.command == "source-lint":
        return source_lint()
    if args.command == "source-delta":
        return source_delta()
    if args.command == "source-coverage":
        return source_coverage()
    if args.command == "search-catalog":
        return search_catalog(args)
    if args.command == "log":
        return append_log(args)
    return 2


if __name__ == "__main__":
    raise SystemExit(main())
