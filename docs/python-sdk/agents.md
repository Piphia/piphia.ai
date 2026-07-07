---
title: Agents (create & query)
sidebar_position: 2
---

# Agents: create & query

The `agent_sdk` package gives you two ways to make an agent and several ways to
call one.

- **`create_subagent`** — builds a single callable *capability*
  (`subagent.<name>`): a focused LLM with a restricted tool set, no folder and no
  chat scene.
- **`create_agent`** — creates a *real, full agent folder* over `POST /agents`:
  its own `agent.json`, `system_prompt.md`, `tools_allow.txt`, `skills/`,
  `prompts/` and a chat scene. Usable as a chat agent and callable by name via
  `subagents.run`.

To **call** an agent you have `query()` (a one-shot pi sub-agent over HTTP,
returning the full envelope) and the `subagents` helpers (`run`, `parallel`,
`chain`, `run_chain`, `list_subagents`).

---

## API

### Creating a sub-agent — `create_subagent`

```python
create_subagent(
    name: str,
    *,
    description: str,
    allowed_tools: list[str],
    system_prompt: str,
    tools: list[str | Tool] | None = None,
    model: str = "",
    max_iterations: int = 5,
    arg_key: str = "text",
    prompt_template: str | None = None,
) -> SubAgent
```

Returns a `SubAgent`. Exposes capability `subagent.<name>`; scene id is
`subagent_<name>`.

- `allowed_tools` — existing capability names, e.g. `["knowledge.notes", "user.notify"]`.
- `tools` — custom tools, EITHER a branch-relative **path** to a dedicated
  `@tool` file (`"scripts/send_mail.py"`, file-backed via `code_file`) OR a `Tool`
  object (inlined). Each tool's `tool.<name>` capability is appended to the
  allow-list automatically.
- `arg_key` — the single input key the sub-agent reads (default `"text"`).
- `prompt_template` — overrides the default template `"{<arg_key>}"`.

`SubAgent` methods:

```python
sa.scenes(branch_id, branches_dir=...) -> list[dict]   # sub-agent scene + one per custom tool
sa.save(branch_id, *, branches_dir=..., reload=True, base_url=...) -> list[str]   # writes scenes, reloads registry
```

`sa.save()` returns the list of written scene file paths.

### Creating a real agent — `create_agent`

```python
create_agent(
    name: str,
    *,
    system_prompt: str = "",
    tools_allow: list[str] | None = None,
    model: str = "",
    description: str = "",
    permissions: list[str | dict] | None = None,
    branch_id: str | None = None,
    base_url: str = "http://127.0.0.1:9090",
) -> dict
```

Returns the server's `{ok, name, scene, scope, dir}`.

- `branch_id` — omit for a **system** agent (`mods/pi/agents/<name>/`); pass a
  channel id for a **user** agent (`branches/branch_<id>/agents/<name>/`).
- `tools_allow` — the capability whitelist (the only tools the agent sees).
- `permissions` — each item is a capability name (`str`) OR
  `{"capability": str, "requires_confirmation": bool}`.

The chat scene is written immediately and is mountable without a restart. Related
helpers: `list_agents(branch_id=None)`, `get_agent(name, branch_id=None)`,
`edit_agent(name, *, model=None, description=None, system_prompt=None, tools_allow=None, permissions=None, branch_id=None)`.

### Querying an agent — `query` + `AgentOptions`

```python
async def query(prompt: str, options: AgentOptions | None = None) -> AsyncIterator[Any]
```

Runs a one-shot pi sub-agent over `POST /pi/query`, yielding ONE final message:
the agent's `{response, tool_calls, finish_reason}` envelope. `AgentOptions`
fields (all real):

| Field | Type / default | Meaning |
|---|---|---|
| `allowed_tools` | `list[str] \| None = None` | Capabilities the agent may use. Empty = inherit / unrestricted. |
| `system_prompt` | `str = ""` | Override system prompt. |
| `model` | `str = ""` | Model name (provider derived from prefix unless `provider` set). |
| `max_iterations` | `int \| None = None` | ReAct iteration cap. |
| `branch` | `str \| None = None` | Channel to run in. `None` auto-detects the script's channel; `""` forces NO channel context. |
| `thread` | `str \| None = None` | Target thread (defaults to `"main"`). |
| `agent_dir` | `str = ""` | Path to the agent's bundle — now a **user** agent from the branch's home folder, e.g. `branches/branch_<id>/agents/<name>`. |
| `agent_name` | `str = ""` | POOL name resolved server-side (this channel's agents first, then system). Ignored when `agent_dir` is set. |
| `provider` | `str = ""` | Explicit LLM backend (`openai`/`ollama`/`openrouter`/`claude`/`deepseek`). Empty = derive from model name. |
| `base_url` | `str \| None = None` | agent_core SERVER URL (where `/pi/query` lives), NOT the LLM endpoint. |

Helper: `detect_branch() -> str | None` returns the script's channel id.

### Calling agents by name — `subagents`

Thin wrappers over `/subagents/*`. Each returns the server JSON verbatim
(`{ok, response, error}` for a single run; `{results: [...]}` for fan-out/chain).
A *step* is `(agent, task)` or `{"agent", "task"}`; for `chain` it may also be a
parallel group `{"parallel": [steps], "as": name}`.

```python
subagents.run(agent, task, *, branch=None, base_url=...)            # ONE agent, sync
subagents.parallel(tasks, *, synthesize=None, branch=None, ...)     # concurrent (barrier)
subagents.chain(steps, *, synthesize=None, branch=None, ...)        # sequence; output threads into next
subagents.run_chain(name, input="", *, branch=None, ...)           # run a saved *.chain.md preset
subagents.list_subagents(*, branch=None, base_url=...)             # list callable agents + chain presets
```

`synthesize` (on `parallel`/`chain`) adds a final fan-in agent that merges
outputs into one answer, returned in the result's `final`. It can be an agent
name, an `(agent, instruction)` tuple, or a `{agent, task}` dict. Pass `branch`
(a channel id) to target that channel's USER agents.

---

## Examples

### 1. Create a sub-agent with a file-backed tool

```python
from agent_sdk import create_subagent

sa = create_subagent(
    "mailer",
    description="Compose and send a short email.",
    allowed_tools=["knowledge.notes"],
    system_prompt="You write concise, friendly emails, then send them.",
    tools=["scripts/send_mail.py"],   # a dedicated @tool file under the channel
    max_iterations=4,
)

paths = sa.save("branch_42")          # writes scenes + reloads the registry
print("capability:", sa.capability)   # subagent.mailer
print("scenes:", paths)
```

### 2. Create a real, full agent

```python
from agent_sdk import create_agent, get_agent

res = create_agent(
    "support_bot",
    system_prompt="You answer product questions from the knowledge base.",
    tools_allow=["agent_knowledge.search", "knowledge.notes"],
    description="Customer-support assistant.",
    permissions=[
        "knowledge.notes",
        {"capability": "user.notify", "requires_confirmation": True},
    ],
    branch_id="42",                   # user agent under branches/branch_42/agents/
)
print(res)                            # {ok, name, scene, scope, dir}
print(get_agent("support_bot", "42")["tools_allow"])
```

### 3. Query an agent over HTTP

```python
import asyncio
from agent_sdk import query, AgentOptions

async def main():
    async for message in query(
        "Summarise the latest notes on Maine Coons.",
        options=AgentOptions(
            agent_name="support_bot",          # resolved against the agent pool
            allowed_tools=["agent_knowledge.search"],
            branch="42",
            max_iterations=5,
        ),
    ):
        print(message["response"])
        print("tools used:", message.get("tool_calls"))

asyncio.run(main())
```

### 4. Fan-out and fan-in with `subagents`

```python
from agent_sdk import subagents

# one agent, synchronously
r = subagents.run("researcher", "Find facts about Maine Coons.", branch="42")
print(r["response"])

# run two in parallel, then merge into one answer
merged = subagents.parallel(
    [("researcher", "gather facts"), ("reviewer", "critique the facts")],
    synthesize=("writer", "Merge into one brief paragraph."),
    branch="42",
)
print(merged["final"])

# sequence: each output threads into the next step
chained = subagents.chain([
    {"agent": "scout",   "task": "gather sources"},
    {"agent": "planner", "task": "turn them into a plan"},
])
print(chained["results"])

# run a saved chain preset (research-and-plan.chain.md)
preset = subagents.run_chain("research-and-plan", input="Maine Coon care")
print(preset)

# discover what's callable
for a in subagents.list_subagents(branch="42").get("agents", []):
    print(a)
```
