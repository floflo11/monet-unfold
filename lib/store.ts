import { N } from "./fold";

/**
 * Animation state shared between the DOM controls and the 3D scene.
 * Kept outside React so dragging doesn't re-render every frame.
 * f / target are physical slots (N-1 = the room right behind the front cover).
 */
export const book = {
  f: N - 1,
  target: N - 1,
  open: 0,
  openTarget: 0,
  dragging: false,
  /** position in the day (index into SKIES, keeps counting so the light always moves on) */
  light: 1,
  lightTarget: 1,
  /** 0..1, how far the camera has moved in on a journal spot */
  zoom: 0,
  zoomTarget: 0,
  /** world position of the spot being zoomed into */
  zoomAt: [0, 0.5, 0] as [number, number, number],
};
