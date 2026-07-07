---
title: Quickstart
sidebar_position: 1
---

# Python SDK quickstart

`agent_sdk` is the Python SDK for authoring **custom tools**, **task-specialised
sub-agents**, and **channel automations** — and for driving a channel's
**notebook** and **ideas-graph** programmatically. Everything is built on plain
HTTP to the core (`http://127.0.0.1:9090` by default) plus channel files, so it
runs from any interpreter that can reach the server.

## Running Python

There are two ways to execute SDK code:

- **In-app editor "Run"** — open a `.py` file under a channel's `scripts/`:
  - A buffer that uses `@tool` / `GG.*` runs through the **embedded** interpreter
    (⚡ Run (GG)) — `GG` injected, cross-platform, identical to how the agent
    actually invokes the tool. It saves first and shows `_result`.
  - A plain script runs as a `python3` **subprocess** (▶ Run, stdout/stderr).
- **`POST /python/run`** — the endpoint behind the Run button. `embedded: true`
  routes to the embedded eval; otherwise it spawns the subprocess.

`agent_sdk` is on the `PYTHONPATH` in both paths, so the import preamble below
works everywhere. Orchestration helpers (`query`, `Notes`, `Ideas`, `@tool`
build-mode, `create_subagent`) need only HTTP and the filesystem; only a tool
**body** that touches `GG.*` must run embedded.

## Import preamble

```python
from agent_sdk import (
    tool, create_subagent, discover_tools, add_requirements,
    query, AgentOptions, detect_branch,
    Notes, Ideas, EDGE_TYPES,
)
```

`detect_branch()` resolves the channel id from the script's context
(`AGENT_BRANCH_ID` / cwd). On a scheduled or feed fire it may return empty —
hardcode the branch there.

## Minimal hello tool

ONE `@tool` per file. The decorated function takes a single `args` dict and
returns an MCP-style value; the `content[0].text` is unwrapped as the result.

```python
# scripts/add.py
from agent_sdk import tool

@tool("add", "Add two numbers", {"a": float, "b": float})
def add(args):
    return {"content": [{"type": "text", "text": str(args["a"] + args["b"])}]}
```

Register every `@tool` in `scripts/` and reload the registry — now `tool.add`
is callable by the brain, a `query()` agent, or `POST /tools/invoke`:

```python
from agent_sdk import discover_tools, detect_branch
discover_tools(detect_branch())   # → ["tool.add"]
```

## Notes CRUD

`Notes` is the full editor mirror over HTTP. `page` is a page **id** (or the
special `"active"` for the current page).

```python
from agent_sdk import Notes

notes = Notes("branch_b638f7df7aea81c3")   # or Notes() with detect_branch()

pid = notes.create("research", parent="active")   # new page → its id
notes.append(pid, "- [ ] read the Zettelkasten paper")
notes.write(pid, "# Research\n\nFresh contents.")  # replace whole page
print(notes.read(pid))                             # raw markdown
print(notes.search("zettel"))                      # [{id, title, snippet}]
print(notes.tasks(pid))                            # [{'done': False, 'text': ...}]
```

> See [API reference](./api) for every method and [Examples](./examples) for
> complete runnable flows.
