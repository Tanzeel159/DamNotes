# Frontmatter Schema

## Raw Source Notes

Required fields:

- `Title`: source title.
- `Author`: source author or owner when known.
- `Reference`: URL, citation, identifier, or local reference.
- `ContentType`: list of source formats.
- `Created`: date added as `YYYY-MM-DD`.
- `Processed`: `true` when the source is represented by compiled Wiki notes.
- `tags`: must include `source`.

## Compiled Wiki Notes

Required fields:

- `tags`: exactly one primary tag from `topic`, `concept`, `entity`, `project`, or `log`.
- `topics`: list of related topic names.
- `status`: `seed`, `draft`, or `evergreen`.
- `created`: creation date as `YYYY-MM-DD`.
- `updated`: last update date as `YYYY-MM-DD`.
- `sources`: list of paths under `Raw/Sources/`.
- `source_count`: number of source paths.
- `aliases`: alternate names.

Compiled notes must not contain unsupported claims.
