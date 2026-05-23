# LLM Wiki Lint

Use this skill when validating Wiki health.

Run:

```bash
python3 _llm-wiki/scripts/wiki_tool.py doctor
python3 _llm-wiki/scripts/wiki_tool.py build
python3 _llm-wiki/scripts/wiki_tool.py lint
python3 _llm-wiki/scripts/wiki_tool.py source-lint
python3 _llm-wiki/scripts/audit_public.py
```

After ingestion, also run:

```bash
python3 _llm-wiki/scripts/wiki_tool.py source-scan --update --accept-covered
python3 _llm-wiki/scripts/wiki_tool.py source-lint
```
