---
sidebar_position: 4
title: Agents
---

# Agents

Agents are the AI you talk to. They run on the local backend, read your notes and
databases through tools, call capabilities, and can delegate work to specialised
sub-agents — all driven by **local models** by default (Ollama or a bundled
provider), with an OpenAI-compatible provider as an option.

## The console

You talk to an agent in a console. Send a message; the agent is LLM-driven and
runs a short loop: it reads context, optionally calls one or more tools, feeds the
results back to the model, and then replies or takes an action. Because it runs on
the local backend, the conversation and the data it touches stay on your machine.

You can also invoke an agent right inside a note:

- **`ask` blocks** — `` ```ask assistant `` … `` ``` ``. Press the ▶ at the end of
  the fence; the channel agent answers and writes its reply as a `>` blockquote
  after the fence (idempotent — re-running replaces it).
- **Task bindings** — attach `🤖 <agent>` to a task line and press ▶ to run the
  channel agent on the task text; the answer is written under the task and the
  task is marked done.

## Scenes — how agents are built

Under the hood, everything the app does is a **scene**: a small JSON graph of
nodes. An agent that lives inside a scene is an `agent_brain` node. Each time it
evaluates, it:

1. resolves its inputs (the user message and any trigger/context),
2. loads its conversation history,
3. assembles a system prompt that fits the model's context window — mixing in
   relevant knowledge and history,
4. calls the LLM,
5. if the model emits a tool call, fires the matching tool (another scene) and
   feeds the result back, looping,
6. persists the conversation and returns the assistant's text.

A **tool** the agent can call is just an action scene plus a JSON schema for its
arguments. When the model emits `{"tool": "...", "args": {...}}`, the backend runs
that scene with those args. Every agent also always has a few built-in
intrinsics — for example searching its knowledge and reading the clock.

## Agents reading your notes and databases

An agent doesn't operate blind — it reads your content through its tools and
context:

- **Notes & tasks.** The channel agent behind `ask`/`automation` blocks reads the
  note's live tasks and notes through its own read-only tools.
- **Databases.** Through the data layer (see the
  [table guide](./table-guide.md)), an agent can read rows, relations, and
  computed values — exactly what the views show — and write back where allowed.
  The `ai` database field is this in miniature: a cell whose value an agent
  computes from the rest of the row, cached per row.
- **Knowledge.** Agents can search a knowledge/RAG layer for relevant context,
  and that context is folded into the system prompt within the model's budget.

## Automations — agents on a schedule

A note can turn into a recurring job with an `automation` block:

````markdown
```automation
id: daily-overdue
every: day 09:00          # day HH:MM | hourly | N min|sec|hour | a cron expr
do: ask What's overdue today?
```
````

The `do:` line fires the channel agent (`ask <prompt>`), a capability
(`tool <cap>{params}`), or a task toggle. Each fire notifies you and, when the
block has an `id:`, writes the result back into the note as a timestamped
blockquote — so the note becomes a living log.

**Safety:** registering an automation is auto-execution, the most sensitive
action, so it always asks for confirmation, and the action runs through the normal
permission gate. By default the `ask` agent is branch-scoped and read-only.

## Sub-agents (peer agents)

Beyond the channel agent, the system supports **peer agents**: self-contained
specialists, each with its own isolated tool set. A peer agent is exposed to other
agents as a tool, so one agent can **delegate** a sub-task to a specialist mid-run.
Agent-calls-agent recursion is bounded by a delegation depth guard, so delegation
can't loop forever.

This lets you compose behaviour: a general assistant in the console can hand off a
focused job (research, a domain query, a structured extraction) to a sub-agent
built for exactly that, then use the result.

## Where agents come from

Agents are provided in a few ways:

- **Built-in** agents registered by the backend (e.g. the chat and task agents).
- **Scene-driven** agents — drop an `agent_brain` node into a scene and declare
  some action scenes as its tools; no backend code needed.
- **Mod-supplied** agents — a mod (plugin) can ship its own agent. A *pure* mod
  configures an agent entirely from JSON (manifest + prompts + tools), so an
  author who can write JSON can build an agent without touching backend code.

## See also

- [Database guide](./database-guide.md) — the data an agent reads and writes.
- [Table & dataview guide](./table-guide.md) — how that data is surfaced live.
