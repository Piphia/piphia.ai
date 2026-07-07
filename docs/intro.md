---
sidebar_position: 1
slug: /
title: Introduction
---

# Introduction

A cross-platform, **local-first** notes app with a markdown editor, SQLite-backed
databases, embeddable plugins, and built-in AI agents you talk to in a console.

It's built from two cooperating processes:

- **`agent_core`** — a Rust backend that runs an HTTP + WebSocket server, owns
  your data in local SQLite, runs the scene/agent runtime, and embeds CPython
  for scripting.
- **A Flutter shell** — the desktop / mobile client: the editor, dashboards, the
  agent console, and view plugins.

Both speak JSON over HTTP and share a single WebSocket event stream. By default
the shell talks to the backend on `http://127.0.0.1:9090` (and
`ws://127.0.0.1:9090` for live events) — everything runs on your own machine.

## Local-first — your data stays on your machine

- **Your data is local.** Notes are plain markdown files in your workspace;
  structured data lives in local SQLite databases. Open the same vault in another
  markdown tool (e.g. Obsidian) and your notes are still there.
- **Works offline.** The backend can drive **local models** — via
  [Ollama](https://ollama.com) or a bundled provider — so the AI features work
  without sending your notes to a cloud service. (An OpenAI-compatible provider
  is also available if you choose to use one.)
- **No accounts, no multi-tenancy.** It's a single backend instance paired with a
  single client, running in dev-mode on loopback.

## The four pillars

1. **Notes + knowledge.** A markdown editor with Live Preview. Each channel has a
   `notes.md` that is more than text — tasks, queries, and agent/tool calls live
   in plain markdown, render as live widgets, and can actually *run*, writing
   their results back into the file. Markdown stays the single source of truth.

2. **Databases.** Notion-style databases on SQLite: typed fields
   (text / number / date / select / relation / multi_relation / rollup / formula /
   ai / python / tool / button), multiple **views** over the same rows, relations
   with two-way sync and free backlinks, and rollups computed server-side.

3. **Plugins.** Embeddable view plugins (kanban, calendar, chart, graph) that you
   drop into a note via a `view` fence or run standalone in a plugins dock. They
   read and write your data live through a single universal data contract — no
   plugin ever touches SQL directly.

4. **Agents.** Built-in AI agents you talk to in a console. An agent can read your
   notes and databases, call tools, run scheduled automations, and delegate to
   specialised sub-agents.

## Supported platforms

The Flutter shell targets **macOS, Windows, Linux, Android, and iOS**. The Rust
backend runs alongside it on desktop; the same HTTP/WebSocket contract is used
everywhere, so the app behaves the same across platforms.

## Where to go next

- [Quick start](./quick-start.md) — your first 10 minutes.
- [Start guide](./app-guides/start-guide.md) — orientation: workspace, editor,
  console.
- [Database guide](./app-guides/database-guide.md) — databases on SQLite.
- [Table & dataview guide](./app-guides/table-guide.md) — the `view` fence and
  computed tables.
- [Agents guide](./app-guides/agents-guide.md) — the console, scenes, and
  sub-agents.
