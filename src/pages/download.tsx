import type {ReactNode} from 'react';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Layout from '@theme/Layout';
import Heading from '@theme/Heading';
import TextGraph from '../components/TextGraph';
import styles from './download.module.css';

type Product = {name: string; org: string; repo: string};

// `asset` = a GitHub release asset filename → the button becomes a direct,
// version-less download (releases/latest/download/<asset>, always the latest
// release). Builds without an `asset` fall back to the releases page.
type Build = {label: string; note?: string; asset?: string};
// `cli` = the terminal-UI (piphia-cli) binary for this OS, shown as a separate
// sub-section under the GUI builds. Version-less asset name, same as `builds`.
type Platform = {os: string; blurb: string; builds: Build[]; cli?: Build};

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
      'Self-contained .app — embeds the backend and a Python runtime. Native builds for Apple Silicon and Intel, plus a universal build for both.',
    builds: [
      {label: 'Apple Silicon (.dmg)', asset: 'Piphia-macos-apple-silicon.dmg'},
      {label: 'Intel (.dmg)', asset: 'Piphia-macos-intel.dmg'},
      {label: 'Universal (.dmg)', note: 'Intel + Apple Silicon', asset: 'Piphia-macos-universal.dmg'},
    ],
  },
  {
    os: 'Windows',
    blurb:
      'An installer, or a portable zip you unzip and run. Either way the backend and Python runtime live next to the app — keep the folder intact.',
    builds: [
      {label: 'Installer (.exe)', asset: 'Piphia-windows-x64-Setup.exe'},
      {label: 'Portable (.zip)', asset: 'Piphia-windows-x64-portable.zip'},
    ],
    cli: {label: 'piphia-cli.exe', asset: 'piphia-cli-win.exe'},
  },
  {
    os: 'Linux',
    blurb:
      'A .deb for Debian/Ubuntu, or a portable AppImage for any modern distro. Self-contained — app, backend, Python and the WPE WebKit webview runtime.',
    builds: [
      {label: '.deb (Debian/Ubuntu)', asset: 'Piphia-linux-amd64.deb'},
      {label: 'AppImage (portable)', asset: 'Piphia-linux-x86_64.AppImage'},
    ],
    cli: {label: 'piphia-cli', asset: 'piphia-cli-linux'},
  },
  {
    os: 'FreeBSD',
    blurb:
      'Terminal UI only — a single self-contained binary that runs the whole workspace in your shell: files, agents, databases, charts and automations. No GUI build yet.',
    builds: [],
    cli: {label: 'piphia-cli', asset: 'piphia-cli-freebsd'},
  },
];

export default function Download(): ReactNode {
  const {siteConfig} = useDocusaurusContext();
  const product = siteConfig.customFields!.product as Product;
  const releasesUrl = `https://github.com/${product.org}/${product.repo}/releases/latest`;
  const dlBase = `${releasesUrl}/download`;

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
          Desktop apps (macOS, Windows, Linux) plus the terminal UI — the CLI for
          Windows, Linux and FreeBSD — are ready below, served from GitHub Releases.
          Mobile (Android / iOS) is on the way; those buttons open the releases page.
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
                  <Link
                    key={b.label}
                    className="button button--primary button--block"
                    to={b.asset ? `${dlBase}/${b.asset}` : releasesUrl}>
                    {b.label}
                    {b.note ? <span className={styles.buildNote}> · {b.note}</span> : null}
                  </Link>
                ))}
              </div>
              {p.cli && (
                <div className={styles.cliBlock}>
                  <div className={styles.cliLabel}>Terminal · CLI</div>
                  <Link
                    className="button button--secondary button--block"
                    to={p.cli.asset ? `${dlBase}/${p.cli.asset}` : releasesUrl}>
                    {p.cli.label}
                    {p.cli.note ? (
                      <span className={styles.buildNote}> · {p.cli.note}</span>
                    ) : null}
                  </Link>
                </div>
              )}
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
