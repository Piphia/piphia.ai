import {useEffect, useRef} from 'react';
import {matrixDecode} from '../matrixDecode';
import styles from './styles.module.css';

// The hero tagline, animated with the shared matrix-decode (agent_console's
// "waiting" effect): text → little text-graphs → back to text, on a steady cycle.
// The real text stays in the DOM + aria-label for SSR / SEO / screen readers.
export default function HeroTagline({text}: {text: string}): React.JSX.Element {
  const ref = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    if (!ref.current) return;
    return matrixDecode(ref.current, text, {
      classes: {glyph: styles.glyph, text: styles.text, cursor: styles.cursor},
    });
  }, [text]);

  return (
    <p ref={ref} className={styles.tagline} aria-label={text}>
      {text}
    </p>
  );
}
