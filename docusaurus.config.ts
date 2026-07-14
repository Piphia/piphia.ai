import {themes as prismThemes} from 'prism-react-renderer';
import type {Config} from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';

// ---------------------------------------------------------------------------
// PRODUCT IDENTITY — single source of truth.
// Brand: Piphia (π·φ·α umbrella); the site is hosted at piphia.ai.
// Change the name HERE and the whole site chrome (title, navbar, footer, social)
// follows. The hero wordmark instead shows the umbrella "piphia.ai" (see
// HeroTitle). Doc/page BODY text that names the product is intentionally light;
// see site/README.md for the one find-and-replace if you rename.
// ---------------------------------------------------------------------------
const PRODUCT = {
  name: 'Piphia',
  tagline: 'A local-first notes app with built-in AI agents — your data stays on your machine',
  // GitHub coordinates (used by "Edit this page" + footer + navbar GitHub link).
  org: 'Piphia',
  repo: 'piphia.ai',
  // Public URL — Piphia lives at the umbrella domain piphia.ai (π·φ·α).
  url: 'https://piphia.ai',
  baseUrl: '/',
};

const ghTree = `https://github.com/${PRODUCT.org}/${PRODUCT.repo}/tree/main/`;

const config: Config = {
  title: PRODUCT.name,
  tagline: PRODUCT.tagline,
  favicon: 'img/favicon.svg',

  url: PRODUCT.url,
  baseUrl: PRODUCT.baseUrl,

  organizationName: PRODUCT.org,
  projectName: PRODUCT.repo,

  // v1 ships with intentional TODO links (download URLs, GitHub org). Warn, don't fail.
  onBrokenLinks: 'warn',

  i18n: {defaultLocale: 'en', locales: ['en']},

  // Expose the product identity to custom React pages (src/pages/*.tsx).
  customFields: {product: PRODUCT},

  // SEO: JSON-LD (SoftwareApplication → rich-result eligibility) plus a couple of
  // social / mobile meta tags. Absolute URLs derive from PRODUCT.url.
  headTags: [
    // The pixel/CLI theme is the DEFAULT: set <html data-pixel="on"> synchronously in
    // <head> (before the body paints, no flash). `?pixel=off` is a debug escape hatch
    // to preview the plain dark theme. Fonts are frozen in pixel.css (no picker).
    {
      tagName: 'script',
      attributes: {},
      innerHTML:
        "(function(){try{if(new URLSearchParams(location.search).get('pixel')!=='off')" +
        "document.documentElement.setAttribute('data-pixel','on');}" +
        "catch(e){document.documentElement.setAttribute('data-pixel','on');}})();",
    },
    {
      tagName: 'script',
      attributes: {type: 'application/ld+json'},
      innerHTML: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'SoftwareApplication',
        name: PRODUCT.name,
        description: PRODUCT.tagline,
        applicationCategory: 'ProductivityApplication',
        operatingSystem: 'macOS, Windows, Linux, Android, iOS',
        offers: {'@type': 'Offer', price: '0', priceCurrency: 'USD'},
        url: PRODUCT.url,
        image: `${PRODUCT.url}/img/social-card.png`,
        author: {'@type': 'Organization', name: PRODUCT.name},
      }),
    },
    {tagName: 'meta', attributes: {name: 'theme-color', content: '#262626'}},
    {tagName: 'meta', attributes: {property: 'og:site_name', content: PRODUCT.name}},
  ],

  // .md → CommonMark, .mdx → MDX. Keeps plain docs free of JSX/expression
  // parsing (so `<iframe>`, `{params}`, angle-bracket placeholders are safe).
  markdown: {
    format: 'detect',
    hooks: {onBrokenMarkdownLinks: 'warn'},
  },

  presets: [
    [
      'classic',
      {
        docs: {
          sidebarPath: './sidebars.ts',
          editUrl: ghTree,
        },
        blog: {
          showReadingTime: true,
          blogTitle: `${PRODUCT.name} blog`,
          blogDescription: `Release notes and updates for ${PRODUCT.name}`,
          editUrl: ghTree,
          feedOptions: {type: ['rss', 'atom'], xslt: true},
        },
        theme: {
          customCss: ['./src/css/custom.css', './src/css/pixel.css'],
        },
      } satisfies Preset.Options,
    ],
  ],

  // Offline full-text search (no Algolia / external calls — fits local-first).
  // Builds a client-side index at build time; active in `npm run build` + serve.
  themes: [
    [
      '@easyops-cn/docusaurus-search-local',
      {hashed: true, indexBlog: true, docsRouteBasePath: '/docs'},
    ],
  ],

  themeConfig: {
    // 1200×630 social/OG card (PNG — SVG doesn't render as a preview on X/Slack/etc.).
    image: 'img/social-card.png',
    // Light theme is HIDDEN (not removed): force dark + drop the navbar switch. The
    // pixel/CLI theme (below) then layers on top. The light CSS in custom.css stays
    // for an easy revert — flip disableSwitch back to false to expose it again.
    colorMode: {defaultMode: 'dark', disableSwitch: true, respectPrefersColorScheme: false},
    announcementBar: {
      id: 'preview_v0_1',
      content: `${PRODUCT.name} is in <strong>public preview (v0.1)</strong> — all features are experimental. See the <a href="/changelog">changelog</a>.`,
      // Light-theme appearance (indigo, = the light Download button). Dark theme is
      // re-tinted to the #6c99bb Download accent in custom.css (see announcement bar).
      backgroundColor: '#4355b9',
      textColor: '#ffffff',
      isCloseable: true,
    },
    navbar: {
      title: PRODUCT.name,
      logo: {alt: `${PRODUCT.name} logo`, src: 'img/logo.svg', srcDark: 'img/logo-dark.svg'},
      items: [
        {type: 'docSidebar', sidebarId: 'docsSidebar', position: 'left', label: 'Docs'},
        {to: '/download', label: 'Download', position: 'left'},
        {to: '/docs/python-sdk/quickstart', label: 'Python SDK', position: 'left'},
        {to: '/docs/plugins-sdk/overview', label: 'Plugin SDK (JS)', position: 'left'},
        // GitHub link lives in the footer; keep the navbar lean.
      ],
    },
    footer: {
      style: 'dark',
      links: [
        {
          title: 'Docs',
          items: [
            {label: 'Quick Start', to: '/docs/quick-start'},
            {label: 'App Guide', to: '/docs/app-guides/start-guide'},
            {label: 'Python SDK', to: '/docs/python-sdk/quickstart'},
            {label: 'Plugin SDK (JS)', to: '/docs/plugins-sdk/overview'},
          ],
        },
        {
          title: 'Product',
          items: [
            {label: 'Download', to: '/download'},
            {label: 'Changelog', to: '/changelog'},
            {label: 'Blog', to: '/blog'},
          ],
        },
        {
          title: 'More',
          items: [
            {label: 'GitHub', href: `https://github.com/${PRODUCT.org}/${PRODUCT.repo}`},
            {label: 'Troubleshooting', to: '/docs/troubleshooting'},
            {label: 'Contact Support', to: '/support'},
          ],
        },
        {
          title: 'Legal',
          items: [
            {label: 'Privacy Policy', to: '/privacy'},
            {label: 'Terms of Use', to: '/terms'},
            {label: 'Open Source Licenses', to: '/licenses'},
          ],
        },
      ],
      copyright: `© ${new Date().getFullYear()} Piphia. Local-first, your data stays yours.`,
    },
    prism: {
      theme: prismThemes.github,
      // vsDark (neutral #1e1e1e) over dracula's purple — matches "Minimal Dark".
      darkTheme: prismThemes.vsDark,
      additionalLanguages: ['bash', 'python', 'json', 'toml', 'dart', 'rust'],
    },
  } satisfies Preset.ThemeConfig,
};

export default config;
