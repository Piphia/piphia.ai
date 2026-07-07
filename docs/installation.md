---
sidebar_position: 2
title: Installation
---

# Installation

The app ships as a **self-contained desktop bundle** (or a mobile build). Each
desktop bundle carries its own backend (`agent_core`) and a bundled Python
runtime, so there's nothing else to install to get started — no system Python, no
separate server.

:::note Download links
Release binaries are published on GitHub Releases. The exact URLs land on the
[Download](/download) page; the per-OS steps below assume you've downloaded the
build for your platform.
:::

## macOS

1. Download the `.app` (Apple Silicon by default; a universal build that also
   runs on Intel Macs is available).
2. Move it to **Applications** and launch it.
3. On first launch macOS Gatekeeper may warn about an unsigned/ad-hoc build —
   right-click the app → **Open** to allow it.

The `.app` is fully self-contained: it embeds `agent_core` and a relocatable
CPython, seeds your workspace on first run, and spawns its own backend.

## Windows

1. Download and unzip the Windows bundle.
2. Run the app executable in the unzipped folder (keep the folder intact — the
   backend and Python runtime live next to it).

## Linux

1. Download and unpack the Linux bundle.
2. Run the app binary inside `bundle/`:

   ```bash
   ./bundle/<app>
   ```

The bundle contains the app, `agent_core`, and a bundled `python/` runtime.
WebView support uses WPE WebKit — install your distro's WPE WebKit runtime if the
app reports a missing webview.

## Mobile (Android / iOS)

Install the mobile build for your platform. On mobile the backend runs
**in-process** (no separate server), so the experience is the same with nothing
extra to install.

## First run

On first launch the app:

1. seeds your workspace (notes, templates, the default agent),
2. starts/uses the backend on `http://127.0.0.1:9090`,
3. opens the editor.

Everything is local — your notes are markdown files in the workspace and
structured data is local SQLite.

## Enabling local AI models

The AI features run on **local models** by default, so they work offline. The
quickest path is [Ollama](https://ollama.com):

```bash
# install Ollama (see ollama.com), then pull a model:
ollama pull qwen3.6:27b      # or any model you prefer
```

The app talks to Ollama on its default port. A **bundled** provider is also
available, and if you'd rather use a hosted model you can point the app at any
**OpenAI-compatible** endpoint in settings. Pick the provider and model in the
app's model/settings screen.

## Next

- [Quick start](./quick-start.md) — your first 10 minutes.
- [Troubleshooting](./troubleshooting.md) — if something doesn't come up.
