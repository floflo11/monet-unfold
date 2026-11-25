import * as THREE from "three";

const c = (r: number, g: number, b: number) => new THREE.Color(r, g, b);

/**
 * The hour the book is seen in, after Monet's series (haystacks, Rouen, the Thames): warm light
 * against blue and violet shadow, never grey. lo tints the darks, hi tints the lights.
 */
export const SKIES = [
  { name: "morning mist", lo: c(0.7, 0.8, 1.22), hi: c(1.14, 0.98, 0.94), sat: 0.9, haze: c(0.86, 0.84, 0.96), hazeAmt: 0.24, page: "rgba(206, 204, 236, 0.55)" },
  { name: "full sun", lo: c(0.78, 0.84, 1.18), hi: c(1.12, 1.05, 0.86), sat: 1.3, haze: c(1, 1, 1), hazeAmt: 0, page: "rgba(255, 255, 255, 0)" },
  { name: "sunset", lo: c(0.68, 0.46, 1.08), hi: c(1.38, 0.9, 0.5), sat: 1.35, haze: c(1.0, 0.58, 0.4), hazeAmt: 0.1, page: "rgba(246, 166, 112, 0.55)" },
  { name: "blue hour", lo: c(0.24, 0.36, 0.98), hi: c(0.98, 0.72, 0.88), sat: 1.15, haze: c(0.2, 0.25, 0.62), hazeAmt: 0.12, page: "rgba(66, 80, 150, 0.74)" },
];

/** Shared by every paper material, so one change relights the whole book. */
export const SKY = {
  uTintLo: { value: c(1, 1, 1) },
  uTintHi: { value: c(1, 1, 1) },
  uSat: { value: 1 },
  uHaze: { value: c(1, 1, 1) },
  uHazeAmt: { value: 0 },
  uTime: { value: 0 },
};

/** How much of hour i is in the light at position x (wraps round the day). */
export function skyWeight(x: number, i: number) {
  const n = SKIES.length;
  const d = Math.abs((((x - i) % n) + n) % n);
  return Math.max(0, 1 - Math.min(d, n - d));
}

/** Blend the shared light towards position x (continuous, wraps round the day). */
export function setSky(x: number) {
  const n = SKIES.length;
  const w = ((x % n) + n) % n;
  const a = SKIES[Math.floor(w) % n];
  const b = SKIES[(Math.floor(w) + 1) % n];
  const fr = w - Math.floor(w);
  SKY.uTintLo.value.copy(a.lo).lerp(b.lo, fr);
  SKY.uTintHi.value.copy(a.hi).lerp(b.hi, fr);
  SKY.uHaze.value.copy(a.haze).lerp(b.haze, fr);
  SKY.uSat.value = a.sat + (b.sat - a.sat) * fr;
  SKY.uHazeAmt.value = a.hazeAmt + (b.hazeAmt - a.hazeAmt) * fr;
}
