---
title: Host API & building a plugin (agent.js)
sidebar_position: 4
---

# Host API — `window.agent` (`agent.js`)

Every plugin is a same-origin web page the core embeds in an `<iframe>`. The
host injects **`window.agent`** via `agent.js` so the page can call
capabilities, run agents, read settings, and receive live data — all scoped to
the channel it's embedded in. No build step, no framework.

```html
<script src="/plugins/agent.js"></script>   <!-- sets window.agent -->
```

## The `window.agent` surface

`agent.js` sets these synchronously:

- **`agent.ctx`** = `{ branch, plugin, surface }`. `surface` ∈ `panel ·
  dashboard_widget · view · chat · modal · settings · note_embed` — adapt the
  layout (e.g. compact when `surface === "dashboard_widget"`).

- **`agent.invoke(capability, params, operation = "invoke")`** → call a
  capability. Routes through `/plugin_api/<branch>/<plugin>/invoke`, which
  **enforces** the plugin's declared `capabilities` allow-list. Returns the
  result.
  ```js
  const d = await agent.invoke("tool.stock_chart", { symbol: "TSLA" });
  ```

- **`agent.query(prompt, opts)`** → run a one-shot agent.
  ```js
  await agent.query("summarise these rows", { allowed_tools: ["knowledge"] });
  ```

- **`agent.events.subscribe(kind, cb, { tool, params, interval })`** → live data
  (below). Returns an unsubscribe function.

- **`agent.settings.get()`** → `{ values: {…} }` · **`agent.settings.set(values)`**
  · **`agent.settings.subscribe(cb)`** → fires when the user saves the settings
  form; re-read inside. *(Shipped plugins call the alias `agent.settings.onChange(cb)`
  for the same purpose — e.g. `stocks_chart`, `crypto_chart`, `clock`,
  `notebook_graph`.)*

- **Convenience wrappers** over `invoke`: `agent.files.read/write`,
  `agent.knowledge.search(q)`, `agent.notify(text)`.

### Capability scoping

`agent.invoke` only works for capabilities listed in `plugin.json` →
`capabilities`; the `/plugin_api` gate **403s** anything undeclared. External
network is *not* a capability — see below.

### Theming

The host forwards the active theme as `t_*` query params (`t_bg`, `t_fg`,
`t_panel`, `t_panel2`, `t_border`, `t_accent`, `t_accentFg`, `t_muted`). Map them
onto `--ed-*` CSS variables in an early `<script>` before the body paints; a
missing token = the default (original dark look).

### Settings — declarative, rendered by the core

Declare `settings_schema` in `plugin.json` and the **core renders the form** —
you never write settings HTML. Read with `agent.settings.get()`, live-apply with
`agent.settings.subscribe` / `.onChange`.

## Live data — `events.subscribe`

Server producers are **demand-driven**: the server calls `tool(params)` every
`interval` seconds and PUSHES the result over SSE, but only while ≥1 plugin is
subscribed (ref-counted — the last unsubscribe stops the producer). `cb` gets
the parsed payload.

```js
const off = agent.events.subscribe("price.tsla", render,
    { tool: "tool.stock_chart", params: { symbol: "TSLA" }, interval: 60 });
// later: off();   // stop (frees the server producer if last)
```

## Data & network — use a Python `@tool`, NOT browser fetch

Browser CORS blocks many hosts (e.g. Yahoo Finance) and would expose keys. The
standard is a **server-side Python `@tool`** doing the network, paired with a JS
plugin that renders. `stocks_chart` / `crypto_chart` are the canonical
examples — let's build one end to end.

## Worked example — a plugin on an existing tool

A complete `@tool` + plugin **pair**: a Python tool fetches a stock close-price
series server-side, a JS plugin renders it live and is configured via the
core-rendered settings form.

### 1. The `@tool` — `scripts/stock_chart.py`

Server-side network (no CORS, set a UA), normalised output:

```python
from agent_sdk import tool
import json

@tool("stock_chart", "Close-price series for a stock ticker",
      {"symbol": str, "range": str, "interval": str})
def stock_chart(args):
    sym = (args.get("symbol") or "TSLA").upper()
    rng = args.get("range") or "1mo"
    iv  = args.get("interval") or "1d"
    url = (f"https://query1.finance.yahoo.com/v8/finance/chart/{sym}"
           f"?interval={iv}&range={rng}")
    # GG.http is server-side: no CORS, and we can set a browser UA.
    r = GG.http.get(url, headers={"User-Agent": "Mozilla/5.0"})
    res = ((r.json().get("chart") or {}).get("result") or [None])[0]
    if not res:                       # bad symbol → graceful card, no crash
        return {"content": [{"type": "text", "text": json.dumps({"error": f"{sym}: no data"})}]}
    ts    = res.get("timestamp") or []
    close = (res.get("indicators", {}).get("quote") or [{}])[0].get("close") or []
    pts   = [{"t": t * 1000, "c": round(c, 2)} for t, c in zip(ts, close) if c is not None]
    meta  = res.get("meta", {})
    return {"content": [{"type": "text", "text": json.dumps({
        "symbol": sym,
        "currency": meta.get("currency", "USD"),
        "last": meta.get("regularMarketPrice", pts[-1]["c"] if pts else None),
        "points": pts,
    })}]}
```

Register it once: `discover_tools(detect_branch())` → `tool.stock_chart`. The
plugin reads the tool's payload as the parsed object inside `content[0].text`
(JSON). `agent.events.subscribe` / `agent.invoke` hand `cb` the parsed result.

### 2. The manifest — `plugin.json`

`capabilities` allow-lists the one tool; `settings_schema` is the form the core
renders:

```json
{
  "id": "stocks_chart",
  "name": "Stocks chart",
  "version": "1.0.0",
  "min_core": "0.1.0",
  "entry": "index.html",
  "contributes": { "panels": [{ "title": "Stocks chart", "w": 480, "h": 340 }] },
  "capabilities": ["tool.stock_chart"],
  "settings_schema": [
    { "key": "symbol", "label": "Ticker", "type": "text", "default": "TSLA" },
    { "key": "range",  "label": "Period", "type": "enum", "default": "1mo",
      "options": ["1d", "5d", "1mo", "3mo", "6mo", "1y"] },
    { "key": "interval", "label": "Interval", "type": "enum", "default": "1d",
      "options": ["5m", "15m", "1h", "1d", "1wk"] },
    { "key": "color", "label": "Line color", "type": "text", "default": "#44aaff" }
  ]
}
```

### 3. The renderer — `index.html`

`agent.settings.get()` for config, then `agent.events.subscribe` for the live
push. The event name is per-symbol so each ticker has its own producer.

```html
<!doctype html><html><head><meta charset="utf-8">
<script src="/cdn/npm/chart.js@4"></script>
<style>
  :root{--ed-bg:#1e1e1e;--ed-fg:#ddd;--ed-muted:#888}
  body{font:14px system-ui;margin:0;padding:12px;background:var(--ed-bg);color:var(--ed-fg);height:100vh;box-sizing:border-box}
  .head{display:flex;gap:10px;align-items:baseline} .last{font-size:20px;font-weight:600}
  #wrap{height:calc(100% - 30px)} .err{color:#e66}
</style>
<!-- map host theme params onto CSS vars before paint -->
<script>(function(){var m={t_bg:"--ed-bg",t_fg:"--ed-fg",t_muted:"--ed-muted"},p=new URLSearchParams(location.search),r=document.documentElement;
for(var k in m){var v=p.get(k);if(v&&/^[0-9a-fA-F]{3,8}$/.test(v))r.style.setProperty(m[k],"#"+v);}})();</script>
</head><body>
  <div class="head"><h2 id="sym">…</h2><span id="last" class="last">…</span><span id="cur"></span></div>
  <div id="wrap"><canvas id="c"></canvas></div>
  <script src="/plugins/agent.js"></script>
  <script>
  (async () => {
    const DEFAULTS = { symbol: "TSLA", range: "1mo", interval: "1d", color: "#44aaff" };
    let cfg = Object.assign({}, DEFAULTS), chart, unsub = null;
    const $ = (id) => document.getElementById(id);

    function render(d) {
      if (!d || !d.points) { if (d && d.error) $("last").innerHTML = `<span class="err">${d.error}</span>`; return; }
      $("sym").textContent = d.symbol; $("last").textContent = d.last; $("cur").textContent = d.currency || "";
      const labels = d.points.map(p => new Date(p.t).toLocaleDateString());
      const data   = d.points.map(p => p.c);
      if (!chart) {
        chart = new Chart($("c"), {
          type: "line",
          data: { labels, datasets: [{ data, borderColor: cfg.color, fill: false, tension: .25, pointRadius: 0 }] },
          options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } },
        });
      } else { chart.data.labels = labels; chart.data.datasets[0].data = data; chart.update(); }
    }

    function subscribe() {
      if (unsub) unsub();
      const ev = "price." + cfg.symbol.toLowerCase().replace(/[^a-z0-9]+/g, "_");
      // demand-driven SSE producer: server calls the @tool every 60s, pushes the result
      unsub = agent.events.subscribe(ev, render,
        { tool: "tool.stock_chart",
          params: { symbol: cfg.symbol, range: cfg.range, interval: cfg.interval },
          interval: 60 });
    }

    async function loadSettings() {
      let ch = {};
      try { const r = await agent.settings.get(); if (r && r.values) ch = r.values; } catch (e) {}
      cfg = Object.assign({}, DEFAULTS, ch);
      if (chart) { chart.destroy(); chart = null; }
      subscribe();   // a fresh producer pushes immediately
    }

    loadSettings();
    agent.settings.subscribe(loadSettings);   // live-apply edits from the core form (alias: .onChange)
  })();
  </script>
</body></html>
```

### One-shot variant — `agent.invoke`

If you don't need live updates, pull once instead of subscribing:

```js
const r = await agent.invoke("tool.stock_chart", { symbol: cfg.symbol, range: cfg.range });
render(JSON.parse(r.content[0].text));   // tool payload is JSON in content[0].text
```

## Test it

1. Drop `scripts/stock_chart.py` in and register the tool; drop the plugin
   folder in `plugin_registry/<id>/` → reload (live, no core restart). It then
   appears in `GET /plugins/registry`, the «+ plugin» menu, the panels picker,
   and dashboard widgets.
2. Embed it as a panel / dashboard cell / `` ```plugin <id> `` note fence;
   pass `?surface=` to preview a mode.
3. Open ⚙ to exercise `settings_schema` ↔ `agent.settings`.

## Limitations

- **Browser only** — no Node, no filesystem; reach the backend via
  `agent.invoke`, external network via a Python `@tool`.
- **Capability-scoped** — `invoke` only works for declared capabilities.
- **Same-origin iframe** — the core serves the plugin, so `agent.js` reaches the
  API with no CORS/auth dance.

For reading/writing the channel's databases with a live, normalized data layer,
pair this with [`dataview.js`](./dataview-js) (`window.DataView_`).
