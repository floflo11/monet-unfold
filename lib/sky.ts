import * as THREE from "three";

/** The light the book is seen in, after Monet's habit of painting one motif at different hours. */
export const SKIES = [
  { name: "dawn", tint: new THREE.Color(1.0, 0.9, 0.9), shade: new THREE.Color(0.55, 0.45, 0.72), amt: 0.24, page: "rgba(236, 196, 206, 0.38)" },
  { name: "midday", tint: new THREE.Color(1, 1, 1), shade: new THREE.Color(0, 0, 0), amt: 0, page: "rgba(255, 255, 255, 0)" },
  { name: "sunset", tint: new THREE.Color(1.1, 0.88, 0.68), shade: new THREE.Color(0.52, 0.2, 0.4), amt: 0.26, page: "rgba(240, 178, 110, 0.42)" },
  { name: "moonlight", tint: new THREE.Color(0.44, 0.56, 0.9), shade: new THREE.Color(0.04, 0.08, 0.28), amt: 0.42, page: "rgba(96, 116, 176, 0.6)" },
];

/** Shared by every paper material, so one change relights the whole book. */
export const SKY = {
  uTint: { value: new THREE.Color(1, 1, 1) },
  uShade: { value: new THREE.Color(0, 0, 0) },
  uShadeAmt: { value: 0 },
};

/** Blend the shared light towards position x (continuous, wraps round the day). */
export function setSky(x: number) {
  const n = SKIES.length;
  const w = ((x % n) + n) % n;
  const i0 = Math.floor(w) % n;
  const i1 = (i0 + 1) % n;
  const fr = w - Math.floor(w);
  SKY.uTint.value.copy(SKIES[i0].tint).lerp(SKIES[i1].tint, fr);
  SKY.uShade.value.copy(SKIES[i0].shade).lerp(SKIES[i1].shade, fr);
  SKY.uShadeAmt.value = SKIES[i0].amt + (SKIES[i1].amt - SKIES[i0].amt) * fr;
}
