import type {ReactNode} from 'react';
import {useEffect, useState} from 'react';
import clsx from 'clsx';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Layout from '@theme/Layout';
import Heading from '@theme/Heading';
import HeroGraph from '../components/HeroGraph';
import HeroTitle from '../components/HeroTitle';
import HeroTagline from '../components/HeroTagline';
import TextGraph from '../components/TextGraph';
import ThemedImage from '@theme/ThemedImage';
import {useBaseUrlUtils} from '@docusaurus/useBaseUrl';
import styles from './index.module.css';

type Feature = {title: string; body: string};

// Product name is intentionally read from siteConfig (docusaurus.config.ts →
// PRODUCT) so a rename is one edit. The copy below avoids hardcoding the name.
const FEATURES: Feature[] = [
  {
    title: 'Local-first',
    body: 'Local reactive knowledge graph: plain markdown notes, with structured data in local SQLite. No accounts, no cloud lock-in — your data stays on your machine.',
  },
  {
    title: 'Built-in agents',
    body: 'Talk to AI agents that read your notes and databases, call tools, and run automations — powered by local models by default.',
  },
  {
    title: 'Databases',
    body: 'Databases on SQLite: typed fields, multiple views, relations with two-way sync, rollups, and AI-computed cells.',
  },
  {
    title: 'Plugins',
    body: 'Embed kanban boards, calendars, charts and graphs right inside a note — all live over one universal data contract.',
  },
  {
    title: 'Python SDK',
    body: 'Author custom tools, sub-agents and automations in Python. Drive your notebook and ideas graph programmatically.',
  },
  {
    title: 'Cross-platform',
    body: 'One app across macOS, Windows, Linux, Android and iOS — the same data contract everywhere.',
  },
];

function Hero() {
  const {siteConfig} = useDocusaurusContext();
  return (
    <header className={clsx('hero', styles.hero)}>
      <div className="container">
        <HeroGraph />
        {/* Umbrella brand on the hero — π+φ+α = piphia. The rest of the chrome
            (navbar/footer/titles) still follows siteConfig.title until PRODUCT.name flips. */}
        <HeroTitle title="piphia.ai" className={styles.heroTitle} />
        <HeroTagline text={siteConfig.tagline} />
        <div className={styles.heroButtons}>
          <Link className="button button--primary button--lg" to="/download">
            Download
          </Link>
          <Link className="button button--outline button--lg" to="/docs/quick-start">
            Quick Start →
          </Link>
        </div>
        <p className={styles.heroNote}>Runs offline with local models · your data stays yours</p>
      </div>
    </header>
  );
}

// The real app right under the abstract hero graph — grounds the brand moment in the
// product. A theme-aware carousel: each slide is a ThemedImage (the user captured a
// dark + light shot per scene), and the deck crossfades on a timer (pauses on hover,
// click a dot to jump). Each `key` maps to /img/screenshots/<key>-{dark,light}.webp.
// Each slide pairs a desktop shot (`key` → /img/screenshots/<key>-{dark,light}.webp)
// with a phone companion (`mobile` → /img/screenshots/m-<mobile>-{dark,light}.webp),
// overlaid bottom-right as a SEPARATE element so the layout can adapt per breakpoint.
const SHOTS = [
  {key: 'shot1', mobile: 'agent_console',  alt: 'A note with its agent chat and a live plugin'},
  {key: 'shot4', mobile: 'kg',             alt: 'Your notes as a live knowledge graph'},
  {key: 'shot5', mobile: 'table3',         alt: 'A SQLite database as a table view'},
  {key: 'shot6', mobile: 'plugins',        alt: 'Embedded views and tools inside a note'},
  {key: 'shot7', mobile: 'python',         alt: 'Python and a database together in a note'},
  {key: 'shot9', mobile: 'agents2',        alt: 'Authoring a custom tool with the Python SDK'},
  {key: 'shot8', mobile: 'tasks',          alt: 'A database view with typed fields'},
  {key: 'shot3', mobile: 'notebook_graph', alt: 'A note with an embedded graph'},
  {key: 'shot2', mobile: 'buttons',        alt: 'Calling a channel agent from a Python block'},
];

function Showcase() {
  const {withBaseUrl} = useBaseUrlUtils();
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  useEffect(() => {
    if (paused) return;
    const t = setInterval(() => setActive((a) => (a + 1) % SHOTS.length), 3000);
    return () => clearInterval(t);
  }, [paused]);
  return (
    <section className={styles.showcase}>
      <div className="container">
        <div
          className={styles.shot}
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
        >
          {SHOTS.map((s, i) => (
            <div
              key={s.key}
              className={clsx(styles.slide, i === active && styles.slideOn)}
              aria-hidden={i !== active}
            >
              <ThemedImage
                className={styles.shotImg}
                alt={s.alt}
                sources={{
                  light: withBaseUrl(`/img/screenshots/${s.key}-light.webp`),
                  dark: withBaseUrl(`/img/screenshots/${s.key}-dark.webp`),
                }}
              />
              {s.mobile && (
                <ThemedImage
                  className={styles.mobileShot}
                  alt=""
                  sources={{
                    light: withBaseUrl(`/img/screenshots/m-${s.mobile}-light.webp`),
                    dark: withBaseUrl(`/img/screenshots/m-${s.mobile}-dark.webp`),
                  }}
                />
              )}
            </div>
          ))}
          <div className={styles.dots}>
            {SHOTS.map((s, i) => (
              <button
                key={s.key}
                type="button"
                className={clsx(styles.dot, i === active && styles.dotOn)}
                aria-label={`Show screenshot ${i + 1}`}
                aria-current={i === active}
                onClick={() => setActive(i)}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function Features() {
  return (
    <section className={styles.features}>
      <div className="container">
        <div className={styles.featureGrid}>
          {FEATURES.map((f, i) => (
            <div key={f.title} className={styles.featureCard}>
              <TextGraph seed={i} className={styles.featureGraph} />
              <Heading as="h3" className={styles.featureTitle}>

                {f.title}
              </Heading>
              <p className={styles.featureBody}>{f.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

type Step = {n: string; title: string; body: string};

const STEPS: Step[] = [
  {
    n: '01',
    title: 'Write',
    body: 'Plain-markdown notes and SQLite databases live as files on your disk. You own them — move, back up, or edit them anytime.',
  },
  {
    n: '02',
    title: 'Connect',
    body: 'One universal data contract links notes, databases and embedded views (kanban, calendar, charts). Every surface stays live.',
  },
  {
    n: '03',
    title: 'Act',
    body: 'Built-in agents read your notes and data, call tools and run automations — on local models by default, fully offline.',
  },
];

function HowItWorks() {
  return (
    <section className={styles.how}>
      <div className="container">
        <Heading as="h2" className={styles.howHead}>How it works</Heading>
        <p className={styles.howSub}>
          One local graph: your notes and data as files on disk, with agents that
          act on them. Nothing leaves your machine unless you point it at a provider.
        </p>
        <div className={styles.howGrid}>
          {STEPS.map((s) => (
            <div key={s.n} className={styles.howStep}>
              <div className={styles.howNum} aria-hidden="true">{s.n}</div>
              <Heading as="h3" className={styles.howStepTitle}>{s.title}</Heading>
              <p className={styles.howStepBody}>{s.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default function Home(): ReactNode {
  const {siteConfig} = useDocusaurusContext();
  return (
    <Layout title="Local-first notes with built-in AI agents" description={String(siteConfig.tagline)}>
      <Hero />
      <main>
        <Showcase />
        <Features />
        <HowItWorks />
        <section className={styles.cta}>
          <div className="container">
            <Heading as="h2">Your notes, your data, your agents.</Heading>
            <p className={styles.ctaSub}>Get going in about ten minutes.</p>
            <div className={styles.heroButtons}>
              <Link className="button button--primary button--lg" to="/docs/quick-start">
                Read the Quick Start
              </Link>
              <Link className="button button--secondary button--lg" to="/docs/python-sdk/quickstart">
                Explore the Python SDK
              </Link>
            </div>
          </div>
        </section>
      </main>
    </Layout>
  );
}
