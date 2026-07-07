---
title: Smart Calendar
sidebar_position: 6
---

# Smart Calendar

`SmartCalendar` creates / updates / deletes / lists events of a channel's
`smart_calendar` database from code (bots, automations, messengers) over the core
HTTP API. It is the same store the smart_calendar plugin renders and the firer
scene (`scripts/smart_calendar_firer.py`) polls every minute.

```python
from agent_sdk import SmartCalendar

cal = SmartCalendar(branch)
```

## Event model

| field | type | meaning |
| --- | --- | --- |
| `title` | str | what to show |
| `when` | int ms | due moment (epoch milliseconds) |
| `trigger` | str | one of `none`, `notify`, `telegram`, `script`, `agent` |
| `message` | str | notify/telegram text; for `script`, the `scripts/<name>.py` to run when due |
| `chat_id` | str | telegram chat (telegram trigger) |
| `source` | str | origin marker (`note` / `demo` / `sdk` / …) |
| `url` | str | optional link |
| `fired` | 0/1 | set by the firer after delivery (fires exactly once) |

`when` accepts an epoch-ms int, a `datetime`, or a `'YYYY-MM-DD [HH:MM]'` /
`'DD.MM.YYYY [HH:MM]'` string (no time → 09:00).

## API

### Constructor

```python
SmartCalendar(branch=None, base=None)
```

`branch` defaults to the calling context's channel via `detect_branch()` (raises
`ValueError` if no channel context). `base` defaults to the core base URL.

### Reads

- `events()` — every event, ordered by `when` (fired ones included).
- `upcoming(days=7)` — unfired events due within the next `days`.
- `get(event_id)` — one event row (or `None`).
- `day(date)` — events of one day; `date` is `'YYYY-MM-DD'` / `datetime` / ms.
- `result(event_id)` — the `agent` trigger's reply for an event (its `result` field).

### Writes

```python
add(title, when, trigger="notify", message=None, chat_id=None, source="sdk",
    url=None, agent=None, prompt=None, repeat=None, remind_minutes=None, note=False)
```

Creates an event and returns its `_id`. Validates `trigger`; `message` defaults to
`title`. Extra behaviours:

- `trigger='script'` — runs `scripts/<message>.py` when due (the row arrives as `_EVENT`).
- `trigger='agent'` — runs POOL agent `agent` with `prompt`; the reply lands in
  the event's `result` field. Read it back with `result(event_id)`.
- `repeat` — `'daily'` / `'weekly'` / `'monthly'` (re-arms instead of `fired=1`).
- `remind_minutes` — fire N minutes **before** `when`.
- `note=True` — also create the row page at `notes/smart_calendar/` (two-way `!ref` properties).

Other writers:

- `update(event_id, **fields)` — partial update; `when` accepts the same flexible forms.
- `reschedule(event_id, when)` — move an event and re-arm it (`fired → 0`).
- `delete(event_id)` — remove an event.
- `note_page(event_id, title=None)` — get-or-create the event's row page; returns `page_id`.

## Examples

Schedule a notification and a daily script job:

```python
from agent_sdk import SmartCalendar

cal = SmartCalendar(branch)

cal.add("Звонок клиенту", "2026-06-25 14:30")            # default trigger="notify"

cal.add("Бэкап", "2026-06-25 03:00",                     # scripts/backup_job.py daily at 03:00
        trigger="script", message="backup_job", repeat="daily")
```

Ask a POOL agent and read its answer back:

```python
eid = cal.add("Дайджест новостей", "2026-06-26 08:00",
              trigger="agent", agent="notes",
              prompt="Summarise today's saved articles in 3 bullets.")

# later, after the firer has run the agent:
print(cal.result(eid))
```

List, reschedule, and clean up:

```python
for ev in cal.upcoming(days=14):
    print(ev["title"], ev["when"])

cal.reschedule(eid, "2026-06-27 10:00")   # move + re-arm

for ev in cal.day("2026-06-20"):
    cal.delete(ev["_id"])
```

Create an event with a backing note page:

```python
eid = cal.add("Релиз v2", "2026-07-01 12:00", note=True)
page_id = cal.note_page(eid)   # notes/smart_calendar/… page id
```
