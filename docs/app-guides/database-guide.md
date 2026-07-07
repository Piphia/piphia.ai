---
sidebar_position: 2
title: Databases
---

# Databases

Databases are **Notion-style tables on SQLite**, stored locally in your channel.
Each is a typed table you can view, relate, roll up, and even have an agent fill
in.

## Typed fields

A database is a set of rows over typed fields. The supported field types are:

| Type | Holds |
| --- | --- |
| `text` | free text |
| `number` | numeric value |
| `date` | a date (stored as a ms timestamp) |
| `select` | one choice from a fixed set of `choices` |
| `relation` | a link to a single row in another database |
| `multi_relation` | links to many rows in another database |
| `rollup` | an aggregate computed over a relation's targets |
| `formula` | a computed value |
| `ai` | a value produced by an agent (cached per row) |
| `python` | a value computed by Python |
| `tool` | a value produced by a capability/tool |
| `button` | an action trigger |

Computed fields (`rollup`, `formula`, `ai`, `python`, `tool`, `button`) are
derived, not stored input. They're computed at read time and **can't be written
directly** — a write to one is rejected with an explanatory error rather than
silently ignored.

## Views

A database isn't tied to one layout. The same rows can be shown through several
**views**, each surfacing a different axis of the data. The bundled view plugins:

- **kanban** — columns grouped by a `select`/status field
- **smart_calendar** — rows placed on a time axis (events, with repeat /
  reminders / triggers)
- **smart_chart** — a number plotted over time
- **notebook_graph** — the relations graph (also a 3D «Связи» mode)

You embed a view in a note with a `view` fence, or run it standalone in the
plugins dock with its own source picker (see the [table guide](./table-guide.md)).

## Relations and rollups

Connect databases with **relation** / **multi_relation** fields instead of
copying data.

- **Two-way sync.** Linking row A to row B keeps both sides consistent — if the
  target database has a relation field pointing back, it's updated in the same
  operation. Link/unlink are idempotent.
- **Backlinks are free.** For every relation elsewhere that points at this
  database, a *virtual backlink field* appears automatically: it carries the
  count and the resolved reverse links. Nothing is stored — the forward relation
  stays the single source of truth.
- **Rollups computed server-side.** A `rollup` aggregates over a relation's
  targets (SQL aggregates; multi-relation via `json_each`). Views never re-derive
  it; they receive it already computed.

When a row changes, dependent databases (those that depend on it via a relation
target or a rollup source) are notified through a bounded **dependency fan-out** —
so an automation watching one database fires when an upstream row changes its
inputs, without anyone listening to the whole workspace.

## The `ai` field

An `ai` field's value is produced by an agent and **cached per row**. Instead of
filling a cell by hand, you let the agent compute it from the rest of the row
(for example, a one-line summary, a classification, or an extracted field). It
behaves like any other computed field — read-only from the grid's point of view,
recomputed when its inputs change — but its value comes from the LLM.

## How writes propagate

Every write — whether from the grid, a view plugin, or a script — goes through one
contract and emits a `store.changed` event on the WebSocket bus. So a single edit
re-renders the grid, recomputes formulas, runs any `on_change` handlers, and
refreshes every other view of that data, all live. (A write that doesn't emit is
considered a bug.)

## See also

- [Table & dataview guide](./table-guide.md) — querying and computing over rows.
- [Agents guide](./agents-guide.md) — agents reading and writing your databases.
