---
title: Smart Chart
sidebar_position: 7
---

# Smart Chart

`SmartChart` drives the smart_chart terminal from code: tool-backed series, ad-hoc
data points, marks/drawings, alerts and watchlists. It writes the same dbs the
plugin renders (`series` / `series_data` / `chart_marks` / `chart_alerts` /
`watchlists`) through the `db` capability, so every open chart re-renders live.

```python
from agent_sdk import SmartChart

ch = SmartChart(branch)
```

## API

### Constructor

```python
SmartChart(branch=None)
```

`branch` defaults to `detect_branch()`, falling back to `"main"`.

### Series

- `series()` — all series rows (label/tool/params/active/…).
- `add_series(label, tool=None, params=None, type="line", color="", active=True, note=True)`
  — create a series and return its row id. With `tool`, the open chart's poller
  pulls points into `series_data` (history accumulates); without it the series
  just renders whatever you `point()` in. `type` ∈ `line`, `area`, `bar`,
  `scatter`, `sparkline`. `note=True` writes a passport page at
  `notes/smart_chart/series__<row>.md`.
- `remove_series(label, wipe_data=True)` — delete a series by label (its note, its
  row, and optionally its accumulated `series_data` history).
- `set_active(label, active)` — pause/resume a series' poller.
- `link_event(label, event_id)` — relate a series to a `smart_calendar` event
  (`series.events` multi_relation).

### Data points

- `point(series, value, ts=None, volume=0)` — append one `(ts, value)` point.
  `ts` defaults to now in ms.
- `points(series, limit=500)` — accumulated history of one series (oldest → newest).

### Marks / drawing

- `level(value, text="", color="#d6a23f")` — a horizontal level line.
- `zone(y1, y2, color="#3a6ea5")` — a horizontal band.
- `note_mark(value, text, ts=None, color="#dddddd")` — a text mark at a point.
- `buy(price, ts=None, text="")` / `sell(price, ts=None, text="")` — strategy ▲▼ markers.
- `clear_marks(source=None)` — remove all marks, or only those with a given `source` tag.

### Alerts

```python
alert(name, op, value, source_table="series_data", yf="value", xf="ts",
      filter_field="series", filter_value="", indicator="", period=14,
      trigger="notify", message="", agent="", prompt="", chat_id="",
      watchlist="", auto_rearm=False)
```

Arms an alert (evaluated by `scripts/smart_chart_alerts.py` every minute);
returns its row id.

- `op` — `above` / `below` / `cross_above` / `cross_below`.
- `indicator` — `''` (raw value) / `ma` / `rsi`; `period` applies to it.
- `trigger` — `notify` / `telegram` / `script` / `agent`. With `agent`, the pool
  agent's reply lands in the alert's `result` field.

Also: `alerts()` lists alert rows, `disarm(name)` sets `armed=0`.

### Watchlist

- `watch(label, src="db:series_data", x="ts", y="value", ff="series", fv=None, name="default")`
  — add an instrument to the chart's ★ watchlist strip (`fv` defaults to `label`).

## Examples

A tool-backed stock series plus drawings:

```python
from agent_sdk import SmartChart

ch = SmartChart(branch)

ch.add_series("TSLA", tool="stock_chart",
              params={"symbol": "TSLA", "range": "1mo", "interval": "1d"})

ch.level(420, text="resistance")
ch.zone(380, 400)
ch.note_mark(415, "локальный максимум")
ch.buy(412.5)
ch.sell(431.0)
```

An ad-hoc metrics series (no tool — you push points yourself):

```python
ch.add_series("CPU", type="line", note=False)
ch.point("CPU", value=42.1)
ch.point("CPU", value=37.8)

for row in ch.points("CPU"):
    print(row["ts"], row["value"])
```

Arm an RSI alert that asks an agent, and pin an instrument to the watchlist:

```python
ch.alert("rsi-low", op="below", value=30, indicator="rsi", period=14,
         trigger="agent", agent="notes",
         prompt="RSI dropped below 30 — what does it mean for the position?")

ch.watch("TSLA")
```

Link a chart series to a calendar event, then clean up:

```python
from agent_sdk import SmartCalendar

eid = SmartCalendar(branch).add("Earnings", "2026-07-23 21:00")
ch.link_event("TSLA", eid)

ch.set_active("TSLA", False)          # pause the poller
ch.clear_marks(source="sdk")          # remove only marks tagged "sdk"
ch.remove_series("CPU")               # row + note + history
```
