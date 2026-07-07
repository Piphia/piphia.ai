---
title: Tables & data
sidebar_position: 5
---

# Tables & data

The SDK exposes the channel's tabular data through **two** distinct layers. Pick
the one that matches where the data actually lives:

| Class | Module | Data source | md = truth? |
|---|---|---|---|
| `Tables` | `agent_sdk.tables` | **Named markdown tables** inside note files (`<!-- table: Name -->`) | yes — every write is a plain-text edit of the `.md` file |
| `DataView` | `agent_sdk.dataview` | The **normalized data contract** (`db:<id>`, `notes:pages`, `ideas:*`) | no — backed by the channel's SQLite databases |

Both are imported from the top-level package:

```python
from agent_sdk import Tables, DataView
```

- Use **`Tables`** to read/write spreadsheet-style cells (`A1`, `A1:B3`,
  `=SUM(...)`) that a human edits in a note's markdown table. Truth is the text
  file, so the editor, git and other readers stay in sync.
- Use **`DataView`** to read/write structured database records with schema, typed
  fields, resolved relations, rollups and backlinks. Writes emit `store.changed`,
  so every open view reacts.

---

## API — `Tables` / `Table`

### `Tables(branch=None, base=None)`

- `branch` — channel id; defaults to `detect_branch()` (raises `ValueError` if no
  channel context).
- `base` — core base URL; defaults to `http://127.0.0.1:9090`.

A *named* table is the markdown table directly under a `<!-- table: Name -->`
comment (set from the editor's column/row grip menu → 🏷). Addressing is
Excel-style over the **data** rows: `A1` is the first column of the first data row.

| Method | Returns | Notes |
|---|---|---|
| `list()` | `[{name, file, cols, rows}]` | every named table in the channel (counts) |
| `get(name)` | `Table` \| `None` | named table, case-insensitive |
| `in_file(file)` | `[Table]` | all tables in one note (named or not) |
| `set_cell(name, ref, value)` | `bool` | re-resolves fresh, then writes (raises `LookupError` if missing) |
| `append_row(name, cells=None)` | `bool` | re-resolves fresh, then appends |

### `Table`

Returned by `Tables.get()` / `Tables.in_file()`. Attributes: `file`, `name`,
`cols` (header list), `rows` (raw data rows). Refs are strings like `"A1"`; ranges
like `"A1:B3"`.

**Reads**

| Method | Returns |
|---|---|
| `cell(ref)` | raw cell text, or `None` if out of bounds |
| `values(rng)` | non-empty cell texts (row-major) |
| `numbers(rng)` | `float` list — formulas / `=py` / tag / non-numeric cells skipped |
| `sum(rng)` | `float` |
| `avg(rng)` / `min(rng)` / `max(rng)` | `float` \| `None` |

`numbers()` accepts `.` or `,` decimals and skips computed cells (anything
starting `=`, or a legacy math tag like `SUM^`).

**Writes** (each re-reads the file fresh, editing only the affected `|`-segment)

| Method | Returns | Notes |
|---|---|---|
| `set_cell(ref, value)` | `bool` | replace one data cell (text / `=formula` / `=py …`) |
| `append_row(cells=None)` | `bool` | add a data row; short rows padded, `\|` becomes `/` |

---

## API — `DataView`

### `DataView(branch=None)`

- `branch` — channel id; defaults to `detect_branch()`, then `"main"`. (No `base`
  parameter — contract endpoints are reached via the shared HTTP layer.)

The Python side of the universal data contract — the same
`GET /data/:branch/query` and `POST /data/:branch/patch` endpoints that
`dataview.js` and every view plugin use. A `source` is `<adapter>:<id>`, e.g.
`db:tasks`, `notes:pages`, `ideas:all`.

**Read**

| Method | Returns |
|---|---|
| `query(source, expand=None)` | the full contract payload (shape below) |
| `records(source, **field_filters)` | the `records` list, filtered by exact field values |
| `sources()` | `[{source, title}]` — every channel db (minus `_`-prefixed) plus `notes:pages` |

`query()` returns:

```python
{
  "ok": True,
  "source": "db:tasks",
  "title": "Tasks",
  "schema":  [{"id": "status", "type": "select", "options": {...}}, ...],
  "records": [{"ref": "db:tasks:42", "id": "42",
               "fields": {"title": "...", "status": "doing", "project": "7"},
               "refs":   {"project": [{"ref": "db:projects:7", "title": "Alpha"}]}}],
  "expanded": {...},   # only the fields named in expand=
}
```

- **Relations arrive resolved**: the raw value stays in `fields`, the resolved
  `[{ref, title}]` in `refs[<field>]`. `expand=["project"]` ships full target
  records in `expanded`.
- **Computed fields arrive computed** (rollups, formula/ai/python/tool).
- **Backlinks are free**: a virtual `_backlinks_<db>_<field>` field appears per
  relation that targets this source.

**Write** (`ref_or_id` is a global ref like `db:tasks:42`, or a bare id + `source=`)

| Method | Notes |
|---|---|
| `patch(ref_or_id, values, source=None)` | write stored fields; computed/virtual fields rejected server-side |
| `link(ref_or_id, field, target_ref, source=None)` | connect a relation; inverse kept in sync |
| `unlink(ref_or_id, field, target_ref, source=None)` | disconnect (idempotent) |
| `graph(sources=None, include_pages=True)` | `{"nodes": [{id, kind, title}], "links": [{source, target, kind}]}` |

`graph()` walks the channel's relations graph over global refs — records plus note
pages — the same graph the `notebook_graph` «Связи» view draws.

---

## Examples

### 1. Read & total a named markdown table

```python
from agent_sdk import Tables

t = Tables()                     # branch auto-detected
print(t.list())                  # [{'name': 'Budget', 'file': 'notes.md', 'cols': 2, 'rows': 5}, ...]

budget = t.get("Budget")
if budget:
    print(budget.cols)           # ['Item', 'Cost']
    print(budget.cell("A1"))     # first data cell, raw text
    print(budget.values("A1:B2"))
    print(budget.sum("B1:B5"))   # total of the numeric Cost column
    print(budget.avg("B1:B5"))   # average (None if no numbers)
```

### 2. Write a cell and append a row to a markdown table

```python
t = Tables()

t.set_cell("Budget", "B6", "=SUM(B1:B5)")   # even a formula the editor evaluates
t.append_row("Budget", ["Coffee", "4.50"])  # short rows padded to header width

budget = t.get("Budget")
budget.set_cell("A1", "Rent")
budget.append_row(["Taxi", "12"])
```

### 3. Query a database, then update a record (DataView)

```python
from agent_sdk import DataView

dv = DataView()

print(dv.sources())                              # all dbs + notes:pages

d = dv.query("db:tasks", expand=["project"])
for rec in d["records"]:
    print(rec["ref"], rec["fields"].get("title"),
          rec["refs"].get("project"))            # [{'ref': 'db:projects:7', 'title': 'Alpha'}]

todo = dv.records("db:tasks", status="todo")     # exact-value filter
dv.patch("db:tasks:42", {"status": "done"})      # computed fields rejected server-side
```

### 4. Relations and the graph (DataView)

```python
dv = DataView()

dv.link("db:tasks:42", "project", "db:projects:7")    # inverse synced automatically
dv.unlink("db:tasks:42", "project", "db:projects:7")  # idempotent

g = dv.graph()
print(len(g["nodes"]), "nodes,", len(g["links"]), "links")
```

### When to use which

- A human keeps a small list in a note's markdown table and you want totals or to
  poke one cell → **`Tables`**.
- You have structured records with a schema, typed fields, relations and live
  views → **`DataView`** (writes emit `store.changed`; views re-render).
