import {useEffect, useRef} from 'react';
import Heading from '@theme/Heading';
import {matrixDecode} from '../matrixDecode';
import styles from './styles.module.css';

// The hero wordmark "piphia.ai". Deterministically it dissolves into the brand's
// own formula — π + φ + α (pi · phi · alpha), the three roots the name is built
// from. Both strings are exactly 9 cells, so each position morphs in place:
//   p i p h i a . a i   ↔   π _ + _ φ _ + _ α   (monospace keeps the cells aligned)
// No randomness: a fixed per-position map on a steady beat.
const BRAND_GLYPHS = ['π', 'φ', 'α', '+']; // accent-styled chars of the formula
const FORMULA = [...'π + φ + α']; // 9 cells, position-aligned with "piphia.ai"

export default function HeroTitle({
  title,
  className,
}: {
  title: string;
  className?: string;
}): React.JSX.Element {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (!ref.current) return;
    return matrixDecode(ref.current, title, {
      classes: {glyph: styles.glyph, text: styles.text, cursor: styles.cursor},
      glyphs: BRAND_GLYPHS,
      glyphAt: (i) => FORMULA[i] ?? '·', // → π + φ + α, deterministic per position
      // Each constant gets its own hue (π blue · φ gold · α green); + stays dim.
      glyphClass: (ch) =>
        ({'π': styles.pi, 'φ': styles.phi, 'α': styles.alpha, '+': styles.op})[ch],
      frameMs: 60, // the plugin's cadence
      textHold: () => 90, // ~5.4 s readable on "piphia.ai"
      graphHold: () => 42, // ~2.5 s on the formula — long enough to read π + φ + α
      initialHold: 30,
    });
  }, [title]);

  return (
    <Heading as="h1" className={className}>
      <span ref={ref} className={styles.head} aria-label={title}>
        {title}
      </span>
    </Heading>
  );
}
