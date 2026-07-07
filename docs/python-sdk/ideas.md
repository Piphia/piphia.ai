---
title: Ideas
sidebar_position: 4
---

# Ideas

`Ideas` is the Zettelkasten graph for a channel — **atomic ideas + typed,
weighted edges** — driven over the core HTTP API. It writes the **same on-disk
model** the `md_editor` and 3D `notebook_graph` plugins use, so anything created
here shows up in the editor (as the two-way ref `!ideas::#<id>::content=`) and in
the graph — **no editor needed**.

```python
from agent_sdk import Ideas, EDGE_TYPES

ideas = Ideas("branch_b638f7df7aea81c3")
```

## API

### Constructor

```python
Ideas(branch=None, base=None)
```

- `branch` — the channel id whose ideas/edges tables and `notes/` pages you act
  on. If omitted, resolved via `detect_branch()` (raises `ValueError` with no
  context).
- `base` — core URL. Defaults to `http://127.0.0.1:9090`.

### Edge types

```python
EDGE_TYPES = ["extends", "supports", "references",
              "contradicts", "similar_to", "example_of", "parent_of"]
```

Any `type` passed to `link` that is not in this list falls back to `"references"`.

### Create & ingest

```python
create(content, *, tags=None, type="fleeting", parent=None,
       title=None, color=None, note=None, after=None) -> dict
```
INSERT an idea row. `content` is required (blank → `ValueError`). `seq` is
auto-assigned `MAX(seq)+1`, `id` is a fresh 12-hex value. `tags` may be a
list/tuple (joined with `, `) or a string. If `note` is given, the ref token is
also **materialised** into that page (`parent` then defaults to `note`). Returns
`{id, seq, content, tags, type, note}`, plus `materialised` when `note` was given.

```python
ingest(text, note, *, type="fleeting", extra_tags=None, after=None) -> dict
```
One-shot ingest from a **message**: splits `#hashtags` out of the text into tags
(`parse_tags`), then `create`s the idea and materialises it into `note`. The
entry point for a bot/service throwing tagged thoughts at a channel.

```python
parse_tags(text) -> (clean_text, [tags])   # staticmethod: strip #hashtags → (text, tag names)
```

### Read

```python
get(idea_id) -> dict | None                # full idea row by id
all() -> list[dict]                        # every idea (_id, content, title, type, tags, parent, seq, created, color), seq-ordered
find(*, text=None, tag=None, type=None, parent=None, limit=50) -> list[dict]
edges(idea_id=None) -> list[dict]          # all edges, or those touching an idea: [{_id, source, target, type, weight, context}]
neighbors(idea_id) -> list[dict]           # idea rows one hop away
```

`find` ANDs whatever you pass: `text`/`tag` are substring `LIKE`, `type`/`parent`
are exact; seq-ordered, capped at `limit`.

### Link & materialise

```python
link(source, target, type="references", *, weight=0.6, context=None) -> dict
```
Typed/weighted edge `source → target`. **Dedup'd**: an existing edge with the
same `source + target + type` returns `{id, existed: True}` instead of inserting.
Unknown `type` → `"references"`. A new edge returns `{id, source, target, type}`.

```python
insert_into_note(idea_id, note, *, after=None) -> dict
```
Write the idea's ref token `!ideas::#<id>::content=` into `note` as its own
paragraph. If `after` is given and found, the token is inserted right after it
(`{ok, where:"after", after}`); otherwise appended (`{ok, where:"append"}`).

> **Materialisation race (accepted v1):** this writes the note **file**. If the
> page is open and dirty in the editor, the editor's next autosave can clobber
> the append. Ingestion into pages that aren't being actively typed is safe.

## Examples

### Ingest a message and materialise it into a note

```python
from agent_sdk import Ideas

ideas = Ideas("branch_b638f7df7aea81c3")

out = ideas.ingest("Compounding beats timing #investing #lesson", note="ai_ideas")
# content -> "Compounding beats timing", tags -> ["investing", "lesson"]
print(out["id"], out["tags"], out["materialised"])
```

### Explicit creates, ordered with `after=`

```python
a = ideas.create("Atomic notes hold one thought.", tags=["method"], note="inbox")
b = ideas.create("Link notes by meaning.", note="inbox", after=a["id"])  # placed after a
print(a["seq"], b["seq"])   # b's seq is a's + 1
```

### Typed, weighted link + read-back

```python
from agent_sdk import Ideas, EDGE_TYPES

edge = ideas.link(b["id"], a["id"], "extends", weight=0.8, context="b builds on a")
print(edge)                       # {'id': ..., 'source': ..., 'target': ..., 'type': 'extends'}

again = ideas.link(b["id"], a["id"], "extends")   # dedup'd
print(again["existed"])           # True
print(EDGE_TYPES)
```

### Analysis pass — find, neighbors, edges

```python
for idea in ideas.find(tag="method", limit=20):
    print(idea["_id"], idea["content"])
    for nb in ideas.neighbors(idea["_id"]):
        print("   ->", nb["content"])

for e in ideas.edges():
    print(e["source"], e["type"], e["target"], e["weight"])
```
