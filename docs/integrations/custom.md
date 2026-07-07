---
sidebar_position: 3
title: Build your own connector
---

# Build your own connector

Adding a service is **one Python file** in the channel's `scripts/` folder.
No core changes, no editor changes: the ` ```connect <service> ` block, the
credentials dialog and the slash-palette entry all derive from the tool
registry.

## The contract

A connector is a tool named `<service>_connect` (one `@tool` per file). Its
**schema is the dialog**: field names, labels, placeholders and secret
masking come from the `ui=` metadata.

There are two credential protocols in `agent_sdk`:

### 1. API key / token — `agent_sdk.api_key`

For services with copy-paste tokens (GitHub, Notion, Slack, Todoist):

```python
# scripts/servicey_connect.py
from agent_sdk import tool, api_key


def _text(s):
    return {"content": [{"type": "text", "text": s}]}


@tool("servicey_connect",
      "Connect ServiceY with an API key. Validates and stores it.",
      {"token": str},
      ui={"token": {"label": "API key", "secret": True, "placeholder": "sk-…"},
          "_note": "Where to get the key — shown under the dialog title."})
def servicey_connect(args):
    try:
        account = api_key.setup(
            "servicey", args.get("token") or "",
            validate=lambda t: _whoami(t))   # raise = invalid; return = label
        return _text("connected: %s" % account)
    except Exception as e:
        return _text("error: %s" % e)
```

`api_key.get("servicey")` then returns the token anywhere (tools, ▶-blocks,
automations); it is stored in the local KV (`integrations/servicey_token`).

### 2. OAuth 2 (loopback) — `agent_sdk.oauth`

For services with an OAuth consent flow (Google, Reddit). The user brings
their *own* OAuth client; the app's core exchanges the code server-side at
`/oauth/callback`:

```python
from agent_sdk.oauth import OAuthService

svc = OAuthService(
    id="servicex",
    auth_url="https://servicex.com/oauth/authorize",
    token_url="https://servicex.com/oauth/token",
    scopes=["read"],
    # Provider quirks, all optional:
    extra_auth_params={"duration": "permanent"},  # extra ?query on consent
    pkce=True,             # False if the provider chokes on PKCE (Reddit)
    token_auth="form",     # "basic" if the token endpoint wants Basic auth
    api_headers={},        # e.g. a User-Agent the API insists on
)
```

The connect tool stores the client and returns the consent link **as a
markdown link** (the editor renders it under the block):

```python
@tool("servicex_connect", "Connect ServiceX …",
      {"client_id": str, "client_secret": str},
      ui={"client_secret": {"label": "Client secret", "secret": True}})
def servicex_connect(args):
    cid, sec = args.get("client_id", ""), args.get("client_secret", "")
    if cid and sec:
        svc.setup(cid, sec)
    return _text("Open and allow: [Connect ServiceX](%s)" % svc.connect_url())
```

After the grant, `svc.api("GET", "https://api.servicex.com/…")` makes
authorized calls with automatic token refresh.

## Rules that keep it safe

- **Secrets never live in notes or script bodies** — only in the local KV,
  written by the connect tool.
- **One `@tool` per file** — multi-tool files are skipped by the registry
  scan.
- Sending/writing tools should act only on explicit user intent (see
  `gmail_send`'s draft-first pattern).

## Checklist for a new service

1. `scripts/<service>_connect.py` — the connect tool (this page's patterns).
2. Optional `agent_sdk`-style module or plain functions for the API surface,
   plus one tool file per operation (`<service>_search.py`, …).
3. Reload tools (restart, or `discover_tools` from a ▶-block) — the
   ` ```connect <service> ` block, dialog and palette entry appear on their
   own.
