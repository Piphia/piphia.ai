---
title: API reference
sidebar_position: 9
---

# API reference

Real signatures from `agent_sdk`. Constructors for `Notes` / `Ideas` accept a
`branch` id (falls back to `detect_branch()`) and an optional `base` URL
(default `http://127.0.0.1:9090`).

## `Notes` — the notebook

`from agent_sdk import Notes` · `Notes(branch=None, base=None)`

### CRUD + navigation

```python
pages()                                   # [{id, title, parent_id, active, created_ms}]
read(page)                                # raw markdown for a page id
write(page, content)                      # replace → True
append(page, text, *, sep="\n\n")         # add a block → True
create(name, *, title=None, parent="active", source=None)   # → new page id
delete(page)                              # → True
search(query, *, limit=20)                # substring scan → [{id, title, snippet}]
assembled()                               # the whole notebook as one doc (str)
tree()                                    # {parent_id: [page, ...]} — the DAG
children(page)                            # [page, ...]
```

Media + files:

```python
add_block(page, fence, src)               # append ```image/```youtube/```pdf <src>
add_image(page, src); add_youtube(page, src); add_pdf(page, src)
save_file(name, data)                     # bytes/str → "files/<name>"
download_to_files(url, name=None)         # fetch a URL into files/ → workspace path
```

### Structured rich-read ("like the editor")

Each parses the page and resolves one block kind into typed data:

```python
parsed(page)        # [{type: fence/table/heading/task/text, ...}]
headings(page)      # [{level, text}]
tasks(page)         # [{done, text}]  from - [ ] / - [x]
tables(page)        # [{headers, rows}]  rows = list of dicts
ideas(page)         # !ideas::#id refs → resolved idea rows (via Ideas.get)
databases(page)     # ```db <id>``` → [{kind, db, rows, spec}] — REAL rows
plugins(page)       # ```plugin <id>``` → [{id, params}]
handlers(page)      # ```python <name>.py``` → [{name, trigger, code, is_cell}]
refs(page)          # every inline !db::row::field → [{db, row, field, two_way, token}]
```

`handlers` reads the `# action:` / `# on:` / `# every:` / `# compute:` marker as
`trigger = {kind, value}`; a bare code fence with no name/trigger → `is_cell: True`.

## `Ideas` — the ideas graph

`from agent_sdk import Ideas, EDGE_TYPES` · `Ideas(branch=None, base=None)`

```python
EDGE_TYPES == ["extends", "supports", "references",
               "contradicts", "similar_to", "example_of", "parent_of"]
```

### Create & ingest

```python
create(content, *, tags=None, type="fleeting", parent=None,
       title=None, color=None, note=None, after=None) -> dict
# INSERT an idea. If note= is given, also materialise the !ideas::#<id>::content=
# ref into that page (at the end, or after `after`'s ref). parent defaults to note.
# → {id, seq, content, tags, type, note, materialised?}

ingest(text, note, *, type="fleeting", extra_tags=None, after=None) -> dict
# one-shot: split #hashtags into tags, create the idea, materialise into note

parse_tags(text) -> (clean_text, [tags])   # staticmethod
```

### Read & search

```python
get(idea_id)                              # full row or None
all()                                     # every idea, seq-ordered
find(*, text=None, tag=None, type=None, parent=None, limit=50)   # ANDed filters
edges(idea_id=None)                       # all edges, or those touching an idea
neighbors(idea_id)                        # ideas one hop away
```

`find`: `text`/`tag` are substring `LIKE`; `type`/`parent` are exact.

### Link & materialise

```python
link(source, target, type="references", *, weight=0.6, context=None) -> dict
# typed/weighted edge, dedup'd (same source+target+type → {existed: True}).
# An unknown type falls back to "references".

insert_into_note(idea_id, note, *, after=None) -> dict
# write an existing idea's ref token into a page (after a ref, else append)
```

## `@tool` — custom tools (→ `tool.<name>`)

`from agent_sdk import tool`

```python
tool(name: str, description: str, schema: dict[str, type]) -> decorator
```

`schema` maps arg name → Python type (`str`/`int`/`float`/`bool`). The decorated
function takes a single `args` dict and returns an MCP-style
`{"content": [{"type": "text", "text": ...}]}` (the text is unwrapped; any other
return passes through). `async def` tools are awaited. Exposes capability
`tool.<name>`.

**Dual-mode:** if a `GG` bridge is in the caller's globals (runtime — the
scene-tool is executing the file), the decorator self-executes (reads node
inputs by schema keys, calls the fn, sets `_result`). Otherwise (build / Run
button) it returns the `Tool` object.

Register file-backed tools:

```python
discover_tools(branch_id, *, scripts_subdir="scripts", reload=True) -> list[str]
# scans <branch>/scripts/*.py; each file with exactly one @tool becomes a
# file-backed scene-tool (code_file). Skips _* helpers and zero/multi-@tool files.
# Returns the registered tool.<name> capabilities.

add_requirements(branch_id, packages: list[str]) -> dict   # pip into .python_deps/ (desktop only)
```

## `create_subagent` — sub-agents (→ `subagent.<name>`)

`from agent_sdk import create_subagent`

```python
create_subagent(
    name, *,
    description: str,
    allowed_tools: list[str],          # existing caps + tool.<name> ids
    system_prompt: str,
    tools: list[str | Tool] = None,    # extra @tools: file PATHS or Tool objects
    model: str = "",                   # "" → inherit default provider
    max_iterations: int = 5,
    arg_key: str = "text",             # the single input the sub-agent takes
    prompt_template: str = None,       # default "{<arg_key>}"
) -> SubAgent
```

A focused LLM restricted to a SUBSET of capabilities + a system prompt, exposed
as ONE capability `subagent.<name>` (no Python body — the LLM drives). `tools`
entries are appended to `allowed_tools` automatically. Save to register:

```python
sa = create_subagent(...)
sa.save(branch_id)        # writes scene(s) + POST /tools/reload → ["...path.json", ...]
sa.scenes(branch_id)      # the raw scene dicts (no write)
```

## `query()` — call an agent over HTTP

`from agent_sdk import query, AgentOptions`

```python
async for msg in query(prompt: str, options: AgentOptions = None): ...
# yields one final {response, tool_calls, finish_reason} from POST /pi/query

@dataclass
class AgentOptions:
    allowed_tools:  list[str] | None = None
    system_prompt:  str = ""
    model:          str = ""
    max_iterations: int | None = None
    branch:         str | None = None    # default: the script's channel
    thread:         str | None = None
    agent_dir:      str = ""
    base_url:       str | None = None    # default http://127.0.0.1:9090
```

## `subagents` — call agents by name

`from agent_sdk import subagents` (thin wrappers over `/subagents/*`):

```python
subagents.run(agent, task, *, branch=None)               # one synchronous run
subagents.parallel(tasks, *, synthesize=None, branch=None)  # fan-out (barrier)
subagents.chain(steps, *, synthesize=None, branch=None)     # sequence, threaded
subagents.run_chain(name, input="", *, branch=None)         # a saved *.chain.md preset
subagents.list_subagents(*, branch=None)
```

`tasks`/`steps` items are `(agent, task)` tuples or `{agent, task}` dicts;
`synthesize` adds a final fan-in subagent whose answer lands in the result's
`final`.
