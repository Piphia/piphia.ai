---
title: Subagents (delegate)
sidebar_position: 3
---

# Subagents: delegate by name

A **subagent** is a focused, single-purpose agent you *delegate* a task to —
`scout` (explore), `planner` (plan), `worker` (implement), plus `reviewer`,
`oracle`, `researcher`, `context-builder`, `delegate`. `agent_sdk.subagents`
wraps the server's `/subagents/*` routes — the same ones the agent console's
`/run` · `/parallel` · `/chain` · `/chains` commands drive — so a script or an
`@tool` body can hand off work **without** running its own LLM ReAct loop.

```python
from agent_sdk import subagents, detect_branch
b = detect_branch()

r = subagents.run("scout", "Where does the bot save photos?", branch=b)
print(r["response"])
```

:::caution Always pass `branch=`
Subagents resolve in this order: **channel extension defs** (the `*.md` in the
channel's `branches/branch_<id>/agents/extensions/subagents/agents/`) → **system
agents** (`mods/pi/agents`) → **this channel's user agents**
(`branches/<id>/agents`). The per-channel
extension defs only resolve when the server knows the channel, so pass
`branch=detect_branch()` (or the channel id). Omit it and the notes build — which
drops `mods/pi` — returns an **empty** list.
:::

## API

Every call returns the server JSON verbatim: `{ok, response, error}` for a single
run; `{results: [...]}` for fan-out / chain; a `final` field when a synthesizer
merges the outputs.

A **step** is `("agent", "task")`, `{"agent": ..., "task": ...}`, or — inside a
chain — a parallel group `{"parallel": [steps], "as": "name"}`.

### `list_subagents(*, branch=None)`

List callable agents (each with its `kind`: `extension` / `system` / `user`) plus
the chain presets.

```python
r = subagents.list_subagents(branch=b)
[a["name"] for a in r["agents"] if a["kind"] == "extension"]   # → ['scout', 'planner', …]
[c["name"] for c in r["chains"]]                                # → ['scout-plan-build', …]
```

### `run(agent, task, *, branch=None)`

Run **one** subagent synchronously → `{ok, response, error}`.

```python
res = subagents.run("planner", "Plan adding a /stats command.", branch=b)
print(res.get("response") or res.get("error"))
```

### `parallel(tasks, *, synthesize=None, branch=None)`

Run several subagents **concurrently**. `tasks` is a list of steps. With
`synthesize=` (an agent name or an `("agent", "task")` step) a final subagent
merges the outputs (fan-in) — its answer lands in `final`.

```python
res = subagents.parallel(
    [("scout", "find the photo-saving code"),
     ("reviewer", "review the error handling")],
    synthesize=("worker", "Combine these into one summary."),
    branch=b,
)
print(res.get("final") or res["results"])
```

### `chain(steps, *, synthesize=None, branch=None)`

Run steps in **sequence**, threading each output into the next. A step's empty
task means "work on the previous step's output".

```python
res = subagents.chain(
    [("scout", "Gather the relevant code."),
     ("planner", ""),          # plans from the scout's output
     ("worker", "")],          # implements the plan
    branch=b,
)
print(res.get("final"))
```

### `run_chain(name, input="", *, branch=None)`

Run a **saved chain preset** (`<name>.chain.md`) by name; `{input}` is
substituted into each step's task.

```python
res = subagents.run_chain("scout-plan-build", input="Add a /stats command", branch=b)
print(res.get("final"))
```

## Authoring — just drop a `.md`

No code needed. A subagent is a markdown file: frontmatter + a body that is its
system prompt. Drop it in the channel's
`branches/branch_<id>/agents/extensions/subagents/agents/` (discovered **live** —
no reload), or in `assets/workspace_template/agents/extensions/subagents/agents/`
to ship it to every new channel.

```text
---
name: translator
description: Translate text to clean, idiomatic Russian.
model: qwen3.6:27b
tools: fs.read, fs.ls
max_iterations: 4
---
You translate the user's text into natural Russian. Output ONLY the translation.
```

A **chain preset** is `<name>.chain.md` in the sibling `chains/` folder —
frontmatter (`name`, `description`) + one `## <agent>` section per step
(`{input}` = the run input):

```text
---
name: explore-then-plan
description: Scout the code, then plan a change.
---
## scout
{input}

## planner
Plan the change using the scout's findings above.
```

Subagents authored this way are **delegation-only** — they never appear in the
channel's chat-agent list (the agent console scans for `agent.json` folders, and
the nested `extensions/` folder has none).

## See also

- [Agents (create & query)](./agents.md) — build full chat agents and `query()` them.
- The bundled `scripts/subagents.py` example (▶ Run) and the `subagents` notebook
  example page.
