---
title: Examples
sidebar_position: 10
---

# Examples

Complete, runnable flows grounded in `agent_sdk`.

## 1. A `@tool` data source

One file, one `@tool`, registered into the channel. The body reads a secret at
runtime — never inline a token (the body is serialised to disk).

```python
# scripts/weather.py
from agent_sdk import tool

@tool("weather", "Current temperature for a city", {"city": str})
def weather(args):
    key = GG.secret("openweather_key")        # runtime secret (env → config)
    city = args["city"]
    data = Web.fetch_json(
        "https://api.openweathermap.org/data/2.5/weather"
        f"?q={city}&units=metric&appid={key}")
    temp = data["main"]["temp"]
    return {"content": [{"type": "text", "text": f"{city}: {temp}°C"}]}
```

```python
# register once (Run this, or run from the editor)
from agent_sdk import discover_tools, detect_branch
print(discover_tools(detect_branch()))        # → ["tool.weather", ...]
```

## 2. Ideas → materialise into a note

Ingest a tagged thought, create an explicit idea, and link them — all of which
show up in the editor (as `!ideas::#<id>::content=` refs) and the 3D graph with
no editor open.

```python
from agent_sdk import Ideas

ideas = Ideas("branch_b638f7df7aea81c3")

# 1) one-shot ingest of a message: #hashtags become tags, written into a page
ideas.ingest("Compounding beats timing #investing #lesson", note="ai_ideas")

# 2) explicit creates, placed in order on the page
a = ideas.create("Atomic notes hold one thought.", tags=["method"], note="inbox")
b = ideas.create("Link notes by meaning.", note="inbox", after=a["id"])

# 3) a typed, weighted edge b → a
ideas.link(b["id"], a["id"], "extends", weight=0.8, context="b builds on a")

# 4) read it back as resolved data
from agent_sdk import Notes
print(Notes("branch_b638f7df7aea81c3").ideas("inbox"))   # full idea rows
print(ideas.neighbors(a["id"]))                          # ["Link notes by meaning."]
```

## 3. A capability-scoped sub-agent

Wire the `tool.weather` from example 1 plus a builtin into a sub-agent the brain
can delegate to. It is exposed as `subagent.trip_helper`.

```python
from agent_sdk import create_subagent

BRANCH = "branch_b638f7df7aea81c3"

helper = create_subagent(
    "trip_helper",
    description="Advise what to pack for a trip, using current weather.",
    allowed_tools=["tool.weather", "knowledge.notes"],
    system_prompt="Check the weather for the city, then suggest what to pack.",
    max_iterations=4,
)
paths = helper.save(BRANCH)          # writes scene(s) + reloads → subagent.trip_helper
print(paths)
```

Call it directly with `query()` (the agent decides to invoke the sub-agent):

```python
import asyncio
from agent_sdk import query, AgentOptions

async def main():
    async for msg in query(
        "What should I pack for Lisbon?",
        options=AgentOptions(branch=BRANCH,
                             allowed_tools=["subagent.trip_helper"])):
        print(msg["response"])

asyncio.run(main())
```

## 4. Fan-out across named agents

When you already have several agents, run them concurrently and merge their
answers with a synthesizer (its answer lands in `final`).

```python
from agent_sdk import subagents

res = subagents.parallel(
    [("researcher", "Find facts on Maine Coon care."),
     ("reviewer",   "List common care mistakes.")],
    synthesize=("writer", "Merge into one short care brief."),
    branch="branch_b638f7df7aea81c3",
)
print(res["final"])
```
