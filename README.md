# Website

Documentation + marketing site, built with [Docusaurus](https://docusaurus.io/)
(classic preset, TypeScript) and deployed to **Cloudflare Pages**.

## Develop

```bash
cd site
npm install
npm start          # dev server with hot reload at http://localhost:3000
```

## Build

```bash
npm run build      # static site → site/build/
npm run serve      # preview the production build locally
npm run typecheck  # tsc, no emit
```

## Deploy — Cloudflare Pages

Connect the repo in the Cloudflare Pages dashboard (or `wrangler pages deploy`):

| Setting | Value |
| --- | --- |
| Framework preset | Docusaurus |
| Root directory | `site` |
| Build command | `npm run build` |
| Build output directory | `build` |
| Node version | `>= 18` (set `NODE_VERSION` if needed) |

`wrangler` one-off from `site/`:

```bash
npm run build
npx wrangler pages deploy build --project-name=<your-cf-project>
```

Set the public URL in `docusaurus.config.ts` (`PRODUCT.url`) before the first
production build so canonical/OG links are correct.

## Renaming the product

The app name isn't final. It's defined **once** in `docusaurus.config.ts`:

```ts
const PRODUCT = {
  name: 'Piphia',          // ← the brand shown across the whole site chrome
  tagline: '…',
  org: 'Piphia',           // ← GitHub org (download + edit links)
  repo: 'piphia.ai',       // ← GitHub repo
  url: 'https://piphia.ai',// ← Cloudflare Pages URL
};
```

Changing `name` updates the navbar, footer, social title, homepage hero, and the
Download/Changelog pages (they read it from `siteConfig`). A handful of doc pages
mention the product by name in prose — grep `docs/` for the old name if you want
those updated too:

```bash
grep -rl 'Notes' docs/ blog/
```

## Structure

```
site/
  docs/                 # docs (Markdown) — sidebar in sidebars.ts
    intro.md  installation.md  quick-start.md  troubleshooting.md
    app-guides/  python-sdk/  plugins/  examples/
  blog/                 # release notes / announcements
  src/
    css/custom.css      # theme (brand palette)
    pages/              # index.tsx (landing) · download.tsx · changelog.tsx
  static/img/           # logo.svg · favicon.svg
  docusaurus.config.ts  # PRODUCT identity + site config
  sidebars.ts
```

## Python API docs (later)

The docs under `docs/python-sdk/` are hand-written. For auto-generated API
reference from the `agent_sdk` docstrings, a follow-up can run
[pdoc](https://pdoc.dev/) and drop its HTML into `static/python-api/` (linked from
the Python SDK section).
