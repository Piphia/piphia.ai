---
sidebar_position: 2
title: Service catalog
---

# Connect more services

Every integration works the same way: open the **connect** example note (or
type ` ```connect <service> ` in any note), press **⚡**, paste the
credentials into the dialog. Secrets go to the app's local key-value store —
never into the note — and there is no hosted middleman: tokens live on your
machine only.

## Notion

*Protocol: integration token.*

1. Open [notion.so/my-integrations](https://www.notion.so/my-integrations) →
   **New integration** (internal), copy the secret (`ntn_…`).
2. Share the pages/databases you want reachable: page **⋯ → Connections →
   your integration**. The integration sees *only* what you share.
3. ` ```connect notion ` → ⚡ → paste the token.

Tools: `notion_search`, `notion_read`, `notion_create`. SDK:
`agent_sdk.notion` (`search / read_page / create_page`).

## Slack

*Protocol: bot token of your own Slack app.*

1. [api.slack.com/apps](https://api.slack.com/apps) → **Create New App** (from
   scratch) in your workspace.
2. **OAuth & Permissions → Bot Token Scopes**: `channels:read`,
   `channels:history`, `chat:write` → **Install to Workspace**.
3. Copy the **Bot User OAuth Token** (`xoxb-…`) → ` ```connect slack ` → ⚡.
4. Invite the bot to the channels it should read/post: `/invite @your-bot`.

Tools: `slack_channels`, `slack_history`, `slack_send`. SDK:
`agent_sdk.slack` (`channels / history / send`).

## Todoist

*Protocol: personal API token.*

1. Todoist → **Settings → Integrations → Developer → API token**.
2. ` ```connect todoist ` → ⚡ → paste it.

Tools: `todoist_tasks` (filters: `today | overdue`, `#Project`, `p1`…),
`todoist_add` (natural-language due dates), `todoist_done`. SDK:
`agent_sdk.todoist`.

## Reddit

*Protocol: OAuth (loopback), your own Reddit app.*

1. [reddit.com/prefs/apps](https://www.reddit.com/prefs/apps) → **create
   app** → type **web app** → redirect uri **exactly**
   `http://127.0.0.1:9090/oauth/callback`.
2. ` ```connect reddit ` → ⚡ → paste the client id + secret.
3. Open the consent link that appears under the block, press **Allow** — the
   ✓ page means the tokens are stored (with a refresh token; you won't be
   asked again).

Tools: `reddit_hot`, `reddit_search`. SDK: `agent_sdk.reddit`
(`hot / search / me`).

## Home Assistant

*Protocol: base URL + long-lived access token.*

1. HA → your profile → **Security → Long-lived access tokens → Create**.
2. ` ```connect hass ` → ⚡ → base URL (`http://homeassistant.local:8123`) +
   token.

Tools: `hass_states` (sensors/lights by prefix), `hass_call`
(`light.turn_on` and friends — agents act only on explicit intent). SDK:
`agent_sdk.hass`.

## Discord

*Protocol: bot token.*

1. [discord.com/developers](https://discord.com/developers/applications) →
   New Application → **Bot** → copy the token; enable the **Message
   Content** privileged intent.
2. Invite the bot: OAuth2 → URL Generator → scope `bot`, permissions
   Read/Send Messages → open the URL.
3. ` ```connect discord ` → ⚡.

Tools: `discord_channels`, `discord_history`, `discord_send`. SDK:
`agent_sdk.discord`.

## Readwise

*Protocol: access token.* One click at
[readwise.io/access_token](https://readwise.io/access_token) →
` ```connect readwise `. Tools: `readwise_highlights`, `readwise_books` —
highlight material for notes and the thought graph. SDK:
`agent_sdk.readwise`.

## Spotify

*Protocol: OAuth (loopback), your own app.*
[developer.spotify.com/dashboard](https://developer.spotify.com/dashboard) →
Create app → Redirect URI **exactly** `http://127.0.0.1:9090/oauth/callback`
→ ` ```connect spotify ` → open the consent link. Tools: `spotify_now`,
`spotify_recent`, `spotify_playlists`. SDK: `agent_sdk.spotify`.

## Hacker News & RSS — no auth

`hn_top` / `hn_search` (public HN API + Algolia) and `rss_read` (any
RSS/Atom URL) work out of the box — the zero-friction food for feeds and
ingestion automations. SDK: `agent_sdk.hn`, `agent_sdk.rss`.

## Linear · GitLab · Stripe · Bluesky · Mastodon · Mail

Same ⚡ pattern; where to get the credential:

| Service | Credential | Tools |
|---|---|---|
| **Linear** | API key — linear.app → Settings → API | `linear_issues`, `linear_create` |
| **GitLab** | Personal access token (scope `api`); self-hosted instances supported via the base-URL field | `gitlab_issues`, `gitlab_mrs` |
| **Stripe** | **Restricted read-only** key — dashboard.stripe.com/apikeys | `stripe_balance`, `stripe_payments` |
| **Bluesky** | App password — Settings → Privacy and security | `bluesky_timeline`, `bluesky_search` |
| **Mastodon** | Instance URL + token — Settings → Development → New application (scope `read`) | `mastodon_timeline` |
| **Mail (IMAP/SMTP)** | App password + IMAP/SMTP hosts — any provider (Gmail users: use the Google connector) | `mail_unread`, `mail_send` (draft-first) |

**YouTube** rides the Google connection: re-⚡ the Google block once (the
`youtube.readonly` scope was added) and `youtube_subs` works.

## Give the tools to an agent

Add the tool names to the agent's `tools_allow.txt`, e.g.:

```
tool.todoist_tasks
tool.notion_search
tool.reddit_hot
```

Then ask in chat: *“what's burning in Todoist today?”*, *“find the roadmap
page in Notion and summarize it”*, *“anything interesting on r/rust?”*.
