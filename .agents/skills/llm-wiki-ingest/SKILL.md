# LLM Wiki Ingest

Use this skill when adding or compiling source material into the LLM Wiki.

1. Put cleaned Markdown sources in `_llm-wiki/Raw/Sources/`.
2. Search `_llm-wiki/Wiki/catalog.jsonl` before opening broad Raw context.
3. Compile reusable claims into focused notes under `_llm-wiki/Wiki/`.
4. Link each compiled note to one or more Raw source paths.
5. Keep `source_count` accurate.
6. Run build, lint, source scan, and source lint checks with `_llm-wiki/scripts/wiki_tool.py`.

Do not invent citations or add claims that are not supported by a Raw source.
