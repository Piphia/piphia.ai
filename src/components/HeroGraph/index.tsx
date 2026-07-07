import {useEffect, useRef} from 'react';
import BrowserOnly from '@docusaurus/BrowserOnly';
import styles from './styles.module.css';

// A 3D Fibonacci-sphere "knowledge graph" for the hero — the same library
// (3d-force-graph by vasturiano) the notebook_graph plugin renders, pulled clean
// from npm. Nodes are placed by SPHERICAL PHYLLOTAXIS: the i-th point steps by
// the golden angle (≈137.5° = 360/φ²) around the sphere with its height spread
// evenly — the 3D generalisation of a sunflower (V3 alive in 3D). A central
// "core" links to every node and each node webs to its nearest neighbours; it
// auto-orbits until grabbed and re-tints on the light/dark toggle.

const GOLDEN_ANGLE = Math.PI * (3 - Math.sqrt(5)); // ≈ 2.39996 rad = 360/φ²

// Even points on a sphere via the golden angle, PINNED (fx/fy/fz) so the exact
// geometry is kept — the camera orbits it, the force engine doesn't reshape it.
function fibonacciSphere(n: number, radius: number) {
  const pts: any[] = [];
  for (let i = 0; i < n; i++) {
    const y = 1 - (i / (n - 1)) * 2; // 1 → −1, evenly
    const r = Math.sqrt(Math.max(0, 1 - y * y));
    const theta = i * GOLDEN_ANGLE;
    const p = {x: Math.cos(theta) * r * radius, y: y * radius, z: Math.sin(theta) * r * radius};
    pts.push({id: 'n' + i, ...p, fx: p.x, fy: p.y, fz: p.z, val: 3});
  }
  const core = {id: 'core', x: 0, y: 0, z: 0, fx: 0, fy: 0, fz: 0, val: 9};
  const links: any[] = pts.map((p) => ({source: 'core', target: p.id})); // spokes to the core
  const seen = new Set<string>();
  const key = (a: string, b: string) => (a < b ? `${a}|${b}` : `${b}|${a}`);
  for (let i = 0; i < n; i++) {
    const near = pts
      .map((p, j) => ({j, d: j === i ? Infinity : (p.x - pts[i].x) ** 2 + (p.y - pts[i].y) ** 2 + (p.z - pts[i].z) ** 2}))
      .sort((a, b) => a.d - b.d);
    for (let m = 0; m < 2; m++) {
      const k = key(pts[i].id, pts[near[m].j].id);
      if (!seen.has(k)) {
        seen.add(k);
        links.push({source: pts[i].id, target: pts[near[m].j].id});
      }
    }
  }
  return {nodes: [core, ...pts], links};
}

const GRAPH = fibonacciSphere(12, 86); // 12 nodes + core

function Graph3D() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    let graph: any;
    let raf = 0;
    let cancelled = false;
    let grabbed = false;
    let mo: MutationObserver | undefined;
    let onResize: (() => void) | undefined;
    const onGrab = () => {grabbed = true;};

    // Node = brand accent, link = the theme's hairline tone; both follow the
    // light/dark CSS variables so the graph matches the active theme.
    const colors = () => {
      const css = getComputedStyle(document.documentElement);
      return {
        node: css.getPropertyValue('--ifm-color-primary').trim() || '#6c99bb',
        link: css.getPropertyValue('--ifm-toc-border-color').trim() || '#3d3d3d',
      };
    };

    (async () => {
      const ForceGraph3D = (await import('3d-force-graph')).default;
      if (cancelled || !ref.current) return;
      const c = colors();

      graph = ForceGraph3D()(el)
        .graphData({
          nodes: GRAPH.nodes.map((n) => ({...n})),
          links: GRAPH.links.map((l) => ({...l})),
        })
        .cooldownTicks(0) // nodes are pre-pinned to the sphere — skip the simulation
        .backgroundColor('rgba(0,0,0,0)')
        .showNavInfo(false)
        .nodeRelSize(4)
        .nodeVal((n: any) => n.val)
        .nodeColor(() => c.node)
        .nodeOpacity(0.95)
        .linkColor(() => c.link)
        .linkWidth(1)
        .linkOpacity(0.45)
        .enableNodeDrag(false)
        .width(el.clientWidth)
        .height(el.clientHeight);

      // Gentle auto-orbit around the graph until the visitor grabs the canvas —
      // unless they prefer reduced motion, then hold a static 3/4 view (drag still works).
      const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
      let angle = 0;
      const d = 240;
      if (reduce) {
        graph.cameraPosition({x: d * Math.sin(0.6), y: 40, z: d * Math.cos(0.6)}, {x: 0, y: 0, z: 0});
      } else {
        const orbit = () => {
          if (cancelled) return;
          if (!grabbed) {
            angle += 0.0035;
            graph.cameraPosition(
              {x: d * Math.sin(angle), y: 40, z: d * Math.cos(angle)},
              {x: 0, y: 0, z: 0},
            );
          }
          raf = requestAnimationFrame(orbit);
        };
        raf = requestAnimationFrame(orbit);
      }
      el.addEventListener('pointerdown', onGrab);

      // Re-tint on the light/dark toggle (data-theme on <html>).
      mo = new MutationObserver(() => {
        const t = colors();
        graph.nodeColor(() => t.node).linkColor(() => t.link);
      });
      mo.observe(document.documentElement, {attributes: true, attributeFilter: ['data-theme']});

      onResize = () => graph.width(el.clientWidth).height(el.clientHeight);
      window.addEventListener('resize', onResize);
    })();

    return () => {
      cancelled = true;
      if (raf) cancelAnimationFrame(raf);
      if (onResize) window.removeEventListener('resize', onResize);
      el.removeEventListener('pointerdown', onGrab);
      mo?.disconnect();
      graph?._destructor?.();
    };
  }, []);

  return <div ref={ref} className={styles.graph} aria-hidden="true" />;
}

export default function HeroGraph() {
  // 3d-force-graph touches WebGL/window, so render client-side only.
  return (
    <BrowserOnly fallback={<div className={styles.graph} />}>
      {() => <Graph3D />}
    </BrowserOnly>
  );
}
