---
title: Privacy Policy
description: How Piphia handles your data — in short, it doesn't collect any.
hide_table_of_contents: false
---

# Privacy Policy

_Last updated: 7 July 2026_

Piphia Notes: Local-First AI (the **"App"**) is a **local-first** application. This policy explains how
the App handles your data. In short: **it doesn't collect any.**

## TL;DR

- The App runs **entirely on your device**.
- We **do not collect, store, transmit, or sell** any personal data.
- The App makes **no network calls to us** or to any service we operate — we have
  no servers in the loop.
- The **only** outbound connections the App makes are to **AI model providers that
  _you_ configure yourself** (e.g. a local Ollama instance, or a third-party API
  for which you supply your own key).

## 1. Information we collect

**None.** The App has **no accounts, no sign-up, no telemetry, no analytics, no
crash reporting, and no tracking** of any kind. We, the developers, receive
nothing about you, your device, or how you use the App.

## 2. Where your data lives

Everything you create — your notes (plain markdown files), structured data (local
SQLite databases), settings, and agent memory — is stored **locally on your
device**. It is never uploaded to us and never leaves your machine unless you
explicitly send it to a provider you configured (see §3). You own your data and
can move, back up, or delete the files at any time.

## 3. Network activity

The App does **not** communicate with any server operated by us. The only network
requests it can make are to **AI model providers that you choose and configure**:

- A **local** model runtime on your own machine (e.g. Ollama). This stays on your
  device — nothing leaves it.
- Optionally, a **third-party AI provider** (e.g. OpenAI, Anthropic, OpenRouter,
  or any compatible endpoint) **only if** you enter an API key and choose to use
  it. In that case, the prompts and content you send go directly to **that
  provider**, governed by **their** privacy policy and terms — not ours. You are
  responsible for reviewing the provider's terms before using it.

We do **not** proxy, intercept, log, or receive any of that traffic.

## 4. Device permissions (mobile)

The mobile App requests a few Android permissions. **Every one of them is used
only on your device**; none of the data they touch is collected, uploaded to us,
or shared with third parties.

- **Microphone** — for voice messages and dictation. Audio is transcribed
  **on-device** by a local speech-to-text model (Whisper); **raw audio never
  leaves your phone** and is not sent to us or any provider. The microphone is
  used only while you are actively recording. Transcribed **text** is treated like
  any message you type — it is only sent onward if you send it to an AI provider
  you configured (see §3).
- **Camera** — only when you explicitly take a photo for the assistant to look at.
  Images are described by a **local** vision model on your device.
- **Approximate location** — only when you invoke a location-aware action. It is
  used **locally** (e.g. for a weather or geo-note) and never transmitted to us.
- **Notifications & downloads** — to show progress notifications and to keep a
  large on-device model download running if you leave the App (a data-sync
  foreground service). No data is collected.

Calendar events, SMS, alarms and similar actions are performed through **Android's
own pre-filled system screens that you confirm** — the App holds no calendar or
SMS read/write permission.

## 5. AI agents — important disclaimer

- The App's AI agents are an **orchestration "harness" only**. We do **not** train,
  host, or provide any AI model. **All** intelligence comes from **third-party
  models and providers** that you select and configure.
- All AI agent features are **experimental**. Outputs may be inaccurate,
  incomplete, biased, or unexpected. Agents can call tools and run automations on
  your local data — **review what they do**.
- You use the AI features **at your own risk and responsibility**. We make no
  guarantee about the behaviour, accuracy, or safety of any model output or agent
  action.

## 6. Experimental software

The App and **all** of its features are **experimental** and provided **"as is"**,
without warranty of any kind. See the [Terms of Use](/terms).

## 7. Children's privacy

Because the App collects no data and has no accounts, there is no personal
information to address here.

## 8. Changes to this policy

We may update this policy as the App evolves. The "last updated" date above
reflects the current version. Material changes will accompany an App update.

## 9. Contact

Questions about privacy? See [Contact &amp; Support](/support).

---

_This document is a plain-language summary provided for transparency and is **not
legal advice**. **[Owner / company name, address, and jurisdiction to be filled
in.]** Review with a qualified professional for your jurisdiction before relying
on it._
