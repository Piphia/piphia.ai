import {useEffect, useState} from 'react';
import type {ReactNode} from 'react';
import styles from './styles.module.css';

// Floating dock for the pixel/CLI theme: a toggle chip + (when on) a console-font
// picker. Flips `data-pixel="on"` and `data-pixfont="<id>"` on <html> (which
// pixel.css is scoped under) and persists both to localStorage; the no-FOUC
// bootstrap in docusaurus.config.ts reads the same keys on load. Independent of
// Docusaurus' light/dark colorMode, which keeps working.
const KEY = 'piphia-pixel';
const FONT_KEY = 'piphia-pixfont';

// value '' = the default (Pixelify Sans display + Fira Code body); the rest map to
// the data-pixfont overrides in pixel.css.
const FONTS: {value: string; label: string}[] = [
  {value: '', label: 'Pixelify + Mono'},
  {value: 'cozette', label: 'Cozette'},
  {value: 'terminus', label: 'Terminus'},
  {value: 'tamzen', label: 'Tamzen'},
  {value: 'firacode', label: 'Fira Code'},
];

export default function PixelToggle(): ReactNode {
  // Start false/'' on both server and first client render (SSR match); the effect
  // then reconciles with whatever the bootstrap script already set.
  const [on, setOn] = useState(false);
  const [font, setFont] = useState('');

  useEffect(() => {
    const el = document.documentElement;
    setOn(el.getAttribute('data-pixel') === 'on');
    setFont(el.getAttribute('data-pixfont') ?? '');
  }, []);

  const toggle = () => {
    const next = !on;
    setOn(next);
    const el = document.documentElement;
    if (next) {
      el.setAttribute('data-pixel', 'on');
      try {
        localStorage.setItem(KEY, 'on');
      } catch {}
    } else {
      el.removeAttribute('data-pixel');
      try {
        localStorage.removeItem(KEY);
      } catch {}
    }
  };

  const pickFont = (v: string) => {
    setFont(v);
    const el = document.documentElement;
    if (v) {
      el.setAttribute('data-pixfont', v);
      try {
        localStorage.setItem(FONT_KEY, v);
      } catch {}
    } else {
      el.removeAttribute('data-pixfont');
      try {
        localStorage.removeItem(FONT_KEY);
      } catch {}
    }
  };

  return (
    <div className={styles.dock}>
      {on && (
        <label className={styles.fontpick}>
          <span className={styles.fontlabel}>font</span>
          <select
            className={styles.select}
            value={font}
            onChange={(e) => pickFont(e.target.value)}
            aria-label="Console font"
          >
            {FONTS.map((f) => (
              <option key={f.value || 'default'} value={f.value}>
                {f.label}
              </option>
            ))}
          </select>
        </label>
      )}
      <button
        type="button"
        className={styles.toggle}
        data-on={on ? 'true' : 'false'}
        onClick={toggle}
        aria-pressed={on}
        title={on ? 'Exit pixel / CLI theme' : 'Switch to the pixel / CLI theme'}
      >
        <span className={styles.glyph} aria-hidden="true">
          ▮
        </span>
        <span className={styles.label}>{on ? 'PIXEL·ON' : 'PIXEL'}</span>
      </button>
    </div>
  );
}
