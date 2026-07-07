---
id: llm-settings
title: LLM settings
sidebar_label: LLM settings
description: Pick where your models run — a bundled on-device model, a local Ollama install, or an external provider.
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# LLM settings

Piphia is a **harness** — it orchestrates agents, tools, and your notes, but it
brings **no model of its own**. You choose where the intelligence comes from. There
are three ways to run a model, and you can mix them (e.g. a small on-device model
for quick tasks, a big provider model for hard ones).

## Three ways to run a model

| Mode | Runs where | Offline? | Best for |
|---|---|---|---|
| **Bundled on-device** | Inside the app, on your CPU/GPU | ✅ Fully offline | Phones & laptops; privacy; no setup |
| **Local Ollama** | A local Ollama server (`localhost:11434`) | ✅ Fully offline | Desktops with a decent GPU/RAM; many models |
| **External provider** | A third-party API you configure | ❌ Needs internet | The largest, strongest models |

:::info Your data stays yours
On-device and local Ollama never leave your machine. With an **external provider**,
the prompts and content you send go to **that provider** under their terms — see the
[Privacy Policy](/privacy). The app never routes anything through us.
:::

**Where to find it:** open **Settings → LLM**. The model you pick there is the
default; each agent can override it (see [Per-agent model](#per-agent-model)).

---

## Option A — Ollama (desktop)

[Ollama](https://ollama.com) runs open models locally and exposes them on
`http://localhost:11434`. Recommended for desktops — it's the easiest way to run
several models fully offline.

### 1. Install Ollama

<Tabs groupId="os">
<TabItem value="mac" label="macOS">

Download the installer from [ollama.com/download](https://ollama.com/download), or:

```bash
brew install ollama
```

</TabItem>
<TabItem value="win" label="Windows">

Download and run the installer from
[ollama.com/download](https://ollama.com/download). Ollama starts automatically and
runs in the background.

</TabItem>
<TabItem value="linux" label="Linux">

```bash
curl -fsSL https://ollama.com/install.sh | sh
```

</TabItem>
</Tabs>

### 2. Make sure it's running

```bash
ollama serve        # start the server (skip if it already runs as a service)
curl http://localhost:11434/api/tags   # should return JSON, not an error
```

### 3. Pull a model

Download a model once; it's cached on disk and runs offline afterwards:

```bash
ollama pull gemma4:e4b
```

**Recommended models** — start with `gemma4:e4b` (the default), then add bigger
ones if your hardware allows:

| Model | Pull command | Size class | Notes |
|---|---|---|---|
| `gemma4:e2b` | `ollama pull gemma4:e2b` | ~2B | Smallest/fastest; fine for short tasks |
| `gemma4:e4b` | `ollama pull gemma4:e4b` | ~4–8B | **Default** — best balance for multi-step agents |
| `gemma4:27b` | `ollama pull gemma4:27b` | ~27B | High quality; needs a strong GPU / lots of RAM |
| `qwen3.6:27b` | `ollama pull qwen3.6:27b` | ~27B | Strong reasoning/coding alternative |
| `qwen3.5:9b` | `ollama pull qwen3.5:9b` | ~9B | Good mid-size middle ground |

:::tip Smaller models lose precision on long tool chains
On tasks with many tool calls, very small models (~2B) start dropping parameters.
For agent work, prefer `gemma4:e4b` or larger; keep `gemma4:e2b` for light/quick use.
:::

### 4. Select it in the app

In **Settings → LLM**, choose **Ollama**, confirm the URL is
`http://localhost:11434`, and pick a model you pulled (e.g. `gemma4:e4b`). Save —
you're ready.

---

## Option B — Bundled on-device model (mobile)

On a phone, the app can run a model **fully on-device** — no Ollama, no account, no
internet. On Android this uses **LiteRT**; the model runs against the GPU when
available and unloads when idle.

**To download one:**

1. Open **Settings → LLM → On-device models**.
2. You'll see a list of bundled models you can fetch:
   - **`gemma4:e2b`** — smaller and faster; lightest on battery and RAM.
   - **`gemma4:e4b`** — better quality; pick this if your device has the memory.
3. Tap **Download** next to the one you want. The first download pulls the model
   weights over the network once; after that it runs **offline**.
4. When it finishes, tap to **select** it as the active model. Save.

:::note Pick to fit your device
`gemma4:e2b` loads faster and uses less memory — a good first choice on most
phones. Move up to `gemma4:e4b` for better answers if the device can hold it. If
the app reports it can't load a model, free up RAM or choose the smaller one.
:::

---

## Option C — Configure an external provider (mobile & desktop)

When you want a bigger model than your device can run, point the app at an
**OpenAI-compatible** provider. This works the same on mobile and desktop.

1. Open **Settings → LLM → Provider** (or **Add provider**).
2. Fill in:
   - **Base URL** — the provider's OpenAI-compatible endpoint
     (e.g. `https://api.openai.com/v1`, `https://openrouter.ai/api/v1`, or your own).
   - **API key** — your key for that provider. It's stored locally on the device
     and sent only to that provider.
   - **Model name** — the exact model id the provider expects (e.g. `gpt-4o-mini`,
     or an OpenRouter slug).
3. Save and select the provider as the active model.

:::tip Use your desktop's Ollama from your phone
On the same network, set the Base URL to your computer's address —
`http://<your-computer-ip>:11434/v1` — to drive its Ollama models from the phone.
Make sure Ollama is reachable on your LAN (not just `localhost`).
:::

:::caution Provider terms & privacy apply
Anything you send to an external provider is processed by **them**, under **their**
privacy policy and terms — review them. All AI features are experimental; use them
at your own responsibility. See the [Privacy Policy](/privacy) and
[Terms of Use](/terms).
:::

---

## Per-agent model

The model in **Settings → LLM** is the global default. Any agent can override it —
both the model and its sampling (temperature, etc.) — from the agent's settings, so
you can run a fast small model for routine agents and a stronger one for the agents
that need it. See the [Agents guide](/docs/app-guides/agents-guide).

## Troubleshooting

- **App can't reach Ollama** — confirm `ollama serve` is running and
  `curl http://localhost:11434/api/tags` returns JSON. Check the URL in settings and
  any firewall.
- **On-device model won't load (mobile)** — close other apps to free RAM, or switch
  to the smaller `gemma4:e2b`.
- **Provider errors (401/404)** — re-check the API key, the Base URL (it must end at
  the OpenAI-compatible path, often `/v1`), and that the model name is exact.
- More in [Troubleshooting](/docs/troubleshooting).
