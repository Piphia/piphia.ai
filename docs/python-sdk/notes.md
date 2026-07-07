---
title: Notes
sidebar_position: 3
---

# Notes

`Notes` gives you full programmatic control of a channel's notebook (its pages) —
the **same surface the `md_editor` drives** — over the core HTTP API. Beyond raw
CRUD it adds a *structured rich-read* layer that resolves a page's blocks (ideas,
db blocks, tables, plugins, python handlers, tasks, inline refs) into **data**,
not just markdown.

```python
from agent_sdk import Notes

n = Notes("branch_b638f7df7aea81c3")
```

## API

### Constructor

```python
Notes(branch=None, base=None)
```

- `branch` — the channel id whose `notes/` pages you act on. If omitted, it is
  resolved via `detect_branch()`; a `ValueError` is raised when no channel
  context is found.
- `base` — core URL. Defaults to `http://127.0.0.1:9090`.

A `page` argument is always a page **id** (or the special `"active"` for the
current page).

### CRUD + navigation

```python
pages() -> list[dict]                          # [{id, title, parent_id, active, created_ms}]
read(page) -> str                              # raw markdown (empty string if missing)
write(page, content) -> True                   # replace the whole page
append(page, text, *, sep="\n\n") -> True      # append a block, joined with sep
create(name, *, title=None, parent="active", source=None) -> id   # new page → its id
delete(page) -> True
search(query, *, limit=20) -> list[dict]       # client-side substring scan → [{id, title, snippet}]
assembled() -> str                             # the whole notebook as one document
tree() -> dict                                 # {parent_id: [page, ...]} — the DAG (root under "")
children(page) -> list[dict]                   # pages whose parent_id == page
```

`search` is a case-insensitive substring scan (snippet ≈ 40 chars before / 80
after the first match) — not semantic search.

### Media embeds + file save

```python
add_block(page, fence, src) -> True            # append ```<fence> <src>``` (url / data: / files/<x>)
add_image(page, src)   -> True                 # ```image <src>```
add_youtube(page, src) -> True                 # ```youtube <src>```
add_pdf(page, src)     -> True                 # ```pdf <src>```
save_file(name, data) -> str                   # bytes/str → "files/<name>" (name sanitised)
download_to_files(url, name=None) -> str       # fetch a URL into files/ → workspace path
```

`download_to_files` disables TLS verification (handles self-signed/MITM proxies,
e.g. Telegram file links); `name` defaults to the URL's last path segment.

### Structured rich-read

Each parses the page and resolves one block kind to typed data — the same
resolution the editor's live widgets do.

```python
parsed(page) -> list[dict]
```
The page split into typed blocks, each one of: `{type:"fence", kind, arg, body}`,
`{type:"table", lines}`, `{type:"heading", level, text}`, `{type:"task", done, text}`,
`{type:"text", text}`.

```python
headings(page) -> list[dict]   # [{level, text}]
tasks(page)    -> list[dict]   # [{done, text}]  from - [ ] / - [x]
tables(page)   -> list[dict]   # [{headers, rows}]  rows = list of {header: cell} dicts (sep row dropped)
```

```python
ideas(page) -> list[dict]
```
Resolves every `!ideas::#id` ref → full idea rows (de-duplicated, via `Ideas.get`).

```python
databases(page) -> list[dict]
```
Resolves database fences:
- ` ```db <id> ` → `{kind:"db", db, rows, spec:None}` — **real rows** via `SELECT * FROM <table>` (`rows` is `None` on failure).
- ` ```database ` → `{kind:"database", db, rows:None, spec:<body>}`.
- ` ```db-row / sql / query / pquery / calc ` → `{kind, arg, code}`.

```python
plugins(page) -> list[dict]    # ```plugin <id>``` → [{id, params}] (params from key: value / key = value)
handlers(page) -> list[dict]   # ```python <name>.py``` → [{name, trigger, code, is_cell}]
refs(page)    -> list[dict]    # inline !db::row::field → [{db, row, field, two_way, token}]
```

`handlers` reads the first `# action:` / `# on:` / `# every:` / `# compute:`
marker as `trigger = {kind, value}` (else `None`); a bare code fence with no name
and no trigger has `is_cell: True`. In `refs`, `two_way` is `True` for the `=`
suffix form.

## Examples

### CRUD flow

```python
from agent_sdk import Notes

n = Notes("branch_b638f7df7aea81c3")

pid = n.create("research", parent="active")
n.write(pid, "# Research\n\n- [ ] read the Zettelkasten paper\n")
n.append(pid, "- [ ] summarise findings")

print(n.read(pid))
print(n.children("active"))        # the new page shows up here
print(n.search("Zettelkasten"))    # [{'id': ..., 'title': 'research', 'snippet': ...}]
```

### Structured read — "what's in this note?"

```python
n = Notes("branch_b638f7df7aea81c3")

print(n.headings("inbox"))    # [{'level': 1, 'text': 'Inbox'}, ...]
print(n.tasks("inbox"))       # [{'done': False, 'text': 'read the paper'}, ...]
print(n.tables("inbox"))      # [{'headers': ['k', 'v'], 'rows': [{'k': ..., 'v': ...}]}]

for d in n.databases("inbox"):
    print(d["db"], "→", len(d["rows"] or []), "rows")
for idea in n.ideas("inbox"):
    print(idea["_id"], idea["content"])
for h in n.handlers("inbox"):
    print(h["name"], h["trigger"])   # 'ai_idea.py' {'kind': 'action', 'value': 'ai_idea'}
```

### Media / file flow

```python
n = Notes("branch_b638f7df7aea81c3")

path = n.save_file("chart.png", png_bytes)   # -> 'files/chart.png'
n.add_image("inbox", path)

pdf_path = n.download_to_files("https://example.com/report.pdf")
n.add_pdf("inbox", pdf_path)

n.add_youtube("inbox", "https://youtu.be/dQw4w9WgXcQ")
```

### Whole-notebook scan

```python
n = Notes("branch_b638f7df7aea81c3")

doc = n.assembled()
print(len(doc), "chars across", len(n.pages()), "pages")

for parent, kids in n.tree().items():
    print(parent or "(root)", "→", [p["title"] for p in kids])
```
