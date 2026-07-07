import type {ReactNode} from 'react';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Layout from '@theme/Layout';
import Heading from '@theme/Heading';
import TextGraph from '../components/TextGraph';
import styles from './download.module.css';

type Product = {name: string; org: string; repo: string};

type Build = {label: string; note?: string};
type Platform = {os: string; blurb: string; builds: Build[]};

// Mobile first, then desktop platforms — laid out in a single horizontal row.
const PLATFORMS: Platform[] = [
  {
    os: 'Mobile',
    blurb:
      'Android and iOS. The backend runs in-process — nothing extra to install. Run a bundled on-device model, or point it at a provider.',
    builds: [
      {label: 'Android (.apk)'},
      {label: 'iOS', note: 'TestFlight / App Store'},
    ],
  },
  {
    os: 'macOS',
    blurb:
      'Self-contained .app — embeds the backend and a Python runtime. Apple Silicon by default, with an optional universal build for Intel Macs.',
    builds: [
      {label: 'Apple Silicon (.app)'},
      {label: 'Universal (.app)', note: 'Intel + Apple Silicon'},
    ],
  },
  {
    os: 'Windows',
    blurb:
      'Zipped bundle — unzip and run. Keep the folder intact: the backend and Python runtime live next to the app.',
    builds: [{label: 'Windows x64 (.zip)'}],
  },
  {
    os: 'Linux',
    blurb:
      'Self-contained bundle with the app, backend and Python. Needs a WPE WebKit runtime for the embedded webview.',
    builds: [{label: 'Linux x64 (.tar.gz)'}],
  },
];

export default function Download(): ReactNode {
  const {siteConfig} = useDocusaurusContext();
  const product = siteConfig.customFields!.product as Product;
  const releasesUrl = `https://github.com/${product.org}/${product.repo}/releases/latest`;

  return (
    <Layout title="Download" description={`Download ${siteConfig.title} for mobile, macOS, Windows and Linux`}>
      <header className={styles.head}>
        <div className="container">
          <Heading as="h1">Download {siteConfig.title}</Heading>
          <p className={styles.sub}>
            Free, local-first, and runs offline with local models. Pick your platform.
          </p>
        </div>
      </header>

      <main className="container">
        <div className={styles.note}>
          ⚠️ Release links point at the latest GitHub release. Until the first
          release is published, the buttons below open the releases page.
        </div>

        <div className={styles.grid}>
          {PLATFORMS.map((p, i) => (
            <div key={p.os} className={styles.card}>
              <TextGraph seed={i + 1} className={styles.platformGraph} />
              <Heading as="h2" className={styles.os}>
                {p.os}
              </Heading>
              <p className={styles.blurb}>{p.blurb}</p>
              <div className={styles.builds}>
                {p.builds.map((b) => (
                  <Link key={b.label} className="button button--primary button--block" to={releasesUrl}>
                    {b.label}
                    {b.note ? <span className={styles.buildNote}> · {b.note}</span> : null}
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>

        <section className={styles.after}>
          <Heading as="h3">After downloading</Heading>
          <p>
            See the <Link to="/docs/installation">installation guide</Link> for
            per-OS first-run steps, and the{' '}
            <Link to="/docs/quick-start">quick start</Link> for your first ten
            minutes. To enable AI features, set up a model in{' '}
            <Link to="/docs/app-guides/llm-settings">LLM settings</Link> — a
            bundled on-device model, a local{' '}
            <Link to="https://ollama.com">Ollama</Link> install, or a provider
            you configure.
          </p>
          <p>
            All releases and checksums are on{' '}
            <Link to={releasesUrl}>GitHub Releases</Link>.
          </p>
        </section>
      </main>
    </Layout>
  );
}
