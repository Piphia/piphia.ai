---
title: Overview
sidebar_position: 1
---

# Plugins overview

A plugin is a small same-origin web page (HTML + JS + CSS) the host embeds in an
`<iframe>`. The core serves it and injects `window.agent` so the plugin can call
capabilities, run agents, read settings, and receive live data — all scoped to
the channel it's embedded in. There is no build step and no framework
requirement.

## Where plugins live

Your plugins live in your workspace at `<workspace>/plugin_registry/<id>/`.
Each plugin folder carries:

```
plugin_registry/<id>/
    plugin.json   # manifest (required to appear in the registry)
    index.html    # entry (required)
    …             # any assets (js/css/img/json), served alongside
```

Drop a folder in and the registry picks it up **live, with no core restart**. It
then appears in `GET /plugins/registry`, the graph dock's «+ plugin» menu, the
channel panels picker, and dashboard widgets.

## Served by the core

`agent_core` serves every plugin, and the plugin reaches the core API
**same-origin** (no CORS or auth dance). A plugin is served two ways, both
same-origin:

- `/system/<id>/index.html?branch=<b>&surface=<s>&…` — global serve
- `/plugins/<branch>/<id>/index.html?…` — per-channel install

In shipped builds the plugin files are minified/obfuscated and baked into the
`agent_core` binary; in debug builds they are served from disk so you can
live-edit and reload. A global `asset_gate` middleware lets `/system/*` through
only for browser-origin (webview) requests, blocking trivial `curl` copying.

## Surfaces

`agent.ctx.surface` tells a plugin which context it is rendered in, so it can
adapt its layout. The surfaces are: `panel`, `dashboard_widget`, `view`, `chat`,
`modal`, `settings`, and `note_embed`. A manifest declares the surfaces it
contributes via `contributes.panels`, `contributes.dashboard_widgets`,
`contributes.editors`, etc.

## Embedding in notes via view fences

A note can embed any registered plugin with a fenced block. The plugin renders
inline in the note (the `note_embed` surface):

````markdown
```plugin clock
```
````

Embeds can pass a height and plugin-specific arguments after the id, for example
`` ```plugin ggdraw 360 file=<name> `` or `` ```plugin agent_console ``.

## Capabilities

The manifest's `capabilities` array is an **allow-list** of the capabilities the
plugin may call via `agent.invoke`. The `/plugin_api/<branch>/<plugin>/invoke`
endpoint enforces it server-side: a capability not listed in `plugin.json` is
rejected (403). External network calls go through a server-side Python `@tool`,
not browser `fetch`.

## Where to next

- [Shipped plugins](./core-plugins) — the built-ins you can embed today.
- [Data layer (dataview.js)](./dataview-js) — read/write your channel data live.
- [Host API & building a plugin (agent.js)](./agent-js) — `window.agent` + a
  complete worked example.
