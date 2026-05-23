# Lint Checklist

Before committing meaningful LLM Wiki changes:

- Run `python3 scripts/wiki_tool.py doctor`.
- Run `python3 scripts/wiki_tool.py build`.
- Run `python3 scripts/wiki_tool.py lint`.
- Run `python3 scripts/wiki_tool.py source-lint`.
- Run `python3 scripts/audit_public.py`.

For source ingestion, also run:

- `python3 scripts/wiki_tool.py source-scan --update --accept-covered`
- `python3 scripts/wiki_tool.py source-coverage`

Fix any unsupported source links, bad tags, stale `source_count` values, or processed sources with no Wiki coverage.
