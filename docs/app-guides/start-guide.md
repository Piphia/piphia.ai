---
sidebar_position: 1
title: Start guide
---

# Start guide

An orientation tour: the workspace, the editor, and the agent console.

## Two processes, one app

The app is a Flutter shell talking to a Rust backend (`agent_core`):

- **`agent_core`** runs an HTTP + WebSocket server, owns your SQLite stores and
  scene/agent runtime, and embeds CPython for scripting.
- **The Flutter shell** is the UI — the editor, dashboards, the agent console, and
  view plugins.

They communicate over JSON HTTP (REST) plus one WebSocket event stream. By default
the shell uses `http://127.0.0.1:9090` and `ws://127.0.0.1:9090` — all local.
Live updates (a row changed, a task toggled, a scene fired) arrive over the
WebSocket so views refresh without polling.

## The workspace

Your content is **local-first** and organised per channel:

- **Notes** are plain markdown files in your workspace. They stay the single
  source of truth and stay portable — the same vault opens in other markdown
  tools.
- **Structured data** lives in local SQLite databases (see the
  [database guide](./database-guide.md)).
- Each channel has its own `notes.md` and its own databases; notes are stored
  under the channel's branch directory.

## The editor

The markdown editor renders in **Live Preview**: as you type, recognised blocks
become live widgets. Beyond ordinary markdown, the editor understands:

- **Tasks** — markdown checkboxes with the Obsidian Tasks emoji vocabulary
  (`📅` due, `⏳` scheduled, `✅` done, `🔺⏫🔼🔽⏬` priority, `#tag`, `🆔 id`).
  Ticking a box stamps the done-date and preserves the rest of the line.
- **Runnable blocks** — task **execution bindings** (`🤖 <agent>` /
  `⚙️ <cap>{params}`), `ask` blocks, `query` blocks, and `automation` blocks.
  Blocks with a binding get a ▶ in the editor; pressing it runs the block and
  writes the result back into the file.
- **Frontmatter** — a leading `--- … ---` block of flat `key: value` pairs marks a
  note as a project (e.g. `status`, `deadline`, `owner`).
- **Embedded views** — a `view` fence drops a database view (kanban / calendar /
  chart / graph) right into the note (see the [table guide](./table-guide.md)).

**Markdown stays the source of truth.** Results from running a block are written
back into the same file as delimited blocks, so re-runs replace cleanly and the
file remains portable.

### Running things — and the safety gate

Nothing runs on open or on sync. A block executes only when you click its ▶ (or
call `POST /md/run` with the branch and line). Tool and agent calls pass through
the normal permission gate, and registering an automation always asks for
confirmation — so a synced or shared note can't silently arm a job.

## The agent console

You talk to a built-in AI agent in a console. The agent is LLM-driven: it reads
context (including your notes and databases via its tools), calls tools, and
replies or takes an action.

The agents are powered by **local models** by default — through Ollama or a
bundled provider — so the console works offline; an OpenAI-compatible provider is
optionally available. See the [agents guide](./agents-guide.md) for scenes, agents
reading your data, and sub-agents.

## Where things are

| You want to… | Look at |
| --- | --- |
| Edit prose and runnable blocks | the markdown editor (Live Preview) |
| Hold structured, typed data | a database ([guide](./database-guide.md)) |
| See data as a board / calendar / chart | a `view` fence or the plugins dock |
| Ask the AI / automate something | the agent console / `ask` & `automation` blocks |
