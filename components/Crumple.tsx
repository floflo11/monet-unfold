"use client";

import { useEffect, useMemo, useRef } from "react";

type Props = { rect: DOMRect; text: string; onDone: () => void };

const ease = (t: number) => 1 - Math.pow(1 - t, 3);
const clamp01 = (t: number) => Math.min(1, Math.max(0, t));

/**
 * Tearing out a page: a copy of the sheet scrunches up (its outline pulls in to a lumpy blob,
 * creases appear, it shrinks and twists), then fades away.
 */
export default function Crumple({ rect, text, onDone }: Props) {
  const ghost = useRef<HTMLDivElement>(null);
  const creases = useRef<SVGSVGElement>(null);
  const edge = useRef<SVGPolygonElement>(null);

  // outline of the sheet, walked round its edge, and the lumpy blob each point pulls in to
  const shape = useMemo(() => {
    const n = 36;
    const from: [number, number][] = [];
    const to: [number, number][] = [];
    for (let i = 0; i < n; i++) {
      const t = (i / n) * 4;
      const side = Math.floor(t);
      const f = t - side;
      const p: [number, number] = side === 0 ? [f * 100, 0] : side === 1 ? [100, f * 100] : side === 2 ? [100 - f * 100, 100] : [0, 100 - f * 100];
      from.push(p);
      const a = Math.atan2(p[1] - 50, p[0] - 50);
      const r = 26 + Math.random() * 14 * (i % 2 ? 1 : 0.55);
      to.push([50 + Math.cos(a) * r, 50 + Math.sin(a) * r]);
    }
    const lines = Array.from({ length: 16 }, () => {
      const x = 20 + Math.random() * 60;
      const y = 20 + Math.random() * 60;
      const pts = [[x, y]];
      for (let k = 0; k < 3; k++) pts.push([pts[k][0] + (Math.random() - 0.5) * 30, pts[k][1] + (Math.random() - 0.5) * 30]);
      return pts.map(([a, b]) => `${a.toFixed(1)},${b.toFixed(1)}`).join(" ");
    });
    return { from, to, lines };
  }, []);

  useEffect(() => {
    let raf = 0;
    const start = performance.now();
    const CRUMPLE = 520;
    const FADE = 380;
    const tick = (now: number) => {
      const ms = now - start;
      if (ms < CRUMPLE) {
        const t = ease(ms / CRUMPLE);
        const poly = shape.from.map(([x, y], i) => {
          const [tx, ty] = shape.to[i];
          // corners lag a little so it scrunches unevenly
          const k = clamp01(t * (1.05 + (i % 3) * 0.12) - (i % 4) * 0.03);
          return `${(x + (tx - x) * k).toFixed(2)}% ${(y + (ty - y) * k).toFixed(2)}%`;
        });
        if (edge.current) edge.current.setAttribute("points", poly.map((q) => q.replace(/%/g, "")).join(" "));
        if (ghost.current) {
          ghost.current.style.clipPath = `polygon(${poly.join(",")})`;
          ghost.current.style.transform = `scale(${1 - 0.5 * t}) rotate(${-14 * t}deg)`;
        }
        if (creases.current) creases.current.style.opacity = String(Math.min(1, t * 1.6));
      } else if (ms < CRUMPLE + FADE) {
        // stay scrunched and fade away
        const t = (ms - CRUMPLE) / FADE;
        if (ghost.current) {
          ghost.current.style.opacity = String(1 - t);
          ghost.current.style.transform = `scale(${0.5 - 0.06 * t}) rotate(${-14 - 4 * t}deg)`;
        }
      } else {
        onDone();
        return;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="crumple" aria-hidden="true">
        <div ref={ghost} className="crumple-ghost" style={{ left: rect.left, top: rect.top, width: rect.width, height: rect.height }}>
          <div className="crumple-text">{text}</div>
          <svg ref={creases} className="crumple-creases" viewBox="0 0 100 100" preserveAspectRatio="none">
            {shape.lines.map((l, i) => (
              <polyline key={i} points={l} />
            ))}
          </svg>
          <svg className="crumple-edge" viewBox="0 0 100 100" preserveAspectRatio="none">
            <polygon ref={edge} points="0,0 100,0 100,100 0,100" />
          </svg>
        </div>
    </div>
  );
}
