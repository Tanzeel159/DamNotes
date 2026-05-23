# Command Reference

Run commands from the repository root.

- `python3 scripts/wiki_tool.py doctor`: check folder health, Python version, catalog, manifest, and note counts.
- `python3 scripts/wiki_tool.py build`: generate `Wiki/catalog.jsonl`, `Wiki/index.md`, and per-folder indexes.
- `python3 scripts/wiki_tool.py lint`: validate compiled Wiki note frontmatter, tags, source links, and `source_count`.
- `python3 scripts/wiki_tool.py source-scan`: list Raw sources.
- `python3 scripts/wiki_tool.py source-scan --update --accept-covered`: update `Schema/source-manifest.jsonl` and mark covered sources processed in the manifest.
- `python3 scripts/wiki_tool.py source-lint`: validate Raw source frontmatter and processed coverage.
- `python3 scripts/wiki_tool.py source-delta`: show Raw sources missing from the source manifest.
- `python3 scripts/wiki_tool.py source-coverage`: show which Raw sources are covered by compiled Wiki notes.
- `python3 scripts/wiki_tool.py search-catalog --query "text"`: search compiled Wiki notes through the catalog.
- `python3 scripts/wiki_tool.py log --title "title" --details "details"`: append a short entry to `Wiki/log.md`.

Install the pre-commit hook with:

```bash
sh scripts/install_hooks.sh
```
