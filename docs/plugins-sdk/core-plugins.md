---
title: Core plugins
sidebar_position: 2
---

# Core plugins

The plugins below ship as built-ins in the plugin registry. Descriptions are
taken from each plugin's `plugin.json`.

| Plugin | id | What it does |
|---|---|---|
| Agent Console | `agent_console` | Interactive chat console for your agents — create your own and pick which one to talk to. Defaults to the **notes** agent, so you can start a conversation right away. Embed a specific agent with ```plugin agent_console agent=<agent name>. |
| Kanban | `kanban` | Kanban board over any data-contract source (```view db:tasks kanban group=status); columns come from a select field, dragging a card patches the record and every live surface updates. |
| Smart Chart | `smart_chart` | Market-data terminal over the dataview contract: chart any db series, 9 chart types, MA/RSI/MACD/Bollinger/VWAP, event markers, drawing tools, watchlists, alerts (→ notify/telegram/script/agent) and strategy backtests. |
| Stocks chart | `stocks_chart` | Configurable stock chart (any ticker / period / interval); data via `tool.stock_chart` (Yahoo, key-less). One plugin for all tickers via ⚙ settings. |
| Crypto chart | `crypto_chart` | Configurable crypto chart (any Binance pair / period / interval); data via `tool.crypto_chart` (Binance, key-less). One plugin for all coins via ⚙ settings. |
| Smart Calendar | `smart_calendar` | Calendar over the `smart_calendar` db — schedule an event with a day/time trigger (notify / telegram); a server-side `# every:` handler fires due events. Live via the data contract. |
| Project board | `project_board` | Reads the channel's `notes.md` as a project — shows frontmatter (status/deadline) plus a live task board (Obsidian-Tasks syntax). |
| Notebook Graph | `notebook_graph` | Obsidian-style graph of the channel's notebook pages (the DAG of notes pages linked by `parent_id`); click a node to peek its content. |
| Channel Automations | `channel_automations` | Monitor that lists every mounted automation (schedules / event reactions) with its source note, timestamp and a ⏹ stop button; catches orphans whose block is gone from any note. |
| GG Draw | `ggdraw` | Excalidraw-style sketching (pen/shapes/arrows/text, hand-drawn feel, select/move, undo, pan/zoom). Drawings live as JSON in `files/ggdraw/`; embed via ```plugin ggdraw 360 file=<name>. |
| Clock | `clock` | A live digital clock with a core-rendered settings screen (format / seconds / theme). Also a 1×1 dashboard widget. |
| Bike Trials | `bike_game` | Trials-style bike game on planck.js — bike + ragdoll rider loaded from a R.U.B.E. scene; gas/brake/lean controls, crash sensor, 3 terrain levels, best times. |

## Helper libraries (no manifest)

These ship in the registry without a `plugin.json` — they are not standalone
panels but JavaScript helpers other plugins load via
`<script src="/system/<name>/<file>">`:

| Helper | What it provides |
|---|---|
| `dataview` (`dataview.js`) | The current universal data-view client SDK: views talk to the normalized data contract (`/data/:branch/query\|patch`), get `{schema, records}` with refs/relations/rollups resolved, and stay live via the `store.changed` event stream. Exposed as `window.DataView_`. See [Data layer](./dataview-js). |
| `dbview` (`dbview.js`) | The older db-only client SDK: reads schema + raw rows of N databases, stays live, writes back, and emits named triggers. Exposed as `window.DBView`. Superseded by `dataview.js` for new plugins — see the comparison in [Data layer](./dataview-js#dataviewjs-vs-dbviewjs). |
| `blocks` (`blocks.js`, `blocks.css`) | Block renderers (db / layout / plugin views) for the Agent Console dock, extracted from `md_editor` so the console renders ```db fences with the same widgets. agent_console-only. |
