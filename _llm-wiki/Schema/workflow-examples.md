# Workflow Examples

## Ingest A Source

1. Add a source note to `_llm-wiki/Raw/Sources/`.
2. Run `python3 _llm-wiki/scripts/wiki_tool.py search-catalog --query "topic phrase"`.
3. Compile only reusable claims into focused Wiki notes.
4. Link every compiled note to the Raw source through `sources`.
5. Run build, lint, source scan, and source lint checks.

## Answer A Question

1. Open `_llm-wiki/Wiki/index.md`.
2. Search the catalog.
3. Read the most relevant compiled notes.
4. Open Raw sources only for verification or missing detail.
5. Cite compiled notes and Raw sources when the answer depends on source material.
