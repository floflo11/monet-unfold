import * as THREE from "three";
import { bake } from "./sketch";
import { COVER_VIGNETTE, MONET_ROOMS, drawMonetBackCover, drawMonetFrontCover, type Rect } from "./monet";

type RoomTextures = { left: THREE.Texture; right: THREE.Texture; floor: THREE.Texture; popups: THREE.Texture[] };
export type BookTextures = { rooms: RoomTextures[]; front: THREE.Texture; back: THREE.Texture };

const WALL = 1024;

/**
 * Painted surfaces are image files already packed like bake()'s output
 * (rgb = wash, alpha = cut-out mask + ink), so they load straight into textures.
 */
function loadPacked(url: string, marks: Record<string, Rect> = {}): Promise<THREE.Texture> {
  return new Promise((resolve, reject) => {
    new THREE.TextureLoader().load(
      url,
      (tex) => {
        tex.userData.marks = marks;
        tex.premultiplyAlpha = false;
        tex.generateMipmaps = true;
        tex.minFilter = THREE.LinearMipmapLinearFilter;
        tex.magFilter = THREE.LinearFilter;
        tex.anisotropy = 4;
        tex.needsUpdate = true;
        resolve(tex);
      },
      undefined,
      () => reject(new Error(`could not load ${url}`)),
    );
  });
}

function loadImage(url: string): Promise<HTMLImageElement | null> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
    img.src = url;
  });
}

/** Loads every surface of the book. Indexed by logical room (0 = the poppy field). */
export async function buildTextures(font: string): Promise<BookTextures> {
  const rooms = await Promise.all(
    MONET_ROOMS.map(async (room) => {
      const [left, right, floor, popups] = await Promise.all([
        loadPacked(room.left),
        loadPacked(room.right, room.rightMark ? { journal: room.rightMark } : {}),
        loadPacked(room.floor),
        Promise.all(room.popups.map((p) => loadPacked(p.src, p.mark ? { journal: p.mark } : {}))),
      ]);
      return { left, right, floor, popups };
    }),
  );
  const vignette = await loadImage(COVER_VIGNETTE);
  return {
    rooms,
    front: bake(WALL, 7, font, true, (s) => drawMonetFrontCover(s, vignette)),
    back: bake(WALL, 8, font, true, drawMonetBackCover),
  };
}
