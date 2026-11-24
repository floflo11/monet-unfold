// Monet Canvas: the four rooms of the pop-up book, painted instead of drawn.
//
// Each surface is an image in public/monet/, already packed in the same layout that
// bake() in sketch.ts produces: rgb = the colour wash, alpha = 0 outside a cut-out,
// otherwise 0.5 + ink / 2 (a light line drawing traced from the painting). So the paper
// shader works unchanged: rooms read as drawings until they come to the front, then the
// paint washes in.
//
// Canvas conventions are the same as rooms.ts (0..1, y down):
//   left wall  – the room's corner is at x = 1, the floor at y = 1
//   right wall – the room's corner is at x = 0, the floor at y = 1
//   floor      – the corner is bottom-left; the far side of the scene points there
//   pop-ups    – a square card standing on its bottom edge
// Pop-up positions are [s, t]: s = distance along the right wall, t = along the left wall.

import type { Pt, Sketch } from "./sketch";

export type Rect = [number, number, number, number];

type MonetPopUp = { src: string; size: number; at: [number, number]; mark?: Rect };

export type MonetRoom = {
  name: string;
  /** Where "step into the painting" takes you. */
  href: string;
  left: string;
  right: string;
  floor: string;
  /** The clickable spot on the right wall, if it lives there (canvas coords). */
  rightMark?: Rect;
  popups: MonetPopUp[];
};

const SQ = Math.SQRT1_2;
/** Place a card by its depth into the room (s + t) and its sideways offset (+ = towards the right wall). */
const at = (depth: number, x: number): [number, number] => [depth / 2 + SQ * x, depth / 2 - SQ * x];

const M = "/monet/";

export const MONET_ROOMS: MonetRoom[] = [
  {
    name: "the poppy field",
    href: "https://www.monetcanvas.com/?go=poppies",
    left: `${M}poppies-left.webp`,
    right: `${M}poppies-right.webp`,
    floor: `${M}poppies-floor.webp`,
    popups: [
      { src: `${M}pop-tree.webp`, size: 0.72, at: at(0.5, -0.3) },
      { src: `${M}pop-camille.webp`, size: 0.62, at: at(0.85, 0.2), mark: [0.18, 0.02, 0.82, 1.0] },
      { src: `${M}pop-boy.webp`, size: 0.26, at: at(1.08, -0.18) },
      { src: `${M}pop-row.webp`, size: 0.72, at: at(1.45, 0) },
    ],
  },
  {
    name: "the garden",
    href: "https://www.monetcanvas.com/",
    left: `${M}garden-left.webp`,
    right: `${M}garden-right.webp`,
    floor: `${M}garden-floor.webp`,
    popups: [
      { src: `${M}pop-sunflowers.webp`, size: 0.55, at: at(0.5, 0.26) },
      { src: `${M}pop-pot1.webp`, size: 0.45, at: at(0.68, -0.3) },
      { src: `${M}pop-michel.webp`, size: 0.46, at: at(1.0, 0.02), mark: [0.21, 0.02, 0.79, 1.0] },
      { src: `${M}pop-pot2.webp`, size: 0.18, at: at(1.35, 0.24) },
    ],
  },
  {
    name: "the house",
    href: "https://www.monetcanvas.com/?go=house",
    left: `${M}house-left.webp`,
    right: `${M}house-right.webp`,
    floor: `${M}house-floor.webp`,
    rightMark: [0.293, 0.186, 0.879, 0.64],
    popups: [{ src: `${M}pop-michel-back.webp`, size: 0.36, at: at(1.0, -0.05) }],
  },
  {
    name: "the pond",
    href: "https://www.monetcanvas.com/?go=pond",
    left: `${M}pond-left.webp`,
    right: `${M}pond-right.webp`,
    floor: `${M}pond-floor.webp`,
    popups: [
      { src: `${M}pop-easels.webp`, size: 0.56, at: at(0.6, -0.14) },
      { src: `${M}pop-papa.webp`, size: 0.6, at: at(0.95, 0.24), mark: [0.31, 0.02, 0.69, 1.0] },
    ],
  },
];

export const COVER_VIGNETTE = `${M}cover-vignette.webp`;

// ---------------------------------------------------------------------------
// Covers, drawn with Dakshie's hand-drawn renderer.

function heart(s: Sketch, cx: number, cy: number, k: number) {
  const pts: Pt[] = [];
  for (let i = 0; i <= 40; i++) {
    const t = (i / 40) * Math.PI * 2.06;
    const x = 16 * Math.sin(t) ** 3;
    const y = 13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t);
    pts.push([cx + x * k, cy - y * k]);
  }
  s.stroke(pts, { w: 1.8, overshoot: 0 });
}

export function drawMonetFrontCover(s: Sketch, vignette: HTMLImageElement | null) {
  s.rect(0.07, 0.07, 0.86, 0.86, { w: 3 });
  s.text("Monet Canvas", 0.5, 0.25, 0.13);
  if (vignette) {
    s.image(vignette, 0.18, 0.37, 0.64, 0.434);
    s.ellipse(0.5, 0.587, 0.305, 0.205, { w: 2 });
  }
  s.text("a remix of unfold by Dakshie", 0.5, 0.875, 0.045, { weight: 500 });
}

export function drawMonetBackCover(s: Sketch) {
  s.rect(0.07, 0.07, 0.86, 0.86, { w: 3 });
  s.text("a remix of unfold by Dakshie", 0.5, 0.5, 0.06, { weight: 500 });
  heart(s, 0.5, 0.585, 0.0016);
}
