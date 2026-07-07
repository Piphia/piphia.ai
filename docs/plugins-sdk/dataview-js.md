---
title: Data layer (dataview.js)
sidebar_position: 3
---

# Data layer — `dataview.js`

`dataview.js` is the **universal data-view client SDK**. A view plugin loads it
and talks to *one* normalized read/write surface — the data contract
(`/data/:branch/query|patch`, see the [Tables & dataview](../app-guides/table-guide.md)
guide) — instead of touching SQLite, the `db` capability, or any adapter directly.

```html
<script src="/system/dataview/dataview.js"></script>   <!-- window.DataView_ -->
```

It exposes **`window.DataView_`** — trailing underscore, because plain
`window.DataView` is the typed-array built-in. No build step; same-origin with
the agent server. It reads the channel from `?branch=` and the per-instance data
source from `?source=` (the `view` fence forwards both as URL params).

## The normalized contract it speaks

Every source is a string `"<adapter>:<id>"`. The contract resolves all the hard
parts server-side so a view never re-derives anything:

| source         | read | write | what it is |
|----------------|------|-------|-----------|
| `db:<id>`      | ✓    | ✓     | any channel database (`db:tasks`, `db:prices`) |
| `notes:pages`  | ✓    | —     | notebook pages; `parent_id` resolves to a page-DAG ref |
| `ideas:*`      | ✓    | ✓     | alias for `db:ideas` (ideas are a regular db) |

A `query` returns `{ ok, source, title, schema, records, expanded }`:

```json
{
  "schema":  [ { "id": "title",  "type": "text" },
               { "id": "status", "type": "select", "options": { "choices": ["todo","doing","done"] } },
               { "id": "project","type": "relation", "options": { "target": "projects" } } ],
  "records": [ { "ref": "db:tasks:42", "id": "42",
                 "fields": { "title": "Ship dataview", "status": "doing", "project": "7" },
                 "refs":   { "project": [ { "ref": "db:projects:7", "title": "Alpha" } ] } } ]
}
```

Contract guarantees (so the view stays dumb):

- **Global refs** — every record is addressable as `<adapter>:<store>:<id>`.
- **Relations arrive resolved** — the raw value stays in `fields.<f>`; the
  resolved `[{ ref, title }]` arrives in `refs.<f>`. `expand=<field>` ships the
  full target records in `expanded`.
- **Rollups / formulas / ai / python / tool fields arrive computed.**
- **Backlinks are free** — for every relation elsewhere that targets this
  source, the schema gains a virtual `_backlinks_<db>_<field>` field.

Writes go through `patch`; computed and virtual fields are **rejected**
server-side, never silently dropped. Every write emits `store.changed` on the
`/events` bus, which is how every live surface (the grid, inline `!refs`, other
view plugins, and *your* view) refreshes.

## `window.DataView_` — full method API

| member | signature | returns / effect |
|---|---|---|
| `branch` | property | the channel id (`?branch=`) |
| `source` | property | this instance's source (`?source=`) |
| `plugin` | property | this plugin's name (scopes emitted triggers) |
| `connect(opts?)` | `await` | query the contract. `opts = { source?, expand? }` (`expand` = field or array). Resolves to `{ ok, source, title, schema, records, expanded }`. Falls back to `{ ok:false, records:[], schema:[] }` on error. |
| `sources()` | `await` | `[{ source, title }]` for every channel db (skips `_meta` tables) plus `{ source:"notes:pages", title:"Notes" }`. |
| `patch(refOrId, values)` | `await` | write fields on one record. `refOrId` = full ref (`"db:tasks:42"`) or a bare id relative to `source`. Returns `{ ok, ref, db }`. |
| `link(ref, field, targetRef)` | `await` | add a relation edge; the inverse field (if any) stays in sync. |
| `unlink(ref, field, targetRef)` | `await` | remove a relation edge (idempotent). |
| `emit(trigger, payload)` | `await` | publish `plugin:<name>:<trigger>` so a note's `# on: plugin:<name>:<trigger>` handler reacts. |
| `onChange(render, opts?)` | sync | **LIVE.** Calls `render(payload)` now and on every relevant `store.changed` (150 ms debounce, auto-reconnecting WS to `/events`). Returns a function (also `.stop` / `.refresh`). |

### `connect` — one read

```js
const DV = window.DataView_;
const d = await DV.connect({ source: "db:tasks", expand: ["project"] });
// d.schema  → field defs ; d.records → [{ ref, id, fields, refs }]
```

### `patch` / `link` / `unlink` — writes that fan out

```js
await DV.patch("db:tasks:42", { status: "done" });        // edit a cell
await DV.link("db:tasks:42", "project", "db:projects:7");  // relation + inverse
await DV.unlink("db:tasks:42", "project", "db:projects:7");
```

Computed fields (rollup / formula / ai / python / tool / button) and virtual
`_backlinks_*` fields are rejected with an explanatory error.

### `onChange` — the live loop

The workhorse. `opts` may be a **function** returning the current options, so a
view with a source picker re-reads its live selection on every refresh:

```js
const sub = DV.onChange(render, () => ({ source: state.source }));
// later: sub.stop();        // close the WS
//        sub.refresh();     // force a re-query now
```

This is exactly the shape `kanban` uses
(`DV.onChange(render, () => ({ source: state.source }))`).

## Usage example — a tiny live table

A complete view plugin: pick a source, render its records as a table, edit a
cell in place, and stay live on every change.

```html
<!doctype html><html><head><meta charset="utf-8">
<style>
  body{font:13px system-ui;background:var(--ed-bg,#1e1e1e);color:var(--ed-fg,#ddd);margin:0;padding:10px}
  table{border-collapse:collapse;width:100%} th,td{border:1px solid #3a4450;padding:3px 6px;text-align:left}
  th{color:#888;font-weight:600}
</style></head><body>
  <select id="src"></select>
  <table><thead id="head"></thead><tbody id="body"></tbody></table>
  <script src="/system/dataview/dataview.js"></script>
  <script>
  (async () => {
    const DV = window.DataView_;
    const sel = document.getElementById("src");
    const state = { source: DV.source || "" };

    // populate the source picker
    for (const s of await DV.sources()) {
      const o = document.createElement("option");
      o.value = s.source; o.textContent = s.title; sel.appendChild(o);
    }
    if (!state.source && sel.options.length) state.source = sel.options[0].value;
    sel.value = state.source;
    sel.onchange = () => { state.source = sel.value; sub.refresh(); };

    function render(d) {
      if (!d || !d.ok) return;
      const cols = d.schema.map(f => f.id);
      document.getElementById("head").innerHTML =
        "<tr>" + cols.map(c => `<th>${c}</th>`).join("") + "</tr>";
      document.getElementById("body").innerHTML = d.records.map(rec =>
        "<tr>" + cols.map(c => {
          // a relation shows its resolved title; a plain field is editable
          const r = rec.refs && rec.refs[c];
          if (r) return `<td>${r.map(x => x.title).join(", ")}</td>`;
          return `<td contenteditable data-ref="${rec.ref}" data-f="${c}">${rec.fields[c] ?? ""}</td>`;
        }).join("") + "</tr>"
      ).join("");
    }

    // edit-in-place → patch → store.changed → onChange re-renders everyone
    document.getElementById("body").addEventListener("blur", (e) => {
      const td = e.target;
      if (td.dataset && td.dataset.ref)
        DV.patch(td.dataset.ref, { [td.dataset.f]: td.textContent.trim() });
    }, true);

    // LIVE: render now + on every relevant change; reads the live source each time
    const sub = DV.onChange(render, () => ({ source: state.source }));
  })();
  </script>
</body></html>
```

The fence that embeds it forwards the source + view args as URL params:

````markdown
```view db:tasks table 360
```
````

## dataview.js vs dbview.js

Both are zero-build, same-origin client SDKs that stay live over the same
`/events` `store.changed` stream. They differ in *what they talk to*.

**`dataview.js` (`window.DataView_`) — CURRENT, recommended for new plugins.**
It speaks the normalized data contract (`/data/:branch/query|patch`). One
`source` string covers every adapter — channel databases *and* `notes:pages`
*and* `ideas:*` — and the contract hands back resolved relations, computed
rollups/formulas, and free backlinks. The view does no SQL and knows nothing
about source kinds; teaching the system a new source is one adapter function
server-side and every existing view renders it. **Use this for anything new**
that displays or mutates channel data.

**`dbview.js` (`window.DBView`) — the older, db-only layer.** It works directly
against the channel SQLite: `schema(dbId)` / `rows(dbId)` (a literal
`SELECT * FROM "<table>"` via `sqlite.query`), `fetchAll(ids)`,
`update`/`insert` (the raw `db` capability), `onData(ids, cb)` for live updates,
and `emit(trigger)`. It returns **raw column values** (dates as ms-timestamps,
checkboxes 0/1) — relations, rollups, and backlinks are *not* resolved; the view
interprets `schema.fields[*].type` itself. It can only read databases (no
`notes:`/`ideas:` adapters).

### When to use which

| | `dataview.js` | `dbview.js` |
|---|---|---|
| talks to | normalized contract | raw SQLite / `db` cap |
| sources | `db:` · `notes:pages` · `ideas:*` | databases only |
| relations / rollups / backlinks | resolved by the contract | raw, view resolves |
| new plugins | **yes** | legacy / db-only edge cases |

For a brand-new view: use `dataview.js`. Reach for `dbview.js` only if you
genuinely need raw column values or an ad-hoc `SELECT` the contract doesn't
expose.

### Which shipped plugins use each

- **`dataview.js` (`DataView_`)** is loaded by `kanban`, `smart_calendar`,
  `smart_chart`, and `bike_game` — every shipped view runs on the contract.
- **`dbview.js` (`DBView`)** is loaded by **no shipped plugin** today; it ships as
  a helper but nothing currently depends on it.

In other words, `dataview.js` is the live standard; `dbview.js` is kept for
db-only edge cases.
