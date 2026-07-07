// Shared "matrix decode" text animation — the agent_console waiting effect.
//
// A ▌ cursor sweeps left→right turning the text into graph glyphs (nodes+edges)
// and, on the next pass, back into the text. Behind the cursor a comet-tail trail
// fades with distance; when the cursor reaches the end the whole gradient eases
// (settle) up to full opacity before pausing. Hold lengths are supplied as
// functions so callers can be regular (the tagline) or random (the title / the
// plugin's "mostly static, occasional rewrite" feel).
//
// Returns a cleanup function. The real text must live in the DOM / aria-label of
// the host element for SSR + screen readers; this only drives the visual.

export type DecodeClasses = {glyph: string; text: string; cursor: string};

export type DecodeOpts = {
  classes: DecodeClasses;
  glyphs?: string[];
  glyphAt?: (i: number) => string; // deterministic per-position glyph (no randomness)
  glyphClass?: (ch: string) => string | undefined; // extra per-glyph class (e.g. per-symbol colour)
  frameMs?: number; // ms per frame ≈ ms per character
  fade?: number; // opacity lost per char behind the cursor
  floor?: number; // …but never dimmer than this
  settleStep?: number; // settle progress per frame (→ fade-in duration)
  // Hold lengths in FRAMES, called fresh each cycle (so timing can be random).
  textHold?: () => number; // pause on the readable text
  graphHold?: () => number; // pause on the graph result
  initialHold?: number; // pause before the very first sweep
};

// Clean node/edge glyphs, weighted toward the horizontal ─ so it reads as a graph,
// not a "fence" — no │ / ┼ (matches the feature-card text-graphs).
const DEFAULT_GLYPHS = ['●', '●', '●', '─', '─', '─', '─', '○', '╱', '╲'];
const CURSOR = '▌';

export function matrixDecode(el: HTMLElement, text: string, opts: DecodeOpts): () => void {
  const {classes} = opts;

  // Respect prefers-reduced-motion: render the final, readable text statically.
  if (typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) {
    el.textContent = '';
    const sp = document.createElement('span');
    sp.textContent = text;
    sp.className = classes.text;
    el.appendChild(sp);
    return () => {};
  }

  const GLYPHS = opts.glyphs ?? DEFAULT_GLYPHS;
  const GLYPH_SET = new Set(GLYPHS);
  const FRAME = opts.frameMs ?? 42;
  const FADE = opts.fade ?? 0.045;
  const FLOOR = opts.floor ?? 0.45;
  const SETTLE = opts.settleStep ?? 0.07;
  const textHold = opts.textHold ?? (() => 42 + ((Math.random() * 22) | 0));
  const graphHold = opts.graphHold ?? (() => 12 + ((Math.random() * 12) | 0));

  const orig = [...text];
  const rnd = () => GLYPHS[(Math.random() * GLYPHS.length) | 0];
  // Deterministic per-position glyph when glyphAt is supplied; random pick otherwise.
  const graphChar = (i: number) => (opts.glyphAt ? opts.glyphAt(i) : rnd());
  const graphsOf = () => orig.map((c, i) => (c === ' ' ? c : graphChar(i)));

  let cur = orig.slice(); // currently displayed characters
  let target = graphsOf(); // first sweep turns text → graphs
  let toText = false; // direction of the CURRENT sweep (true = restoring text)
  let pos = 0;
  let frame = 0;
  let phase: 'sweep' | 'settle' | 'hold' = 'hold';
  let hold = opts.initialHold ?? 20;
  let settleT = 0;
  let cancelled = false;

  const trailOp = (dist: number) => Math.max(FLOOR, 1 - dist * FADE);
  const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);

  const render = (opacityFor?: (i: number) => number | undefined) => {
    el.textContent = '';
    for (let i = 0; i < cur.length; i++) {
      const sp = document.createElement('span');
      if (phase === 'sweep' && i === pos) {
        sp.textContent = CURSOR;
        sp.className = classes.cursor;
      } else {
        const ch = cur[i];
        sp.textContent = ch;
        if (GLYPH_SET.has(ch)) {
          const extra = opts.glyphClass?.(ch);
          sp.className = extra ? `${classes.glyph} ${extra}` : classes.glyph;
        } else {
          sp.className = classes.text;
        }
        const op = opacityFor?.(i);
        if (op != null) sp.style.opacity = String(op);
      }
      el.appendChild(sp);
    }
  };

  render();
  const id = setInterval(() => {
    if (cancelled) return;
    frame++;

    if (phase === 'hold') {
      if (--hold <= 0) {
        phase = 'sweep';
        pos = 0;
      }
      return;
    }

    // After the cursor reaches the end, ease the comet-tail gradient up to full
    // opacity (instead of snapping) before the hold.
    if (phase === 'settle') {
      settleT = Math.min(1, settleT + SETTLE);
      const e = easeOut(settleT);
      render((i) => {
        const start = trailOp(cur.length - i);
        return start + (1 - start) * e;
      });
      if (settleT >= 1) {
        const wasText = toText; // the sweep that just completed produced text
        hold = wasText ? textHold() : graphHold();
        toText = !toText;
        target = toText ? orig.slice() : graphsOf();
        phase = 'hold';
      }
      return;
    }

    // phase === 'sweep'
    if (pos < cur.length) {
      cur[pos] = target[pos];
      // Shimmer the not-yet-reached graphs ahead (only while restoring text).
      if (toText && frame % 2 === 0) {
        for (let i = pos + 1; i < cur.length; i++) {
          if (GLYPH_SET.has(cur[i])) cur[i] = graphChar(i);
        }
      }
      render((i) => (i < pos ? trailOp(pos - i) : undefined));
      pos++;
    } else {
      cur = target.slice();
      phase = 'settle';
      settleT = 0;
    }
  }, FRAME);

  return () => {
    cancelled = true;
    clearInterval(id);
  };
}
