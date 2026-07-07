---
sidebar_position: 1
title: Usage examples
---

# Usage examples

End-to-end recipes that combine notes, databases, plugins, and agents. Each one
is built only from features covered in the [App Guide](../app-guides/start-guide.md),
the [Plugin SDK (JS)](../plugins-sdk/overview.md) section, and the
[Python SDK](../python-sdk/quickstart.md).

## 1. A task tracker that summarises itself

Goal: a project note with a live board and a daily agent summary.

1. Create a `tasks` database with a `text` title, a `select` status
   (`todo / doing / done`), and a `date` due field. Add a few rows.
2. In your project note, embed a board over it:

   ````markdown
   ```view db:tasks kanban 360 group=status
   ```
   ````

   Drag a card between columns — the row's `status` updates, and every other view
   of `tasks` refreshes live.
3. Add a daily summary with an `automation` block:

   ````markdown
   ```automation
   id: daily-standup
   every: day 09:00
   do: ask What changed on the board yesterday, and what's overdue?
   ```
   ````

   Each morning the channel agent reads the board and appends a timestamped
   summary to the note. (Registering the automation asks for confirmation first.)

## 2. A market dashboard (plugin + tool)

Goal: a live chart with no API keys, no SQL, no CORS pain.

The `stocks_chart` plugin pairs a server-side Python tool (`tool.stock_chart`,
Yahoo, key-less) with a JS renderer. Embed it and pick the ticker in its ⚙
settings — one plugin serves any ticker:

````markdown
```plugin stocks_chart 360
```
````

For crypto, use `crypto_chart` (`tool.crypto_chart`, Binance). For a fully
custom series over your own database, use `smart_chart` with a `view` fence:

````markdown
```view db:prices smart_chart 360 y=price x=at filter=symbol:TSLA tf=hour
```
````

## 3. Ideas → notes (a Zettelkasten flow)

Goal: capture atomic ideas, link them by meaning, and see the graph.

Using the [Python SDK](../python-sdk/api.md)'s `Ideas` class:

```python
from agent_sdk import Ideas

ideas = Ideas()  # current channel

a = ideas.create("Atomic notes hold one thought.", tags=["method"], note="inbox")
b = ideas.create("Link notes by meaning.", note="inbox", after=a["id"])
ideas.link(b["id"], a["id"], "extends", weight=0.8)
```

The ideas materialise into the `inbox` page as inline refs, and the
**notebook_graph** plugin shows them as a graph (2D, plus a 3D «Связи» mode) —
click a node to peek its content.

## 4. A custom tool + plugin pair

Goal: bring an external data source in cleanly — network and secrets stay
server-side.

1. Write the tool (one `@tool` per file) and register it:

   ```python
   # scripts/weather.py
   from agent_sdk import tool

   @tool("weather", "Current temperature for a city", {"city": str})
   def weather(args):
       key = GG.secret("openweather_key")
       data = Web.fetch_json(
           "https://api.openweathermap.org/data/2.5/weather"
           f"?q={args['city']}&units=metric&appid={key}")
       return {"content": [{"type": "text",
                            "text": f"{args['city']}: {data['main']['temp']}°C"}]}
   ```

   ```python
   from agent_sdk import discover_tools, detect_branch
   discover_tools(detect_branch())     # → ["tool.weather", ...]
   ```

2. Now any agent can call `tool.weather`, a note task can bind it
   (`⚙️ tool.weather{city: Lisbon}`), or a plugin can declare it in its
   `capabilities` and call `agent.invoke("tool.weather", {city})`.

See [Plugin SDK → Build a plugin](../plugins-sdk/agent-js.md) for the JS render half.
