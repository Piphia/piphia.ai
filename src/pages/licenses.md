---
title: Open Source Licenses
description: The open-source software Piphia is built on, and their licenses.
hide_table_of_contents: false
---

# Open Source Licenses

Piphia is built on the work of the open-source community. This page lists the
notable third-party software it uses and the license each is distributed under,
with links to the source.

:::tip All permissive — no copyleft
Every notable dependency, vendored library, and bundled asset is under a
**permissive or public-domain** license (MIT · Apache-2.0 · BSD-2/3-Clause · ISC ·
SIL OFL 1.1 · CC0 · Unlicense · public domain). There are **no GPL, AGPL, LGPL,
MPL-2.0, EPL, CDDL, or SSPL** dependencies — nothing forces source disclosure.
:::

## Agent harness — adapted from Pi

Piphia's agent loop and subagent harness are adapted from the open-source **Pi
Agent Harness**.

| Project | License | Repository |
|---|---|---|
| Pi Agent Harness | MIT | https://github.com/earendil-works/pi |

## Rust — `agent_core` (Apache-2.0)

Unless noted, these crates are dual-licensed **MIT OR Apache-2.0**.

| Library | License | Repository |
|---|---|---|
| axum | MIT | https://github.com/tokio-rs/axum |
| tokio · tokio-stream · async-stream | MIT | https://github.com/tokio-rs/tokio |
| tower-http | MIT | https://github.com/tower-rs/tower-http |
| tokio-tungstenite | MIT | https://github.com/snapview/tokio-tungstenite |
| reqwest | MIT OR Apache-2.0 | https://github.com/seanmonstar/reqwest |
| futures | MIT OR Apache-2.0 | https://github.com/rust-lang/futures-rs |
| serde · serde_json | MIT OR Apache-2.0 | https://github.com/serde-rs/serde |
| toml | MIT OR Apache-2.0 | https://github.com/toml-rs/toml |
| sqlx | MIT OR Apache-2.0 | https://github.com/launchbadge/sqlx |
| chrono | MIT OR Apache-2.0 | https://github.com/chronotope/chrono |
| uuid · once_cell | MIT OR Apache-2.0 | https://github.com/uuid-rs/uuid |
| parking_lot · dashmap | MIT (OR Apache-2.0) | https://github.com/Amanieu/parking_lot |
| thiserror · anyhow · async-trait | MIT OR Apache-2.0 | https://github.com/dtolnay |
| tracing (+ subscriber, log) | MIT | https://github.com/tokio-rs/tracing |
| flutter_rust_bridge | MIT OR Apache-2.0 | https://github.com/fzyzcjy/flutter_rust_bridge |
| pyo3 | MIT OR Apache-2.0 | https://github.com/PyO3/pyo3 |
| llama-cpp-2 · llama-cpp-sys-2 | MIT OR Apache-2.0 | https://github.com/utilityai/llama-cpp-rs |
| regex · base64 · hex · log · libc | MIT OR Apache-2.0 | https://github.com/rust-lang |
| rand · argon2 · aes-gcm | MIT OR Apache-2.0 | https://github.com/RustCrypto |
| ed25519-dalek | BSD-3-Clause | https://github.com/dalek-cryptography/curve25519-dalek |
| blake3 | CC0-1.0 OR Apache-2.0 | https://github.com/BLAKE3-team/BLAKE3 |
| zstd (Rust binding) | MIT | https://github.com/gyscos/zstd-rs |
| tar · tempfile · dirs · cron | MIT OR Apache-2.0 | https://github.com/alexcrichton/tar-rs |
| notify | CC0-1.0 OR Artistic-2.0 | https://github.com/notify-rs/notify |
| encoding_rs | (Apache-2.0 OR MIT) AND BSD-3-Clause | https://github.com/hsivonen/encoding_rs |
| scraper · jsonpath-rust · urlencoding | MIT | https://github.com/causal-agent/scraper |
| csv | MIT OR Unlicense | https://github.com/BurntSushi/rust-csv |
| pdf-extract · polars · calamine | MIT | https://github.com/pola-rs/polars |
| chromiumoxide | MIT OR Apache-2.0 | https://github.com/mattsse/chromiumoxide |
| agent-browser _(browser automation for agents)_ | Apache-2.0 | https://github.com/vercel-labs/agent-browser |
| rust-embed | MIT | https://github.com/pyrossh/rust-embed |
| jni · android_logger _(Android)_ | MIT OR Apache-2.0 | https://github.com/jni-rs/jni-rs |

## Flutter / Dart

| Library | License | Repository |
|---|---|---|
| http · web_socket_channel · mime | BSD-3-Clause | https://github.com/dart-lang |
| path_provider · shared_preferences · url_launcher · flutter_markdown · cupertino_icons | BSD-3-Clause | https://github.com/flutter/packages |
| provider | MIT | https://github.com/rrousselGit/provider |
| flutter_inappwebview (+ _windows) | Apache-2.0 | https://github.com/pichillilorenzo/flutter_inappwebview |
| flutter_code_editor | Apache-2.0 | https://github.com/akvelon/flutter-code-editor |
| highlight · flutter_highlight | MIT | https://github.com/git-touch/highlight.dart |
| flutter_tts | MIT | https://github.com/dlutton/flutter_tts |
| easy_localization | MIT | https://github.com/aissat/easy_localization |
| audioplayers | MIT | https://github.com/bluefireteam/audioplayers |
| fl_chart | MIT | https://github.com/imaNNeo/fl_chart |
| flutter_map | BSD-3-Clause | https://github.com/fleaflet/flutter_map |
| latlong2 | Apache-2.0 | https://github.com/jifalops/latlong2 |
| flame · flame_forge2d · forge2d | MIT | https://github.com/flame-engine/flame |
| archive · file_picker | MIT | https://github.com/brendan-duncan/archive |

## Python

The `agent_sdk` itself depends on the **standard library only**. Other Python
components use:

| Library | License | Repository |
|---|---|---|
| httpx · uvicorn · numpy · websockets | BSD-3-Clause | https://github.com/encode/httpx |
| fastapi | MIT | https://github.com/fastapi/fastapi |
| requests | Apache-2.0 | https://github.com/psf/requests |

## JavaScript — website &amp; web assets

| Library | License | Repository |
|---|---|---|
| Docusaurus (core, preset-classic, …) | MIT | https://github.com/facebook/docusaurus |
| React · React DOM | MIT | https://github.com/facebook/react |
| @mdx-js/react | MIT | https://github.com/mdx-js/mdx |
| 3d-force-graph | MIT | https://github.com/vasturiano/3d-force-graph |
| three.js _(bundled in 3d-force-graph)_ | MIT | https://github.com/mrdoob/three.js |
| d3-force _(bundled in 3d-force-graph)_ | ISC | https://github.com/d3/d3-force |
| CodeMirror 6 (`@codemirror/*`) | MIT | https://github.com/codemirror/dev |
| Lezer parsers (`@lezer/*`) | MIT | https://github.com/lezer-parser |
| clsx · prism-react-renderer | MIT | https://github.com/lukeed/clsx |
| TypeScript _(dev)_ | Apache-2.0 | https://github.com/microsoft/TypeScript |
| terser · html-minifier-terser _(build)_ | BSD-2-Clause / MIT | https://github.com/terser/terser |

## Fonts (bundled in the editor)

| Font | License | Source |
|---|---|---|
| Inter · JetBrains Mono · Fira Code · Open Sans · Source Serif 4 | SIL OFL 1.1 | see the editor's `fonts/OFL.txt` |
| Datatype _(inline text-to-chart font)_ | SIL OFL 1.1 | https://github.com/franktisellano/datatype |
| Roboto | Apache-2.0 | https://github.com/googlefonts/roboto |

## Runtime engines

These power the app but are run/used rather than shipped as package dependencies.

| Engine | License | Repository |
|---|---|---|
| SQLite | Public domain | https://www.sqlite.org |
| Ollama | MIT | https://github.com/ollama/ollama |
| llama.cpp / ggml | MIT | https://github.com/ggml-org/llama.cpp |
| LiteRT / MediaPipe _(Android)_ | Apache-2.0 | https://github.com/google-ai-edge/LiteRT |
| Chromium _(headless, optional)_ | BSD-3-Clause &amp; others | https://www.chromium.org |

## Copyleft — none

No GPL / AGPL / LGPL / MPL-2.0 / EPL / CDDL / SSPL dependencies are used. Two items
worth a footnote (neither creates any copyleft obligation for us):

- **`notify`** — `CC0-1.0 OR Artistic-2.0`. We rely on the CC0 (public-domain)
  option; no obligation.
- **`zstd`** — the Rust binding is MIT; it wraps Facebook's zstd C library, which
  is dual-licensed **BSD-3-Clause OR GPL-2.0**. We take it under **BSD-3-Clause**,
  so no GPL terms apply — we simply retain the BSD notice.

## Attribution

What each permissive license requires when redistributing:

- **MIT · BSD-2/3-Clause · ISC** — retain the copyright notice and the license
  text. (BSD-3-Clause also means we won't use a project's name to endorse Piphia.)
- **Apache-2.0** — retain the notice and license; reproduce any upstream `NOTICE`
  file; and state that we changed any Apache-2.0 file we modified.
- **SIL OFL 1.1** (fonts) — may be bundled and redistributed freely; not sold
  standalone; Reserved Font Names not reused on modified versions. The `OFL.txt`
  ships with the app.
- **CC0 · Unlicense · public domain** (SQLite, blake3/notify/csv options) — no
  attribution required; listed here as a courtesy.

Full per-package license texts are generated for the app's in-product license
screen with the standard tooling (`cargo-bundle-licenses` for Rust,
`license-checker` for JS, Flutter's built-in license registry for Dart).

---

_If you maintain a fork or port and spot a license that needs correcting,
please let us know via [Contact &amp; Support](/support)._
