---
sidebar_position: 3
title: Tables & dataview
---

# Tables & dataview

How to surface and compute over your data inside notes: the `view` fence,
`query` tables, and the live data layer that powers them.

## The universal data layer

Every view and script reads and writes through **one normalized data layer** — a
single read/write surface over your channel data. Two consequences matter for you:

- **Relations and computed fields arrive ready.** A view receives relations
  already resolved to `{ref, title}`, rollups and formulas already computed, and
  backlinks for free. No view re-derives anything, and none of them touch SQL.
- **Everything is live.** Writes emit a `store.changed` event, and views
  re-render on it (debounced) over an auto-reconnecting WebSocket — so a change in
  one place updates every other view of the same data without polling.

Data is addressed by a **source**, written `<adapter>:<id>`:

| Source | Read | Write | What it is |
| --- | --- | --- | --- |
| `db:<id>` | ✓ | ✓ | a channel database (e.g. `db:tasks`) |
| `notes:pages` | ✓ | — | your notebook pages (title / path / parent / …) |
| `ideas:*` | ✓ | ✓ | ideas (a regular channel database) |

## The `view` fence

Embed a database view directly in a markdown note. The fence names the source, the
plugin, a height, and optional `key=value` params:

````markdown
```view db:tasks kanban 360 group=status
```
````

````markdown
```view db:prices smart_chart 360 y=price x=at filter=symbol:TSLA tf=hour
```
````

The fence forwards `source=` and the params to the plugin as URL params. The
embedded plugin reads and writes the database live — and the same plugins also run
standalone in the plugins dock with their own source pickers. Available view
plugins include **kanban**, **smart_calendar**, **smart_chart**, and
**notebook_graph**.

## `query` tables — a live, deterministic view

For the current note's **tasks**, a `query` block renders a live table — no
agent, no tokens, recomputed client-side as you type:

````markdown
```query
status: open        # open | done | all   (default: all)
tag: proto          # only #proto          (optional)
due: overdue        # overdue | today | upcoming | any  (optional)
sort: due           # due | priority | text   (default: file order)
```
````

With the cursor outside the block it renders as a table of the matching tasks;
move the cursor inside to edit the query. To search **notes across all channels**
instead, set `source: notes` and a `search:` term — it calls a read-only search
capability and renders `<channel> · <snippet>` rows.

## Computed cells & table math

Computation happens in two complementary places:

- **In the database.** `formula`, `rollup`, `python`, `tool`, and `ai` fields are
  computed server-side and arrive already computed in any table or view (see the
  [database guide](./database-guide.md)). They're read-only from a view's
  perspective.
- **Inline in prose.** Because the data layer exposes every value by a global ref,
  notes can pull and compute values inline — e.g. referencing a specific
  database cell, or doing table math over rows — and those references stay live as
  the underlying data changes.

## `dbview` — building your own live table plugin

If you want a custom table or chart that reads, renders, and writes a database and
stays live, plugins use a small helper, **`dbview.js`**, loaded alongside the
host API:

```html
<script src="/plugins/agent.js"></script>        <!-- window.agent -->
<script src="/system/dbview/dbview.js"></script>  <!-- window.DBView -->
```

It gives a plugin everything a table needs:

| Member | Does |
| --- | --- |
| `schema(dbId)` | the db's field list with types |
| `rows(dbId)` / `fetchAll(ids)` | raw rows (and several dbs at once) |
| `onData(ids, cb)` | **LIVE** — calls back now and on every change; returns `stop()` |
| `update(dbId, rowId, field, value)` | write one cell → `store.changed` |
| `insert(dbId, values)` | add a row |
| `emit(trigger, payload)` | publish an event a note handler can react to |

The key method is `onData` — it renders immediately and re-renders on every add /
edit / delete, so your table is always current without polling. Writes through
`update` / `insert` propagate to the grid, formulas, handlers, and every other
view. (For external, non-database data, a plugin uses a Python tool rather than
browser fetch.)

## See also

- [Database guide](./database-guide.md) — the field types you're viewing.
- [Agents guide](./agents-guide.md) — agents that read these tables.
