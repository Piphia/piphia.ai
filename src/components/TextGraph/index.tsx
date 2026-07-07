import {useEffect, useRef} from 'react';

// A small "text-graph" from the hero's glyph vocabulary (● ○ ─ ╱ ╲), weighted
// toward the horizontal ─ so it reads as a clean inline node-and-edge graph.
// Used as an animated marker on the feature cards and the download cards.

const G_NODES = ['●', '●', '○'];
const G_EDGES = ['─', '─', '─', '╱', '╲'];

// Deterministic graph per seed → SSR === first client paint (no hydration mismatch).
export function miniGraph(seed: number): string {
  let s = (seed * 2654435761 + 40503) >>> 0;
  const nx = () => ((s = (s * 1103515245 + 12345) >>> 0) >>> 8);
  const pick = (arr: string[]) => arr[nx() % arr.length];
  const flip = () => nx() % 2 === 0;
  const nodes = 2 + (nx() % 2); // 2..3 nodes
  let out = flip() ? pick(G_EDGES) : '';
  for (let i = 0; i < nodes; i++) {
    out += pick(G_NODES);
    if (i < nodes - 1) out += pick(G_EDGES);
  }
  if (flip()) out += pick(G_EDGES);
  return out;
}

// Renders the deterministic graph for SSR / first paint, then on the client it
// lives — glyphs shimmer (keeping node/edge roles) with an occasional full
// reshuffle, each instance on its own random cadence so they're desynced.
export default function TextGraph({
  seed,
  className,
}: {
  seed: number;
  className?: string;
}): React.JSX.Element {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    // Respect prefers-reduced-motion: leave the static (SSR) graph, don't animate.
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return;
    let chars = [...miniGraph(seed)];
    const roll = (c: string) => {
      const pool = G_NODES.includes(c) ? G_NODES : G_EDGES;
      return pool[(Math.random() * pool.length) | 0];
    };
    let cancelled = false;
    let timer: ReturnType<typeof setTimeout>;
    const tick = () => {
      if (cancelled) return;
      if (Math.random() < 0.1) {
        chars = [...miniGraph((Math.random() * 1e6) | 0)];
      } else {
        const i = (Math.random() * chars.length) | 0;
        chars[i] = roll(chars[i]);
      }
      el.textContent = chars.join('');
      timer = setTimeout(tick, 600 + Math.random() * 1500);
    };
    timer = setTimeout(tick, 400 + Math.random() * 1400);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [seed]);
  return (
    <div ref={ref} className={className} aria-hidden="true">
      {miniGraph(seed)}
    </div>
  );
}
