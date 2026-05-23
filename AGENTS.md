# LLM Wiki Agent Guide

This repository is a core LLM Wiki. Use it as a traceable knowledge base, not as a dumping ground.

## Operating Rules

- Treat `Raw/Sources/` as source material, not as compiled notes.
- Write reusable knowledge only under `Wiki/`.
- Keep every compiled Wiki note linked to one or more Raw sources.
- Search `Wiki/catalog.jsonl` before opening broad Raw context.
- Run `python3 scripts/wiki_tool.py build`, `python3 scripts/wiki_tool.py lint`, and `python3 scripts/wiki_tool.py source-lint` before commits.
- Do not invent citations or create unsupported claims.

## Workflow

1. Put cleaned source notes in `Raw/Sources/`.
2. Search the catalog for related compiled notes.
3. Create or update focused notes in `Wiki/Topics/`, `Wiki/Concepts/`, `Wiki/Entities/`, `Wiki/Projects/`, or `Wiki/Logs/`.
4. Add source paths to each compiled note's `sources` field.
5. Keep `source_count` equal to the number of source paths.
6. Rebuild indexes and run maintenance checks before committing.

## Query Rule

Start from compiled Wiki notes. Open Raw sources only when a compiled note is insufficient, when verifying a claim, or when the user asks for source-level evidence.
