# LLM Wiki Agent Guide

This repository is a Quartz v4 site with a separate internal LLM Wiki.

- `content/` is the Quartz-published content tree.
- `_llm-wiki/` is internal LLM Wiki source, compiled notes, schema, templates, and tooling.
- `.agents/skills/` contains agent-facing helper skills.

## Operating Rules

- Treat `_llm-wiki/Raw/Sources/` as source material, not as compiled notes.
- Write reusable LLM Wiki knowledge only under `_llm-wiki/Wiki/`.
- Keep every compiled Wiki note linked to one or more Raw sources.
- Search `_llm-wiki/Wiki/catalog.jsonl` before opening broad Raw context.
- Run `python3 _llm-wiki/scripts/wiki_tool.py build`, `python3 _llm-wiki/scripts/wiki_tool.py lint`, and `python3 _llm-wiki/scripts/wiki_tool.py source-lint` before commits.
- Do not invent citations or create unsupported claims.
- Keep Quartz-published notes inside `content/`.
- Do not move internal LLM Wiki folders into `content/`.

## Never Reference

Do not read, summarize, cite, index, or reference files under these paths unless the user explicitly names a specific file and asks for it:

- `private/`
- `Drafts/`
- `_llm-ignore/`
- `.obsidian/`
- `content/.obsidian/`
- `_llm-wiki/Raw/Files/`

## Workflow

1. Put cleaned source notes in `_llm-wiki/Raw/Sources/`.
2. Search the catalog for related compiled notes.
3. Create or update focused notes in `_llm-wiki/Wiki/Topics/`, `_llm-wiki/Wiki/Concepts/`, `_llm-wiki/Wiki/Entities/`, `_llm-wiki/Wiki/Projects/`, or `_llm-wiki/Wiki/Logs/`.
4. Add source paths to each compiled note's `sources` field.
5. Keep `source_count` equal to the number of source paths.
6. Rebuild indexes and run maintenance checks before committing.

## Query Rule

Start from compiled Wiki notes. Open Raw sources only when a compiled note is insufficient, when verifying a claim, or when the user asks for source-level evidence.
