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
import { PIECES } from "./pieces";

export type Rect = [number, number, number, number];

type Move = ["sway" | "walk" | "hop" | "drift", number, number];
type MonetPopUp = { src: string; size: number; at: [number, number]; mark?: Rect; move?: Move };

/** How each paper piece moves once its room stands open: kind, size, speed. */
const MOVES: Record<string, Move> = {
  "p-tree": ["sway", 0.012, 0.9],
  "p-pair": ["walk", 0.03, 0.5],
  "p-row1": ["sway", 0.03, 1.6],
  "p-camille": ["walk", 0.035, 0.55],
  "p-boy": ["hop", 0.02, 3.2],
  "p-row2": ["sway", 0.035, 1.9],
  "g-sun1": ["sway", 0.025, 1.1],
  "g-sun2": ["sway", 0.03, 1.3],
  "g-camille": ["sway", 0.02, 0.9],
  "g-michel": ["hop", 0.022, 3.4],
  "g-nasturtium": ["sway", 0.03, 1.7],
  "h-michel": ["walk", 0.05, 0.8],
  "w-willow1": ["sway", 0.016, 0.8],
  "w-willow2": ["sway", 0.02, 0.95],
  "w-papa": ["sway", 0.018, 1.5],
  "w-boat": ["drift", 0.05, 0.45],
  "w-irises": ["sway", 0.03, 1.5],
  "w-reeds": ["sway", 0.04, 1.8],
};

export type MonetRoom = {
  name: string;
  /** The Monet painting the room is painted after. */
  after: string;
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

/**
 * A die-cut piece, sized by how tall it should stand (in wall heights).
 * PIECES knows how much of its square card each piece fills, so `h` is the height of the drawing itself.
 */
function pop(name: keyof typeof PIECES, h: number, depth: number, x: number, clickable = false): MonetPopUp {
  const [, fh, mark] = PIECES[name];
  return { src: `${M}pop-${name}.webp`, size: h / fh, at: at(depth, x), mark: clickable ? mark : undefined, move: MOVES[name] };
}

// Pieces are listed back to front: they rise in that order when a room opens.
export const MONET_ROOMS: MonetRoom[] = [
  {
    name: "the poppy field",
    after: "Poppy Field, 1873",
    href: "https://www.monetcanvas.com/?go=poppies",
    left: `${M}poppies-left.webp`,
    right: `${M}poppies-right.webp`,
    floor: `${M}poppies-floor.webp`,
    popups: [
      pop("p-house", 0.13, 0.5, 0.16),
      pop("p-tree", 0.7, 0.56, -0.22),
      pop("p-pair", 0.15, 0.72, 0.3),
      pop("p-row1", 0.26, 0.95, -0.04),
      pop("p-camille", 0.64, 1.1, 0.2, true),
      pop("p-boy", 0.42, 1.24, -0.22),
      pop("p-row2", 0.2, 1.36, 0.02),
    ],
  },
  {
    name: "the garden",
    after: "The Artist's Garden at Vétheuil, 1881",
    href: "https://www.monetcanvas.com/",
    left: `${M}garden-left.webp`,
    right: `${M}garden-right.webp`,
    floor: `${M}garden-floor.webp`,
    popups: [
      pop("g-steps", 0.26, 0.48, 0),
      pop("g-sun1", 0.52, 0.62, -0.19),
      pop("g-sun2", 0.38, 0.76, 0.27),
      pop("g-camille", 0.62, 0.96, 0.08),
      pop("g-pot1", 0.24, 1.06, -0.33),
      pop("g-michel", 0.44, 1.2, -0.12, true),
      pop("g-pot2", 0.22, 1.3, 0.28),
      pop("g-nasturtium", 0.15, 1.5, -0.04),
    ],
  },
  {
    name: "the house",
    after: "A Corner of the Apartment, 1875",
    href: "https://www.monetcanvas.com/?go=house",
    left: `${M}house-left.webp`,
    right: `${M}house-right.webp`,
    floor: `${M}house-floor.webp`,
    popups: [
      pop("h-console", 0.38, 0.5, -0.15),
      pop("h-easel", 0.54, 0.74, 0.2, true),
      pop("h-chair1", 0.34, 0.94, -0.32),
      pop("h-table", 0.48, 1.05, -0.03),
      pop("h-chair2", 0.34, 1.16, 0.3),
      pop("h-michel", 0.42, 1.3, -0.2),
    ],
  },
  {
    name: "the pond",
    after: "Bridge over a Pond of Water Lilies, 1899",
    href: "https://www.monetcanvas.com/?go=pond",
    left: `${M}pond-left.webp`,
    right: `${M}pond-right.webp`,
    floor: `${M}pond-floor.webp`,
    popups: [
      pop("w-willow1", 0.68, 0.74, -0.2),
      pop("w-willow2", 0.5, 0.86, 0.34),
      pop("w-easels", 0.42, 1.0, 0.2),
      pop("w-papa", 0.64, 1.14, -0.25, true),
      pop("w-boat", 0.12, 1.34, 0.18),
      pop("w-irises", 0.24, 1.44, -0.16),
      pop("w-reeds", 0.18, 1.55, 0.02),
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
