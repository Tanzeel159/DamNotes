# LLM Wiki Maintain

Use this skill for routine maintenance and index refreshes.

1. Run `python3 _llm-wiki/scripts/wiki_tool.py source-delta`.
2. Run `python3 _llm-wiki/scripts/wiki_tool.py source-coverage`.
3. Rebuild catalog and indexes with `python3 _llm-wiki/scripts/wiki_tool.py build`.
4. Run lint and audit checks.
5. Commit generated catalog, manifest, and index updates when checks pass.
