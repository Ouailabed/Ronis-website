import * as THREE from "three";
import * as D from "./textureData";
import type { CrustStyle, MapData } from "./textureData";

export type { CrustStyle } from "./textureData";

export type SurfaceMaps = {
  map: THREE.Texture;
  normalMap: THREE.Texture;
  roughnessMap: THREE.Texture;
};

/** Wraps raw pixel data (from the worker or computed inline) as three.js textures. */
export function toMaps(d: MapData): SurfaceMaps {
  const tex = (data: Uint8ClampedArray, srgb: boolean) => {
    const t = new THREE.DataTexture(data, d.w, d.h, THREE.RGBAFormat);
    t.wrapS = d.wrapU ? THREE.RepeatWrapping : THREE.ClampToEdgeWrapping;
    t.wrapT = d.wrapV ? THREE.RepeatWrapping : THREE.ClampToEdgeWrapping;
    t.colorSpace = srgb ? THREE.SRGBColorSpace : THREE.NoColorSpace;
    t.generateMipmaps = true;
    t.minFilter = THREE.LinearMipmapLinearFilter;
    t.magFilter = THREE.LinearFilter;
    t.anisotropy = 4;
    t.flipY = false;
    t.needsUpdate = true;
    return t;
  };
  return { map: tex(d.color, true), normalMap: tex(d.normal, false), roughnessMap: tex(d.rough, false) };
}

export const crustMaps = (size: number, seed: number, style: CrustStyle = "golden"): SurfaceMaps => toMaps(D.crustMaps(size, seed, style));
export const crumbMaps = (size: number, seed: number): SurfaceMaps => toMaps(D.crumbMaps(size, seed));
export const salmonMaps = (size: number, seed: number): SurfaceMaps => toMaps(D.salmonMaps(size, seed));
export const creamMaps = (size: number, seed: number): SurfaceMaps => toMaps(D.creamMaps(size, seed));
export const challahMaps = (size: number, seed: number): SurfaceMaps => toMaps(D.challahMaps(size, seed));
export const spongeMaps = (size: number, seed: number): SurfaceMaps => toMaps(D.spongeMaps(size, seed));
export const woodMaps = (size: number, seed: number): SurfaceMaps => toMaps(D.woodMaps(size, seed));

/* Soft contact shadow: a blurred radial gradient. */
export function shadowTexture(size = 256) {
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = size;
  const ctx = canvas.getContext("2d")!;
  const g = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  g.addColorStop(0, "rgba(46,26,10,0.55)");
  g.addColorStop(0.45, "rgba(46,26,10,0.28)");
  g.addColorStop(1, "rgba(46,26,10,0)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, size, size);
  const t = new THREE.CanvasTexture(canvas);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}
