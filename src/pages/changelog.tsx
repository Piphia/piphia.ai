import type {ReactNode} from 'react';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Layout from '@theme/Layout';
import Heading from '@theme/Heading';

type Product = {name: string; org: string; repo: string};

type Release = {version: string; date: string; notes: string[]};

// Hand-maintained highlights. Full per-release notes + checksums live on GitHub
// Releases; ongoing updates are posted on the blog.
const RELEASES: Release[] = [
  {
    version: 'v0.1.0',
    date: '2026-06-20',
    notes: [
      'First public preview.',
      'Local-first markdown editor with Live Preview and runnable blocks.',
      'Notion-style databases on SQLite with views, relations and rollups.',
      'Embeddable view plugins (kanban, calendar, chart, graph).',
      'Built-in AI agents with a console, scenes and sub-agents.',
      'Python SDK for custom tools, sub-agents and automations.',
    ],
  },
];

export default function Changelog(): ReactNode {
  const {siteConfig} = useDocusaurusContext();
  const product = siteConfig.customFields!.product as Product;
  const releasesUrl = `https://github.com/${product.org}/${product.repo}/releases`;

  return (
    <Layout title="Changelog" description={`Release notes for ${siteConfig.title}`}>
      <main className="container margin-vert--lg">
        <Heading as="h1">Changelog</Heading>
        <p>
          Highlights below. Full notes and checksums are on{' '}
          <Link to={releasesUrl}>GitHub Releases</Link>; announcements are on the{' '}
          <Link to="/blog">blog</Link>.
        </p>

        {RELEASES.map((r) => (
          <div key={r.version} className="margin-top--lg">
            <Heading as="h2">
              {r.version} <small style={{color: 'var(--ifm-color-content-secondary)'}}>· {r.date}</small>
            </Heading>
            <ul>
              {r.notes.map((n, i) => (
                <li key={i}>{n}</li>
              ))}
            </ul>
          </div>
        ))}
      </main>
    </Layout>
  );
}
