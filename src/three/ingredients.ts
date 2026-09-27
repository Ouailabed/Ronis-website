import * as THREE from "three";
import { createNoise3, mulberry32 } from "./noise";
import { creamMaps, salmonMaps, type SurfaceMaps } from "./textures";

const TAU = Math.PI * 2;

/** Grid helper: builds an indexed surface from f(i/cols, j/rows) with uv = (u, v). */
function gridSurface(cols: number, rows: number, f: (u: number, v: number) => THREE.Vector3, flip = false) {
  const pos: number[] = [], uv: number[] = [], idx: number[] = [];
  for (let j = 0; j <= rows; j += 1) {
    for (let i = 0; i <= cols; i += 1) {
      const p = f(i / cols, j / rows);
      pos.push(p.x, p.y, p.z);
      uv.push(i / cols, j / rows);
    }
  }
  for (let j = 0; j < rows; j += 1) {
    for (let i = 0; i < cols; i += 1) {
      const a = j * (cols + 1) + i, b = a + 1, c = a + cols + 1, d = c + 1;
      if (flip) idx.push(a, c, b, b, c, d);
      else idx.push(a, b, c, b, d, c);
    }
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute("uv", new THREE.Float32BufferAttribute(uv, 2));
  g.setIndex(idx);
  g.computeVertexNormals();
  return g;
}

/**
 * A generous, slightly uneven layer of cream cheese that follows the ring.
 * Sits on the cut face (y = 0) of a bagel with ring radius 1.
 */
export function createCreamCheese(seed = 3, detail = 1, maps?: SurfaceMaps) {
  const n = createNoise3(seed);
  const rin = 0.66, rout = 1.44, thick = 0.1;
  const geo = gridSurface(Math.round(200 * detail), Math.round(24 * detail), (u, s) => {
    const th = u * TAU;
    const wob = n(Math.cos(th) * 2.2, Math.sin(th) * 2.2, s * 2) * 0.07;
    const r = rin - 0.03 + (rout - rin + 0.06) * s + wob * (s > 0.5 ? 1 : -0.6);
    // rounded, slightly domed profile that falls off at both edges
    const edge = Math.pow(Math.max(0, 1 - Math.pow(2 * s - 1, 6)), 0.5);
    const swirl = n(Math.cos(th) * 5, Math.sin(th) * 5, s * 6) * 0.03;
    const y = (thick + swirl) * edge + 0.012 * Math.sin(Math.PI * s);
    return new THREE.Vector3(Math.cos(th) * r, y, Math.sin(th) * r);
  });
  const tex = maps ?? creamMaps(256, seed);
  tex.map.repeat.set(4, 1);
  tex.normalMap.repeat.set(4, 1);
  tex.roughnessMap.repeat.set(4, 1);
  const mat = new THREE.MeshPhysicalMaterial({
    ...tex,
    roughness: 1,
    sheen: 0.4,
    sheenColor: new THREE.Color("#ffffff"),
    clearcoat: 0.12,
    clearcoatRoughness: 0.6,
    normalScale: new THREE.Vector2(0.9, 0.9),
  });
  const mesh = new THREE.Mesh(geo, mat);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  return {
    mesh,
    dispose: () => [geo, mat, tex.map, tex.normalMap, tex.roughnessMap].forEach((d) => d.dispose()),
  };
}

/**
 * One folded slice of smoked salmon, draped along an arc of the ring.
 * `start` = angle where the slice begins, `span` = arc length in radians.
 */
export function createSalmonSlice(seed: number, start: number, span = 1.3, detail = 1, sharedMat?: THREE.Material) {
  const rand = mulberry32(seed);
  const n = createNoise3(seed + 5);
  const folds = 2 + Math.floor(rand() * 2); // accordion folds along the slice
  const phase = rand() * 0.6;
  const width = 0.5 + rand() * 0.14;
  const lift = 0.1 + rand() * 0.06;
  const geo = gridSurface(Math.round(110 * detail), Math.round(20 * detail), (u, v) => {
    const th = start + u * span;
    const across = (v - 0.5) * width;
    // loose accordion folds: rounded crests, soft valleys
    const w = u * folds * Math.PI + phase;
    const crest = Math.pow(Math.abs(Math.sin(w)), 0.7);
    // the slice bunches in and out as it folds
    const bunch = Math.cos(w) * 0.09;
    // edges droop over the crests and flare in the valleys, like real draped fish
    const edge = Math.abs(across) / (width / 2);
    const droop = -edge * edge * crest * 0.1 + edge * edge * (1 - crest) * 0.05;
    const taper = Math.sin(Math.PI * Math.min(1, Math.max(0, u * 1.08 - 0.04)));
    const wob = n(u * 5, v * 4, seed) * 0.018;
    const r = 1.04 + across * (0.85 + 0.15 * taper) + bunch;
    const y = 0.015 + crest * lift * (0.4 + 0.6 * taper) + droop + wob;
    return new THREE.Vector3(Math.cos(th) * r, y, Math.sin(th) * r);
  });
  const mesh = new THREE.Mesh(geo, sharedMat);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  return { mesh, dispose: () => geo.dispose() };
}

export function salmonMaterial(seed = 11, maps?: SurfaceMaps) {
  const tex = maps ?? salmonMaps(512, seed);
  const mat = new THREE.MeshPhysicalMaterial({
    ...tex,
    roughness: 1,
    side: THREE.DoubleSide,
    clearcoat: 0.4,
    clearcoatRoughness: 0.35,
    sheen: 0.5,
    sheenColor: new THREE.Color("#ff9a6a"),
    sheenRoughness: 0.5,
    // a touch of glow stands in for the light scattering through the fish
    emissive: new THREE.Color("#8a2a0c"),
    emissiveIntensity: 0.18,
    normalScale: new THREE.Vector2(0.8, 0.8),
  });
  return { mat, dispose: () => [mat, tex.map, tex.normalMap, tex.roughnessMap].forEach((d) => d.dispose()) };
}

/** Round slice of something (cucumber, tomato): a short cylinder with painted faces. */
export function createSlice(kind: "cucumber" | "tomato", radius: number) {
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = 128;
  const ctx = canvas.getContext("2d")!;
  const c = 64;
  if (kind === "cucumber") {
    ctx.fillStyle = "#2f5a1c";
    ctx.beginPath(); ctx.arc(c, c, 64, 0, TAU); ctx.fill();
    ctx.fillStyle = "#cfe3a2";
    ctx.beginPath(); ctx.arc(c, c, 57, 0, TAU); ctx.fill();
    ctx.fillStyle = "#e7f1c6";
    ctx.beginPath(); ctx.arc(c, c, 30, 0, TAU); ctx.fill();
    ctx.fillStyle = "#f4f7e0";
    for (let i = 0; i < 3; i += 1) {
      const a = (i / 3) * TAU;
      ctx.beginPath(); ctx.ellipse(c + Math.cos(a) * 16, c + Math.sin(a) * 16, 8, 4, a, 0, TAU); ctx.fill();
    }
  } else {
    ctx.fillStyle = "#c8261a";
    ctx.beginPath(); ctx.arc(c, c, 64, 0, TAU); ctx.fill();
    ctx.fillStyle = "#e5432c";
    ctx.beginPath(); ctx.arc(c, c, 56, 0, TAU); ctx.fill();
    for (let i = 0; i < 4; i += 1) {
      const a = (i / 4) * TAU + 0.4;
      ctx.fillStyle = "#f07b52";
      ctx.beginPath(); ctx.ellipse(c + Math.cos(a) * 30, c + Math.sin(a) * 30, 16, 11, a, 0, TAU); ctx.fill();
      ctx.fillStyle = "#f6d27a";
      for (let s = 0; s < 4; s += 1) {
        ctx.beginPath(); ctx.ellipse(c + Math.cos(a) * (24 + s * 4), c + Math.sin(a) * (24 + s * 4) + (s % 2 ? 3 : -3), 2.5, 1.5, a, 0, TAU); ctx.fill();
      }
    }
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  const face = new THREE.MeshPhysicalMaterial({ map: tex, roughness: 0.35, clearcoat: 0.6 });
  const side = new THREE.MeshStandardMaterial({ color: kind === "cucumber" ? "#2f5a1c" : "#b8231a", roughness: 0.4 });
  const geo = new THREE.CylinderGeometry(radius, radius, radius * 0.18, 32);
  const mesh = new THREE.Mesh(geo, [side, face, face]);
  mesh.castShadow = true;
  return { mesh, dispose: () => [geo, face, side, tex].forEach((d) => d.dispose()) };
}
