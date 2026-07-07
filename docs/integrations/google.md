---
sidebar_position: 1
title: Google (Gmail · Calendar · Drive)
---

# Connect Google

Hook your own Google account into the app and drive it from notes, automations and
agents: read and draft mail, list the week's events, search Drive — all with your
data staying on your machine.

**How it's different from cloud connectors.** There is no hosted middleman. You
create your *own* OAuth client in *your* Google Cloud project, the consent flow
redirects straight back to the app running on your device, and the tokens live in
the app's local key-value store. Nothing routes through our servers — and Google's
app-verification process never applies, because the "app" you authorize is your own
project (you are its owner and its only test user).

## One-time setup (≈5 minutes)

### 1. Create an OAuth client

1. Open [Google Cloud Console → Credentials](https://console.cloud.google.com/apis/credentials)
   and create a project (any name).
2. **Create credentials → OAuth client ID → Application type: Desktop app.**
3. Copy the **Client ID** and **Client secret**.

### 2. Enable the APIs

Enable the ones you plan to use (each is one click):

- [Gmail API](https://console.cloud.google.com/apis/library/gmail.googleapis.com)
- [Google Calendar API](https://console.cloud.google.com/apis/library/calendar-json.googleapis.com)
- [Google Drive API](https://console.cloud.google.com/apis/library/drive.googleapis.com)

### 3. Add yourself as a test user

On the **OAuth consent screen** page, add your own Google address under
**Test users**. That's what lets you use the client without publishing it.

### 4. Connect in the app

Open the **google** example note (or any note) and add a connect block — type
`create! connect: google` and press ▶, or pick **Google** from the `/` block
palette's API section:

````
```connect google
```
````

Press the **⚡ connect** button on the block. A window asks for the Client ID and
Client secret — they are stored in the channel's key-value store
(`integrations/google_client`), **never in the note**. A consent link appears
under the block:

> Open the link and grant access: **Connect Google**

Open it, pick your account, click **Continue** past the *"Google hasn't verified
this app"* notice (that's your own unpublished client — expected), and grant
access. When the **✓ Connected** page appears, the tokens are stored and refresh
automatically from then on.

## Use it

### From an agent

Just ask — the tools are registered automatically:

- *"show my unread email"* → `gmail_search` / `gmail_read`
- *"what's on my calendar this week?"* → `gcal_events`
- *"draft a reply to the last email from Anna"* → `gmail_send` — it creates a
  **draft**; mail is actually sent only when you explicitly say so
- *"find the quarterly report in Drive and summarise it"* → `gdrive_search` +
  `gdrive_read`

If an agent uses a strict `tools_allow.txt`, add the tools it should see
(one per line): `tool.gmail_search`, `tool.gmail_read`, `tool.gmail_send`,
`tool.gcal_events`, `tool.gcal_create`, `tool.gdrive_search`, `tool.gdrive_read`.

### From a note (▶ blocks)

The same actions are Python SDK modules:

```python
from agent_sdk.gmail import Gmail
for m in Gmail().unread(5):
    print("•", m["from"], "—", m["subject"])
```

```python
from agent_sdk.google_calendar import GoogleCalendar
for e in GoogleCalendar().events(7):
    print(e["start"], "—", e["title"])
```

```python
from agent_sdk.google_drive import GoogleDrive
for f in GoogleDrive().search("quarterly report"):
    print(f["name"], f["link"])
```

### From automations

Any `# every:` handler can call the same modules — e.g. mirror your Google
Calendar into the app's calendar db every 15 minutes, and the events appear on
the calendar grid and the analog clock dial automatically.

## GitHub too

GitHub needs no OAuth dance — a personal access token is enough:

1. Create a token at [github.com/settings/tokens](https://github.com/settings/tokens)
   (scopes: `repo`, `notifications`).
2. Add a `create! connect: github` block, press ⚡, paste the token.

Then: *"list open issues in owner/repo"* (`github_issues`), *"create an issue…"*
(`github_create_issue`), or from a ▶ block via `agent_sdk.github.GitHub()`.

## Security notes

- **Credentials and tokens never appear in notes.** They live in the local
  key-value store (`integrations/*`) — the same place LLM API keys live.
- **The consent redirect is loopback-only** (`http://127.0.0.1:<port>/oauth/callback`)
  and bound to a single-use random `state`; the code-for-tokens exchange happens
  inside the local core, not in a browser or script.
- **Draft-first mail.** `gmail_send` creates a draft unless explicitly told to
  send — an agent can't fire off email by accident.
- **Revoke anytime** from your
  [Google account permissions](https://myaccount.google.com/permissions), or
  delete the stored tokens (`integrations/google_tokens`) locally.
