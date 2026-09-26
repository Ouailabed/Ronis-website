import { clamp, createNoise3, fbm, mix, smoothstep } from "./noise";

type RGB = [number, number, number];
const hex = (h: string): RGB => {
  const n = parseInt(h.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
};
const lerpRGB = (a: RGB, b: RGB, t: number): RGB => [mix(a[0], b[0], t), mix(a[1], b[1], t), mix(a[2], b[2], t)];
const scale = (c: RGB, k: number): RGB => [c[0] * k, c[1] * k, c[2] * k];

/** Raw RGBA pixel data for colour, normal and roughness maps (worker-friendly: no three.js). */
export type MapData = {
  w: number;
  h: number;
  wrapU: boolean;
  wrapV: boolean;
  color: Uint8ClampedArray;
  normal: Uint8ClampedArray;
  rough: Uint8ClampedArray;
};

/**
 * Builds colour, normal and roughness textures from one per-pixel function.
 * `sample(u, v)` returns colour (0-255), a height (0..1) and roughness (0..1).
 */
function buildMaps(
  w: number,
  h: number,
  sample: (u: number, v: number) => { color: RGB; height: number; rough: number },
  { wrapU = true, wrapV = true, normalStrength = 2.5 } = {},
): MapData {
  const color = new Uint8ClampedArray(w * h * 4);
  const rough = new Uint8ClampedArray(w * h * 4);
  const height = new Float32Array(w * h);
  for (let y = 0; y < h; y += 1) {
    for (let x = 0; x < w; x += 1) {
      const s = sample(x / w, y / h);
      const i = y * w + x;
      color.set([s.color[0], s.color[1], s.color[2], 255], i * 4);
      const r = clamp(s.rough) * 255;
      rough.set([r, r, r, 255], i * 4); // three reads roughness from G
      height[i] = s.height;
    }
  }
  const normal = new Uint8ClampedArray(w * h * 4);
  const at = (x: number, y: number) => {
    x = wrapU ? (x + w) % w : clamp(x, 0, w - 1);
    y = wrapV ? (y + h) % h : clamp(y, 0, h - 1);
    return height[y * w + x];
  };
  for (let y = 0; y < h; y += 1) {
    for (let x = 0; x < w; x += 1) {
      const dx = (at(x + 1, y) - at(x - 1, y)) * normalStrength;
      const dy = (at(x, y + 1) - at(x, y - 1)) * normalStrength;
      const len = Math.hypot(dx, dy, 1);
      normal.set([(-dx / len) * 127.5 + 127.5, (-dy / len) * 127.5 + 127.5, (1 / len) * 127.5 + 127.5, 255], (y * w + x) * 4);
    }
  }
  return { w, h, wrapU, wrapV, color, normal, rough };
}

/* --------------------------------------------------------------------------
 * Bagel crust. u = around the ring, v = around the tube (0.25 = top).
 * Sampled on the torus surface in 3D so the texture is seamless both ways.
 * ------------------------------------------------------------------------ */
export type CrustStyle = "golden" | "pale" | "dark";

export function crustMaps(size: number, seed: number, style: CrustStyle = "golden"): MapData {
  const n = createNoise3(seed);
  const n2 = createNoise3(seed + 101);
  const palettes: Record<CrustStyle, { top: RGB; mid: RGB; low: RGB; under: RGB }> = {
    golden: { top: hex("#5f3113"), mid: hex("#8f5424"), low: hex("#bb8144"), under: hex("#d8b075") },
    pale: { top: hex("#8a5426"), mid: hex("#ad7639"), low: hex("#cc9c5e"), under: hex("#e2c38f") },
    dark: { top: hex("#582608"), mid: hex("#874515"), low: hex("#b36d2a"), under: hex("#d3a060") },
  };
  const pal = palettes[style];
  return buildMaps(size * 2, size, (u, v) => {
    const th = u * Math.PI * 2, ph = v * Math.PI * 2;
    const R = 1, r = 0.45;
    const px = (R + r * Math.cos(ph)) * Math.cos(th);
    const pz = (R + r * Math.cos(ph)) * Math.sin(th);
    const py = r * Math.sin(ph);
    const up = Math.sin(ph); // 1 = top, -1 = bottom

    // base gradient from pale underside to toasted top
    let c: RGB;
    if (up > 0.15) c = lerpRGB(pal.mid, pal.top, smoothstep(0.15, 0.95, up));
    else if (up > -0.35) c = lerpRGB(pal.low, pal.mid, smoothstep(-0.35, 0.15, up));
    else c = lerpRGB(pal.under, pal.low, smoothstep(-1, -0.35, up));

    // large toasted mottling + fine grain
    const mott = fbm(n, px * 2.2, py * 2.2, pz * 2.2, 4);
    const grain = n2(px * 38, py * 38, pz * 38);
    const toast = smoothstep(0.1, 0.55, fbm(n2, px * 4, py * 4, pz * 4, 3)) * smoothstep(-0.2, 0.6, up);
    c = scale(c, 1 + mott * 0.14 - toast * 0.2 + grain * 0.03);

    // blisters: little glossy bubbles on the boiled crust
    const bl = n(px * 16, py * 16, pz * 16);
    const blister = smoothstep(0.42, 0.62, bl) * smoothstep(-0.3, 0.3, up);
    c = lerpRGB(c, scale(c, 1.18), blister * 0.6);

    // stretch marks around the widest part of the bagel
    const side = 1 - Math.abs(up);
    const streakMask = smoothstep(0.1, 0.5, n2(px * 2.5, py * 2.5, pz * 2.5));
    const streak = smoothstep(0.9, 1, 1 - Math.abs(n(px * 3, py * 18, pz * 3))) * smoothstep(0.7, 0.98, side) * streakMask;
    c = lerpRGB(c, lerpRGB(c, pal.under, 0.8), streak * 0.4);

    // flour speckle on the underside
    const flour = smoothstep(0.55, 0.75, n2(px * 60, py * 60, pz * 60)) * smoothstep(-0.2, -0.8, up);
    c = lerpRGB(c, hex("#f6ead2"), flour * 0.6);

    const height = mott * 0.3 + blister * 0.45 + grain * 0.05 - streak * 0.15;
    const rough = mix(0.62, 0.3, smoothstep(-0.3, 0.7, up)) - blister * 0.12 + flour * 0.25;
    return { color: c, height, rough };
  });
}

/* Crumb (cut face). u = around ring, v = inner (0) to outer (1) edge. */
export function crumbMaps(size: number, seed: number): MapData {
  const n = createNoise3(seed + 7);
  const n2 = createNoise3(seed + 8);
  const base = hex("#e9cf9f"), light = hex("#f6e5c2"), crust = hex("#a8612a");
  return buildMaps(size * 2, Math.round(size / 2), (u, v) => {
    const th = u * Math.PI * 2;
    const rr = 0.55 + v * 0.9;
    const x = Math.cos(th) * rr * 3, z = Math.sin(th) * rr * 3;
    // pores: elongated holes, darker and deeper
    const pore = smoothstep(0.35, 0.7, n(x * 5, 0, z * 5) * 0.7 + n2(x * 11, 1, z * 11) * 0.5);
    let c = lerpRGB(light, base, fbm(n2, x, 3, z, 3) * 0.5 + 0.5);
    c = lerpRGB(c, lerpRGB(base, hex("#c49a5c"), 0.6), pore * 0.55);
    // thin crust ring at both edges
    const edge = Math.max(smoothstep(0.07, 0.0, v), smoothstep(0.93, 1.0, v));
    c = lerpRGB(c, crust, edge);
    return { color: c, height: -pore * 0.4 + fbm(n, x * 3, 2, z * 3, 2) * 0.25, rough: 0.9 };
  }, { wrapV: false, normalStrength: 3 });
}

/* Smoked salmon: coral flesh with pale fat lines. u = along the slice. */
export function salmonMaps(size: number, seed: number): MapData {
  const n = createNoise3(seed + 21);
  const deep = hex("#b8391c"), coral = hex("#de5a33"), fat = hex("#f2a887");
  return buildMaps(size, Math.round(size / 2), (u, v) => {
    // thin fat lines in shallow chevrons, as in a cut side of salmon
    const warp = n(u * 2, v * 2, 0) * 0.35;
    const chev = Math.abs(v - 0.5) * 1.6;
    const bands = Math.sin((u * 17 + chev + warp + n(u * 9, v * 2, 7) * 0.25) * Math.PI);
    const line = smoothstep(0.95, 0.998, Math.abs(bands)) * smoothstep(-0.6, 0.4, n(u * 6, v * 3, 3));
    let c = lerpRGB(coral, deep, smoothstep(-0.5, 0.7, n(u * 5, v * 5, 2)));
    c = lerpRGB(c, fat, clamp(line) * 0.8);
    const edge = smoothstep(0.1, 0, Math.min(v, 1 - v));
    c = lerpRGB(c, scale(c, 0.85), edge * 0.5);
    return { color: c, height: line * 0.3 + n(u * 40, v * 20, 5) * 0.05, rough: 0.32 + line * 0.15 };
  }, { wrapU: false, wrapV: false, normalStrength: 2 });
}

/* Cream cheese: soft white with gentle lumps. */
export function creamMaps(size: number, seed: number): MapData {
  const n = createNoise3(seed + 31);
  return buildMaps(size, size, (u, v) => {
    const th = u * Math.PI * 2, ph = v * Math.PI * 2;
    const x = Math.cos(th) * 2, y = Math.sin(th) * 2, z = Math.cos(ph) * 2, w = Math.sin(ph) * 2;
    const h = fbm(n, x + w, y, z, 4);
    const c = lerpRGB(hex("#f1ece1"), hex("#e2d8c4"), smoothstep(-0.5, 0.6, h));
    return { color: c, height: h * 0.8, rough: 0.5 };
  }, { normalStrength: 1.6 });
}

/* Egg-washed challah: deep glossy mahogany with lighter stretch where strands pull. */
export function challahMaps(size: number, seed: number): MapData {
  const n = createNoise3(seed + 41);
  const top = hex("#43200b"), mid = hex("#6a3413"), light = hex("#b77a42");
  return buildMaps(size * 2, size, (u, v) => {
    const th = v * Math.PI * 2;
    const up = Math.sin(th);
    let c = lerpRGB(mid, top, smoothstep(-0.2, 0.9, up));
    const m = fbm(n, u * 18, Math.cos(th) * 2, Math.sin(th) * 2, 4);
    c = scale(c, 1 + m * 0.18);
    // paler dough where the strands tuck under each other
    const tuck = smoothstep(0.1, -0.8, up);
    c = lerpRGB(c, light, tuck * 0.55);
    const grain = n(u * 90, Math.cos(th) * 6, Math.sin(th) * 6);
    c = scale(c, 1 + grain * 0.04);
    return { color: c, height: m * 0.35 + grain * 0.08, rough: mix(0.6, 0.38, smoothstep(-0.2, 0.9, up)) };
  }, { wrapV: true });
}

/* Carrot cake sponge: warm brown with carrot and walnut flecks. */
export function spongeMaps(size: number, seed: number): MapData {
  const n = createNoise3(seed + 51);
  const n2 = createNoise3(seed + 52);
  return buildMaps(size, size, (u, v) => {
    let c = lerpRGB(hex("#9c6233"), hex("#b97b43"), fbm(n, u * 8, v * 8, 0, 3) * 0.5 + 0.5);
    const carrot = smoothstep(0.6, 0.72, n2(u * 40, v * 40, 1));
    const nut = smoothstep(0.62, 0.75, n2(u * 30, v * 30, 9));
    const pore = smoothstep(0.4, 0.7, n(u * 70, v * 70, 3));
    c = lerpRGB(c, hex("#e86a1c"), carrot * 0.8);
    c = lerpRGB(c, hex("#5b3417"), nut * 0.7);
    c = scale(c, 1 - pore * 0.25);
    return { color: c, height: -pore * 0.5, rough: 0.9 };
  }, { normalStrength: 2 });
}

/* End-grain oak board. */
export function woodMaps(size: number, seed: number): MapData {
  const n = createNoise3(seed + 61);
  return buildMaps(size, size, (u, v) => {
    const x = (u - 0.5) * 2, y = (v - 0.5) * 2;
    const ring = Math.sin((Math.hypot(x * 1.1, y) * 26 + n(x * 2, y * 2, 0) * 3) * Math.PI);
    let c = lerpRGB(hex("#b98652"), hex("#a57445"), smoothstep(-1, 1, ring) * 0.5);
    c = scale(c, 1 + n(x * 30, y * 3, 4) * 0.06);
    return { color: c, height: ring * 0.08, rough: 0.7 };
  }, { wrapU: false, wrapV: false, normalStrength: 1.5 });
}
