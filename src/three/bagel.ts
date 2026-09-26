import * as THREE from "three";
import { createNoise3, fbm, mulberry32 } from "./noise";
import { crumbMaps, crustMaps, type CrustStyle, type SurfaceMaps } from "./textures";

export type Topping = "plain" | "sesame" | "poppy";

export type BagelOptions = {
  seed?: number;
  topping?: Topping;
  crust?: CrustStyle;
  /** geometry detail: 1 = desktop hero, 0.5 = phones / small props */
  detail?: number;
  /** texture size (height in px); width is double */
  texSize?: number;
  /** prebuilt textures (e.g. generated in a worker) */
  maps?: { crust: SurfaceMaps; crumb: SurfaceMaps };
};

export type Bagel = {
  group: THREE.Group;
  top: THREE.Group;
  bottom: THREE.Group;
  /** point on the surface for (u, v) in the bagel's local space */
  surface: (u: number, v: number) => { p: THREE.Vector3; n: THREE.Vector3 };
  dispose: () => void;
};

const TAU = Math.PI * 2;

/**
 * A bagel lying flat (ring in the XZ plane, Y up), outer radius ≈ 1.5.
 * u runs around the ring, v around the tube (v = 0.25 is the top, 0.75 the base).
 * The top half is v ∈ [0, 0.5], so the cut is exactly the y = 0 plane.
 */
export function createBagel(opts: BagelOptions = {}): Bagel {
  const { seed = 7, topping = "sesame", crust = "golden", detail = 1, texSize = 512 } = opts;
  const rand = mulberry32(seed);
  const noise = createNoise3(seed);
  const ph = Array.from({ length: 6 }, () => rand() * TAU);

  const R = 1.02, aOut = 0.5, aIn = 0.39, bTop = 0.37, bBot = 0.3;

  const raw = (u: number, v: number, out: THREE.Vector3) => {
    const th = u * TAU, phi = v * TAU;
    const lump = 1 + 0.045 * Math.sin(3 * th + ph[0]) + 0.03 * Math.sin(5 * th + ph[1]) + 0.015 * Math.sin(9 * th + ph[2]);
    const ringR = R * (1 + 0.03 * Math.sin(2 * th + ph[3]));
    const c = Math.cos(phi), s = Math.sin(phi);
    const radial = (c >= 0 ? aOut : aIn) * c * lump;
    let y = s >= 0 ? bTop * Math.pow(s, 0.85) * lump : -bBot * Math.pow(-s, 0.5) * lump;
    // gentle bulge: the top swells a little towards the outer edge
    if (s > 0) y *= 1 + 0.08 * c;
    const x0 = Math.cos(th) * (ringR + radial), z0 = Math.sin(th) * (ringR + radial);
    // organic surface displacement along the rough normal direction
    const d =
      fbm(noise, x0 * 1.6, y * 1.6, z0 * 1.6, 3) * 0.045 +
      noise(x0 * 6, y * 6, z0 * 6) * 0.01;
    const nx = Math.cos(th) * c, nz = Math.sin(th) * c;
    const ny = s >= 0 ? s : s * 0.6;
    out.set(x0 + nx * d, y + (Math.abs(s) > 1e-6 ? ny * d : 0), z0 + nz * d);
    return out;
  };

  const tmpA = new THREE.Vector3(), tmpB = new THREE.Vector3(), tmpC = new THREE.Vector3(), tmpD = new THREE.Vector3();
  const surface = (u: number, v: number) => {
    const p = raw(u, v, new THREE.Vector3());
    const e = 1e-3;
    raw(u + e, v, tmpA).sub(raw(u - e, v, tmpB));
    raw(u, v + e, tmpC).sub(raw(u, v - e, tmpD));
    const n = new THREE.Vector3().crossVectors(tmpC, tmpA).normalize();
    return { p, n };
  };

  const segU = Math.round(220 * detail), segV = Math.round(110 * detail);

  // --- crust shell for a v-range
  function shell(v0: number, v1: number) {
    const rows = Math.max(8, Math.round(segV * (v1 - v0)));
    const cols = segU;
    const pos = new Float32Array((cols + 1) * (rows + 1) * 3);
    const nor = new Float32Array((cols + 1) * (rows + 1) * 3);
    const uv = new Float32Array((cols + 1) * (rows + 1) * 2);
    let k = 0;
    for (let j = 0; j <= rows; j += 1) {
      const v = v0 + ((v1 - v0) * j) / rows;
      for (let i = 0; i <= cols; i += 1) {
        const u = i / cols;
        const { p, n } = surface(u, v);
        pos.set([p.x, p.y, p.z], k * 3);
        nor.set([n.x, n.y, n.z], k * 3);
        uv.set([u, v], k * 2);
        k += 1;
      }
    }
    const idx: number[] = [];
    for (let j = 0; j < rows; j += 1) {
      for (let i = 0; i < cols; i += 1) {
        const a = j * (cols + 1) + i, b = a + 1, c = a + cols + 1, d = c + 1;
        idx.push(a, c, b, b, c, d);
      }
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    g.setAttribute("normal", new THREE.BufferAttribute(nor, 3));
    g.setAttribute("uv", new THREE.BufferAttribute(uv, 2));
    g.setIndex(idx);
    return g;
  }

  // --- crumb face across the cut (y ≈ 0), facing up (+1) or down (-1)
  function crumbFace(facing: 1 | -1) {
    const cols = segU, rows = Math.max(6, Math.round(14 * detail));
    const pos: number[] = [], uv: number[] = [], idx: number[] = [];
    const inner = new THREE.Vector3(), outer = new THREE.Vector3();
    for (let j = 0; j <= rows; j += 1) {
      const s = j / rows;
      for (let i = 0; i <= cols; i += 1) {
        const u = i / cols;
        raw(u, 0.5, inner);
        raw(u, 0, outer);
        const p = inner.clone().lerp(outer, s);
        // soft, slightly domed crumb with torn texture
        const bump = Math.sin(Math.PI * s) * (0.035 + noise(p.x * 5, 3, p.z * 5) * 0.02);
        p.y = facing * bump;
        pos.push(p.x, p.y, p.z);
        uv.push(u, s);
      }
    }
    for (let j = 0; j < rows; j += 1) {
      for (let i = 0; i < cols; i += 1) {
        const a = j * (cols + 1) + i, b = a + 1, c = a + cols + 1, d = c + 1;
        if (facing > 0) idx.push(a, b, c, b, d, c);
        else idx.push(a, c, b, b, c, d);
      }
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
    g.setAttribute("uv", new THREE.Float32BufferAttribute(uv, 2));
    g.setIndex(idx);
    g.computeVertexNormals();
    return g;
  }

  const crustTex = opts.maps?.crust ?? crustMaps(texSize, seed, crust);
  const crustMat = new THREE.MeshPhysicalMaterial({
    ...crustTex,
    roughness: 1,
    normalScale: new THREE.Vector2(0.75, 0.75),
    sheen: 0.25,
    sheenRoughness: 0.5,
    sheenColor: new THREE.Color("#ffc080"),
    clearcoat: 0.22,
    clearcoatRoughness: 0.5,
  });
  const crumbTex = opts.maps?.crumb ?? crumbMaps(Math.max(256, texSize / 2), seed);
  const crumbMat = new THREE.MeshStandardMaterial({
    ...crumbTex,
    roughness: 1,
    normalScale: new THREE.Vector2(0.55, 0.55),
    // soft bread scatters warm light, so it never goes grey in shadow
    emissive: new THREE.Color("#5a3a18"),
    emissiveIntensity: 0.35,
  });

  const topShell = shell(0, 0.5), bottomShell = shell(0.5, 1);
  const topFace = crumbFace(-1), bottomFace = crumbFace(1);
  const top = new THREE.Group(), bottom = new THREE.Group();
  const meshes = [
    new THREE.Mesh(topShell, crustMat),
    new THREE.Mesh(topFace, crumbMat),
    new THREE.Mesh(bottomShell, crustMat),
    new THREE.Mesh(bottomFace, crumbMat),
  ];
  meshes.forEach((m) => {
    m.castShadow = true;
    m.receiveShadow = true;
  });
  top.add(meshes[0], meshes[1]);
  bottom.add(meshes[2], meshes[3]);

  // --- toppings
  const disposables: { dispose: () => void }[] = [topShell, bottomShell, topFace, bottomFace, crustMat, crumbMat, crumbTex.map, crumbTex.normalMap, crumbTex.roughnessMap, crustTex.map, crustTex.normalMap, crustTex.roughnessMap];
  if (topping !== "plain") {
    const sesame = topping === "sesame";
    const count = Math.round((sesame ? 520 : 4200) * Math.max(0.5, detail));
    const seedGeo = sesame ? new THREE.SphereGeometry(1, 10, 6) : new THREE.IcosahedronGeometry(1, 1);
    const seedMat = new THREE.MeshPhysicalMaterial({
      color: "#ffffff",
      roughness: sesame ? 0.5 : 0.35,
      clearcoat: sesame ? 0.2 : 0.5,
      sheen: sesame ? 0.3 : 0,
    });
    const seeds = new THREE.InstancedMesh(seedGeo, seedMat, count);
    seeds.castShadow = true;
    const m = new THREE.Matrix4(), q = new THREE.Quaternion(), q2 = new THREE.Quaternion(), sc = new THREE.Vector3();
    const upY = new THREE.Vector3(0, 1, 0);
    const col = new THREE.Color();
    for (let i = 0; i < count; i += 1) {
      const u = rand();
      // weight towards the top of the tube, some down the sides
      const t = (rand() + rand() + rand()) / 3;
      const v = Math.min(0.465, Math.max(0.035, 0.25 + (t - 0.5) * (sesame ? 0.62 : 0.66)));
      const { p, n } = surface(u, v);
      q.setFromUnitVectors(upY, n);
      q2.setFromAxisAngle(upY, rand() * TAU);
      q.multiply(q2);
      if (sesame) {
        const k = 0.85 + rand() * 0.35;
        sc.set(0.036 * k, 0.011 * k, 0.021 * k);
        p.addScaledVector(n, 0.006);
        col.setHSL(0.1 + rand() * 0.02, 0.4 + rand() * 0.2, 0.58 + rand() * 0.1);
        if (rand() < 0.3) col.offsetHSL(-0.01, 0.1, -0.16); // toasted seeds
      } else {
        const k = 0.8 + rand() * 0.5;
        sc.set(0.0085 * k, 0.0075 * k, 0.0085 * k);
        p.addScaledVector(n, 0.004);
        col.setHSL(0.62, 0.35, 0.06 + rand() * 0.07);
      }
      m.compose(p, q, sc);
      seeds.setMatrixAt(i, m);
      seeds.setColorAt(i, col);
    }
    top.add(seeds);
    disposables.push(seedGeo, seedMat);
  }

  const group = new THREE.Group();
  group.add(bottom, top);
  return {
    group,
    top,
    bottom,
    surface,
    dispose: () => disposables.forEach((d) => d.dispose()),
  };
}
