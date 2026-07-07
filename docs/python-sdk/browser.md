---
title: Browser
sidebar_position: 8
---

# Browser

`Browser` drives a real, interactive Chrome from Python — a thin client over the
core's `POST /browser/invoke` endpoint (which backs the `browser_live` node). It
launches a real Chrome and keeps **one** session alive on the server: every
`Browser()` is a thin handle to the same shared browser, whether you call it from
external Python, a note's ▶ block, a button, an automation or a bot. No
scene/node setup required.

The agentic loop: open a page, take a `snapshot()` (an accessibility tree where
each interactive element gets a stable `@ref`), act on a ref (or any CSS
selector), snapshot again, repeat. Every method raises `RuntimeError` with the
server's message on failure.

```python
from agent_sdk import Browser

b = Browser()
```

## Selectors

Everywhere a `selector` is taken it is **a `@ref` (or bare `eN`) from a snapshot,
OR any CSS selector**. Locator methods (`get_by_text`, `get_by_role`, …) return a
fresh `@ref`.

## API

### Low level

- `invoke(op, params=None, timeout=DEFAULT_TIMEOUT)` — run any `browser_live` op
  by name; returns the raw result dict. There is also a module-level
  `invoke(op, params=None, timeout=120)`. `DEFAULT_TIMEOUT` is 120 seconds.

### Lifecycle / navigation

- `open(url=None, headed=None)` — launch Chrome (lazily) and navigate;
  `headed=True/False` forces visible/headless.
- `navigate(url)`, `reload()`, `back()`, `forward()`, `bring_to_front()`, `close()`.

### Snapshot / inspection

- `snapshot()` → `{count, text, elements:[{ref, role, name, tag, href, value}]}`.
- `elements()` — just the snapshot's element list.
- `get_text(selector=None)`, `get_html(selector=None)`, `get_value(selector)`,
  `get_attribute(selector, name)`, `get_count(selector)`.
- `is_visible(selector)`, `is_enabled(selector)`, `is_checked(selector)`, `bounding_box(selector)`.
- `get_url()`, `get_title()`, `set_content(html)`, `frames()`, `eval(script)`.

### Interaction

- `click(selector)`, `dblclick(selector)`, `hover(selector)`, `focus(selector)`,
  `tap(selector)`, `scroll_into_view(selector)`, `highlight(selector)`.
- `fill(selector, text)` — clear an input and type.
- `type(text, selector=None, clear=False)` — type into `selector` or the focused element.
- `press(key, selector=None)`, `keydown(key)`, `keyup(key)`, `keyboard_type(text)`.
- `check(selector)`, `uncheck(selector)`, `select(selector, values)` (a string or
  list of `<option>` values/labels).
- `scroll(direction="down", amount=300, selector=None)`, `drag(source, target)`.

### Low-level mouse

- `mouse_move(x, y)`, `mouse_click(x, y, button="left")`, `mouse_down(...)`,
  `mouse_up(...)`, `wheel(x=0, y=0, dx=0, dy=100)`.

### Locators (return a fresh `@ref`)

- `get_by_role(role, name=None)`, `get_by_text(text)`, `get_by_label(text)`,
  `get_by_placeholder(text)`, `get_by_testid(value)`, `get_by_alt(text)`,
  `get_by_title(text)`.
- `ref_of(locator_result)` — pull the `ref` string out of a `get_by_*` result.

### Capture / files

- `screenshot(selector=None, full_page=False, path=None, save=None)` — `path`
  writes the PNG server-side; `save` decodes the returned base64 and writes it
  locally. Returns the result dict.
- `pdf(path=None, save=None)`, `download(path, url=None, selector=None)`,
  `upload(selector, files)` (a path or list of paths).
- `Browser.save_base64(b64, path)` (static) — decode base64 and write to a local file.

### Tabs, cookies, storage

- `tab_new(url=None)`, `tab_list()`, `tab_switch(index)`, `tab_close(index=None)`.
- `cookies_get()`, `cookies_set(cookies)`, `cookies_clear()`.
- `storage_get(kind="local")`, `storage_set(key, value, kind="local")`, `storage_clear(kind="local")`.

### Emulation & waits

- `set_viewport(width, height)`, `set_user_agent(ua)`,
  `set_geolocation(latitude, longitude)`, `set_locale(locale)`,
  `set_timezone(timezone)`, `set_offline(offline=True)`, `set_extra_headers(headers)`.
- `wait_ms(ms)`, `wait_for_selector(selector, timeout_ms=10000)`,
  `wait_for_text(text, timeout_ms=10000)`, `wait_for_url(url, timeout_ms=10000)`.

### Debug / journal

- `console_logs()`, `page_errors()`, `dialog(accept=True, text="")`, `actions()`, `report()`.

## Examples

Open a page, read the snapshot, act on `@ref`s and CSS selectors:

```python
from agent_sdk import Browser

b = Browser()
b.open("https://www.reddit.com/r/rust/")

snap = b.snapshot()                 # {count, text, elements:[{ref, role, ...}]}
print(snap["text"])                 # - link "..." [ref=e3]  - button "..." [ref=e7] ...

b.click("e7")                       # by @ref from the snapshot
b.fill("input[name=q]", "borrow checker")
b.press("Enter", selector="input[name=q]")
print(b.get_text("h1"))             # CSS selectors work too
```

Search via a locator, then capture the result:

```python
button = b.get_by_role("button", name="Search")
b.click(b.ref_of(button))

b.wait_for_selector("article")
b.screenshot(path="/tmp/page.png")                  # PNG written server-side
b.screenshot(full_page=True, save="/tmp/full.png")  # decoded + written locally

print(b.report())                   # navigations, clicks, downloads, …
b.close()
```

Generic op via the low-level wrapper (for anything not yet wrapped):

```python
from agent_sdk.browser import invoke

invoke("set_viewport", {"width": 1280, "height": 800})
```
