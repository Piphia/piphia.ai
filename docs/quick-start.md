---
sidebar_position: 3
title: Quick start
---

# Quick start

Your first ten minutes. By the end you'll have edited a markdown note, built a
database with a view, embedded a plugin, and talked to an agent.

## 1. Open the app

Launch the app. It connects to the local `agent_core` backend on
`http://127.0.0.1:9090` and opens your workspace. Everything you do is stored
locally — notes as markdown files, structured data in local SQLite.

## 2. Create and edit a markdown note

Open the editor and edit a note. The editor renders markdown in **Live Preview**:
as you type, special blocks turn into live widgets.

The note is plain markdown and stays the source of truth. Try a checkbox task —
the editor understands the Obsidian-style task vocabulary:

```markdown
- [ ] Draft the spec 📅 2026-07-01 ⏫ #proto
- [x] Sketch the idea ✅ 2026-06-01
```

`📅` is a due date, `⏫` is a priority, `#proto` a tag, and ticking a box stamps a
`✅` done-date automatically.

## 3. Make a database and a view

Databases are Notion-style tables on SQLite. Create one and give it a couple of
**typed fields** — for example a `text` title, a `select` status with choices
`todo / doing / done`, and a `date` due field.

Add a few rows. Then look at the same data through different **views** — the same
rows, different lenses. The bundled view plugins each show one axis of the data:

- **kanban** — group by a status field
- **smart_calendar** — a time axis (events)
- **smart_chart** — a number over time

## 4. Embed a plugin in a note

Inside a markdown note you can embed a view with a `view` fence. The fence names
the data source, the plugin, a height, and optional `key=value` params:

````markdown
```view db:tasks kanban 360 group=status
```
````

````markdown
```view db:prices smart_chart 360 y=price x=at filter=symbol:TSLA tf=hour
```
````

The fence forwards `source=` plus the params to the plugin as URL params. The
embedded view reads and writes your database **live** — edits made in the plugin
show up in the grid (and vice-versa), because every surface talks to the same
data contract. The same plugins also run standalone in the plugins dock with
their own source pickers.

## 5. Talk to an agent in the console

Open the agent console and send a message. The agent is LLM-driven and can read
your notes and databases through its tools, then answer or take an action.

Two lightweight ways to put an agent right inside a note:

- An **`ask` block** — a fenced block whose info-string is `ask [agent]`. Press
  the ▶ at the end of the fence and the channel agent answers, writing its reply
  as a `>` blockquote right after the fence:

  ````markdown
  ```ask assistant
  Which tasks in this project aren't done yet?
  ```
  ````

- A **task binding** — attach `🤖 <agent>` or `⚙️ <cap>{params}` to a task line;
  press ▶ to run it. The answer is written under the task and the task is marked
  done.

```markdown
- [ ] Summarise this channel 🤖 assistant
- [ ] TSLA quote ⚙️ tool.stock_chart{symbol: TSLA, range: 1mo}
```

Nothing runs on open or on sync — an explicit ▶ click (or a `POST /md/run`) is the
gate, so a shared note can carry these directives safely.

## Next steps

- [Start guide](./app-guides/start-guide.md) — the workspace, editor, and console
  in more depth.
- [Database guide](./app-guides/database-guide.md) — typed fields, relations,
  rollups, the `ai` field.
- [Table & dataview guide](./app-guides/table-guide.md) — the `view` fence,
  computed cells, and `query` tables.
- [Agents guide](./app-guides/agents-guide.md) — scenes, sub-agents, automations.
