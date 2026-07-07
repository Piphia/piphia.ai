---
sidebar_position: 9
title: Troubleshooting
---

# Troubleshooting

Common issues and how to clear them.

## The app opens but nothing loads / "backend not reachable"

The shell talks to `agent_core` on `http://127.0.0.1:9090`. If the UI is empty or
shows a connection error:

- **Desktop bundles spawn their own backend.** Make sure you launched the app
  from an intact bundle (don't move the app executable out of its folder on
  Windows/Linux — the backend and `python/` runtime live next to it).
- **Port already in use.** If something else holds `9090`, the spawned core can't
  bind. Free the port (or stop a previously-running core) and relaunch.
- **Dev mode.** If you're running from source, start the core yourself
  (`cargo run --bin agent_core`) before the shell, or let the bundle do it.

## AI features don't respond / "no model"

The agents need a model provider:

- **Ollama:** install it and pull a model — `ollama pull qwen3.6:27b` (or any
  model). Confirm Ollama is running.
- Check the app's model/settings screen and pick an installed model.
- A **bundled** provider works offline with no setup; an **OpenAI-compatible**
  endpoint is optional if you'd rather use a hosted model.

## A plugin doesn't show up

- The registry picks up `plugin_registry/<id>/` folders **live**. Confirm the
  folder has a `plugin.json` (required to appear) and an `index.html`.
- `GET /plugins/registry` should list it. If it doesn't, check the manifest is
  valid JSON.

## My edit "didn't apply" (desktop)

Desktop loads editor/plugin assets through a WebView, which can **cache them
stale** across rebuilds. If a change to a plugin or the editor doesn't appear:

- Fully quit and relaunch the app.
- If it persists, clear the platform WebView cache for the app (on macOS, the
  app container's `Library/Caches` and `Library/WebKit`).

## A Python tool can't import a package

Third-party packages used by a `@tool` need to be installed into the channel's
local deps:

```python
from agent_sdk import add_requirements, detect_branch
add_requirements(detect_branch(), ["requests", "pandas"])   # desktop only
```

Keep secrets out of tool **bodies** — read them at runtime (e.g.
`GG.secret("...")`); the body is serialised to disk.

## Where is my data? / starting clean

Your data is local: notes are markdown files in your workspace and structured
data is local SQLite, under the app's workspace directory. To start fresh, close
the app and move/rename that workspace directory — the app re-seeds a new one on
next launch. (Back it up first; this is your data.)

## Still stuck?

Open an issue on [GitHub](https://github.com) with your OS, how you launched the
app, and any error text from the console.
