import * as THREE from "three";
import { createBagel, type Topping } from "./bagel";
import { createCreamCheese, createSalmonSlice, createSlice, salmonMaterial } from "./ingredients";
import { createNoise3, mulberry32 } from "./noise";
import { challahMaps, creamMaps, woodMaps } from "./textures";

const TAU = Math.PI * 2;

/* ----------------------------------------------------------------------------
 * Three-strand plaited challah, lying along the X axis.
 * -------------------------------------------------------------------------- */
export function createChallah(seed = 5) {
  const L = 3.6, strands = 3, k = 2.6; // k = number of crossings per strand
  const tex = challahMaps(512, seed);
  const mat = new THREE.MeshPhysicalMaterial({
    ...tex,
    roughness: 1,
    clearcoat: 0.35,
    clearcoatRoughness: 0.45,
    sheen: 0.1,
    sheenColor: new THREE.Color("#ffb070"),
    normalScale: new THREE.Vector2(0.3, 0.3),
  });
  const group = new THREE.Group();
  const geos: THREE.BufferGeometry[] = [];
  const noise = createNoise3(seed);
  for (let s = 0; s < strands; s += 1) {
    const phi = (s / strands) * TAU;
    const center = (t: number) => {
      const w = t * TAU * k + phi;
      const taper = Math.pow(Math.sin(Math.PI * t), 0.5);
      return new THREE.Vector3((t - 0.5) * L, 0.32 * Math.sin(2 * w) * taper * 0.55 + 0.42 * taper, 0.42 * Math.sin(w) * taper);
    };
    const radius = (t: number) => {
      const w = t * TAU * k + phi;
      const taper = 0.35 + 0.65 * Math.pow(Math.sin(Math.PI * t), 0.6);
      return 0.46 * taper * (1 + 0.14 * Math.cos(2 * w));
    };
    const cols = 180, ring = 40;
    const pos: number[] = [], uv: number[] = [], idx: number[] = [];
    for (let i = 0; i <= cols; i += 1) {
      const t = 0.005 + (i / cols) * 0.99;
      const c = center(t);
      const T = center(t + 0.002).sub(center(t - 0.002)).normalize();
      const N = new THREE.Vector3(0, 1, 0).sub(T.clone().multiplyScalar(T.y)).normalize();
      const B = new THREE.Vector3().crossVectors(T, N);
      const r = radius(t);
      for (let j = 0; j <= ring; j += 1) {
        const a = (j / ring) * TAU;
        const bump = 1 + noise(c.x * 3, c.y * 3 + a, c.z * 3) * 0.05;
        const p = c.clone().addScaledVector(N, Math.sin(a) * r * bump).addScaledVector(B, Math.cos(a) * r * bump);
        p.y = Math.max(p.y, 0.02 + (p.y - 0.02) * 0.4); // flatten where it sits on the tray
        pos.push(p.x, p.y, p.z);
        uv.push(t, j / ring);
      }
    }
    for (let i = 0; i < cols; i += 1) {
      for (let j = 0; j < ring; j += 1) {
        const a = i * (ring + 1) + j, b = a + 1, c = a + ring + 1, d = c + 1;
        idx.push(a, c, b, b, c, d);
      }
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
    g.setAttribute("uv", new THREE.Float32BufferAttribute(uv, 2));
    g.setIndex(idx);
    g.computeVertexNormals();
    geos.push(g);
    const mesh = new THREE.Mesh(g, mat);
    mesh.castShadow = mesh.receiveShadow = true;
    group.add(mesh);
  }
  return { group, dispose: () => [...geos, mat, tex.map, tex.normalMap, tex.roughnessMap].forEach((d) => d.dispose()) };
}

/* ----------------------------------------------------------------------------
 * Carrot cake: frosted layers with one slice cut out, the slice set in front.
 * -------------------------------------------------------------------------- */
function layerTexture(width: number, height: number, layers: { h: number; kind: "sponge" | "frost" }[]) {
  const canvas = document.createElement("canvas");
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext("2d")!;
  const rand = mulberry32(9);
  const total = layers.reduce((s, l) => s + l.h, 0);
  let y = 0;
  for (const l of [...layers].reverse()) {
    const h = (l.h / total) * 512;
    if (l.kind === "sponge") {
      ctx.fillStyle = "#a86c38";
      ctx.fillRect(0, y, 512, h);
      for (let i = 0; i < 900; i += 1) {
        const r = rand();
        ctx.fillStyle = r < 0.3 ? "#e8732a" : r < 0.45 ? "#5a3216" : r < 0.8 ? "rgba(70,40,15,0.35)" : "rgba(255,220,170,0.35)";
        ctx.beginPath();
        ctx.ellipse(rand() * 512, y + rand() * h, 1 + rand() * 3, 1 + rand() * 2, rand() * 3, 0, TAU);
        ctx.fill();
      }
    } else {
      const g = ctx.createLinearGradient(0, y, 0, y + h);
      g.addColorStop(0, "#fbf5e9");
      g.addColorStop(1, "#efe3cc");
      ctx.fillStyle = g;
      // wavy frosting line
      ctx.beginPath();
      ctx.moveTo(0, y + 3);
      for (let x = 0; x <= 512; x += 16) ctx.lineTo(x, y + Math.sin(x * 0.05) * 3);
      ctx.lineTo(512, y + h);
      for (let x = 512; x >= 0; x -= 16) ctx.lineTo(x, y + h + Math.sin(x * 0.07 + 2) * 3);
      ctx.fill();
    }
    y += h;
  }
  // outer frosting strip on the right (the cake's edge)
  ctx.fillStyle = "#f7efe0";
  ctx.fillRect(512 - (0.07 / width) * 512, 0, 512, 512);
  const t = new THREE.CanvasTexture(canvas);
  t.colorSpace = THREE.SRGBColorSpace;
  void height;
  return t;
}

export function createCarrotCake(seed = 4) {
  const R = 1.55;
  const layers: { h: number; kind: "sponge" | "frost" }[] = [
    { h: 0.36, kind: "sponge" }, { h: 0.09, kind: "frost" }, { h: 0.36, kind: "sponge" },
    { h: 0.09, kind: "frost" }, { h: 0.36, kind: "sponge" }, { h: 0.1, kind: "frost" },
  ];
  const H = layers.reduce((sum, l) => sum + l.h, 0);
  const cut = 0.85; // radians removed: one generous slice
  const noise = createNoise3(seed);
  const rand = mulberry32(seed);
  const disposables: { dispose: () => void }[] = [];

  // cream cheese frosting with soft spatula texture
  const frostTex = creamMaps(256, seed + 2);
  frostTex.map.repeat.set(3, 2);
  frostTex.normalMap.repeat.set(3, 2);
  const frostMat = new THREE.MeshPhysicalMaterial({
    map: frostTex.map,
    normalMap: frostTex.normalMap,
    normalScale: new THREE.Vector2(1.4, 1.4),
    color: "#fff6e6",
    roughness: 0.62,
    sheen: 0.5,
    sheenColor: new THREE.Color("#ffffff"),
  });
  disposables.push(frostMat, frostTex.map, frostTex.normalMap, frostTex.roughnessMap);

  // sides: open cylinder sector with gentle spatula ripples
  const side = new THREE.CylinderGeometry(R, R, H, 160, 12, true, cut / 2, TAU - cut);
  const pos = side.attributes.position as THREE.BufferAttribute;
  for (let i = 0; i < pos.count; i += 1) {
    const x = pos.getX(i), y = pos.getY(i), z = pos.getZ(i);
    const a = Math.atan2(x, z);
    const k = 1 + noise(Math.cos(a) * 3, y * 2.5, Math.sin(a) * 3) * 0.012 + Math.sin(a * 9 + y * 3) * 0.004;
    pos.setXYZ(i, x * k, y + H / 2, z * k);
  }
  side.computeVertexNormals();
  disposables.push(side);

  // top: lumpy swirled frosting over a pie-slice disc
  const topGeo = new THREE.CircleGeometry(R, 160, cut / 2 + Math.PI / 2, TAU - cut);
  topGeo.rotateX(-Math.PI / 2);
  const tp = topGeo.attributes.position as THREE.BufferAttribute;
  for (let i = 0; i < tp.count; i += 1) {
    const x = tp.getX(i), z = tp.getZ(i);
    const r = Math.hypot(x, z) / R;
    const swirl = noise(x * 1.6, 5, z * 1.6) * 0.05 + noise(x * 5, 9, z * 5) * 0.015;
    const lip = Math.pow(r, 8) * 0.03; // frosting rolls up slightly at the rim
    tp.setY(i, H + 0.015 + swirl * (1 - Math.pow(r, 6)) + lip);
  }
  topGeo.computeVertexNormals();
  disposables.push(topGeo);

  const group = new THREE.Group();
  // sides get a finer, gentler texture than the top (no stretching around the cake)
  const sideTex = creamMaps(256, seed + 3);
  sideTex.normalMap.repeat.set(14, 3);
  sideTex.map.repeat.set(14, 3);
  const sideMat = frostMat.clone();
  sideMat.map = sideTex.map;
  sideMat.normalMap = sideTex.normalMap;
  sideMat.normalScale = new THREE.Vector2(0.35, 0.35);
  disposables.push(sideMat, sideTex.map, sideTex.normalMap, sideTex.roughnessMap);
  const sideMesh = new THREE.Mesh(side, sideMat);
  const topMesh = new THREE.Mesh(topGeo, frostMat);
  group.add(sideMesh, topMesh);

  // the two cut faces show the carrot sponge and frosting layers
  const faceTex = layerTexture(R, H, layers);
  const faceMat = new THREE.MeshStandardMaterial({ map: faceTex, roughness: 0.9, side: THREE.DoubleSide });
  const faceGeo = new THREE.PlaneGeometry(R, H + 0.02);
  faceGeo.translate(R / 2, H / 2 + 0.01, 0);
  disposables.push(faceTex, faceMat, faceGeo);
  for (const a of [cut / 2, -cut / 2]) {
    const face = new THREE.Mesh(faceGeo, faceMat);
    // plane lies along +X; CylinderGeometry measures angles from +Z towards +X
    face.rotation.y = a - Math.PI / 2;
    if (a < 0) face.scale.z = -1;
    group.add(face);
  }

  // walnut pieces: bumpy, irregular halves around the top
  const nutGeo = new THREE.IcosahedronGeometry(0.11, 3);
  const np = nutGeo.attributes.position as THREE.BufferAttribute;
  for (let i = 0; i < np.count; i += 1) {
    const x = np.getX(i), y = np.getY(i), z = np.getZ(i);
    const k = 1 + noise(x * 30, y * 30, z * 30) * 0.22 + Math.sin(x * 60) * 0.05;
    np.setXYZ(i, x * k * 1.3, Math.max(y, -0.01) * k * 0.7, z * k);
  }
  nutGeo.computeVertexNormals();
  const nutMat = new THREE.MeshStandardMaterial({ color: "#7c4a22", roughness: 0.75 });
  const dollopGeo = new THREE.SphereGeometry(0.17, 24, 16);
  const dp = dollopGeo.attributes.position as THREE.BufferAttribute;
  for (let i = 0; i < dp.count; i += 1) {
    const x = dp.getX(i), y = dp.getY(i), z = dp.getZ(i);
    const a = Math.atan2(x, z);
    // piped-star ridges that twist towards the tip
    const k = 1 + Math.sin(a * 8 + y * 18) * 0.08;
    dp.setXYZ(i, x * k, Math.max(0, y) * 1.1, z * k);
  }
  dollopGeo.computeVertexNormals();
  disposables.push(nutGeo, nutMat, dollopGeo);
  const count = 12;
  for (let i = 0; i < count; i += 1) {
    const a = (i / count) * TAU + 0.26;
    const rel = Math.atan2(Math.sin(a), Math.cos(a));
    if (Math.abs(rel) < cut / 2 + 0.2) continue; // no dollops over the missing slice
    const x = Math.sin(a) * (R - 0.28), z = Math.cos(a) * (R - 0.28);
    const d = new THREE.Mesh(dollopGeo, frostMat);
    d.position.set(x, H + 0.02, z);
    const nut = new THREE.Mesh(nutGeo, nutMat);
    nut.position.set(x, H + 0.2, z);
    nut.rotation.set((rand() - 0.5) * 0.6, rand() * TAU, (rand() - 0.5) * 0.6);
    group.add(d, nut);
  }
  // a scatter of walnut crumbs in the middle
  for (let i = 0; i < 14; i += 1) {
    const a = rand() * TAU, r = Math.sqrt(rand()) * (R - 0.6);
    if (Math.abs(Math.atan2(Math.sin(a), Math.cos(a))) < cut / 2 + 0.15) continue;
    const crumb = new THREE.Mesh(nutGeo, nutMat);
    crumb.scale.setScalar(0.35 + rand() * 0.3);
    crumb.position.set(Math.sin(a) * r, H + 0.05, Math.cos(a) * r);
    crumb.rotation.y = rand() * TAU;
    group.add(crumb);
  }

  // ceramic cake plate
  const plateGeo = new THREE.CylinderGeometry(2.05, 1.95, 0.08, 96);
  plateGeo.translate(0, -0.04, 0);
  const plateMat = new THREE.MeshPhysicalMaterial({ color: "#f3efe8", roughness: 0.18, clearcoat: 0.9 });
  const plate = new THREE.Mesh(plateGeo, plateMat);
  group.add(plate);
  disposables.push(plateGeo, plateMat);

  group.traverse((o) => { o.castShadow = true; o.receiveShadow = true; });
  return { group, dispose: () => disposables.forEach((d) => d.dispose()) };
}

/* ----------------------------------------------------------------------------
 * Catering platter: 25 filled mini bagels on a round oak board, using the three
 * fillings on Roni's platters menu.
 * -------------------------------------------------------------------------- */
export function createPlatter(seed = 12) {
  const disposables: { dispose: () => void }[] = [];
  const group = new THREE.Group();

  const wood = woodMaps(512, seed);
  const boardGeo = new THREE.CylinderGeometry(3.95, 3.9, 0.22, 128);
  boardGeo.translate(0, -0.1, 0);
  const boardTop = new THREE.MeshStandardMaterial({ ...wood, roughness: 1 });
  const boardSide = new THREE.MeshStandardMaterial({ color: "#8f6037", roughness: 0.75 });
  const board = new THREE.Mesh(boardGeo, [boardSide, boardTop, boardSide]);
  board.receiveShadow = true;
  group.add(board);
  disposables.push(boardGeo, boardTop, boardSide, wood.map, wood.normalMap, wood.roughnessMap);

  const bases: Record<Topping, ReturnType<typeof createBagel>> = {
    plain: createBagel({ seed: seed + 1, topping: "plain", detail: 0.45, texSize: 256 }),
    sesame: createBagel({ seed: seed + 2, topping: "sesame", detail: 0.45, texSize: 256 }),
    poppy: createBagel({ seed: seed + 3, topping: "poppy", detail: 0.45, texSize: 256, crust: "pale" }),
  };
  Object.values(bases).forEach((b) => disposables.push(b));
  const cream = createCreamCheese(seed, 0.5);
  const salmonMat = salmonMaterial(seed);
  const salmon = [0, 1, 2].map((i) => createSalmonSlice(seed + i * 3, i * 2.1, 2.3, 0.5, salmonMat.mat));
  const tunaMat = new THREE.MeshPhysicalMaterial({ color: "#d8c49a", roughness: 0.85, map: (cream.mesh.material as THREE.MeshPhysicalMaterial).map, normalMap: (cream.mesh.material as THREE.MeshPhysicalMaterial).normalMap, normalScale: new THREE.Vector2(3, 3) });
  const cheddarGeo = new THREE.BoxGeometry(2.5, 0.08, 2.5);
  const cheddarMat = new THREE.MeshPhysicalMaterial({ color: "#f0a431", roughness: 0.45, clearcoat: 0.2 });
  const cucumber = createSlice("cucumber", 0.42);
  const tomato = createSlice("tomato", 0.5);
  disposables.push(cream, salmonMat, ...salmon, tunaMat, cheddarGeo, cheddarMat, cucumber, tomato);

  const fillings = ["salmon", "tuna", "cheddar"] as const;
  const toppings: Topping[] = ["sesame", "plain", "poppy"];
  const rand = mulberry32(seed);
  const spots: { x: number; z: number }[] = [{ x: 0, z: 0 }];
  for (let i = 0; i < 8; i += 1) spots.push({ x: Math.cos((i / 8) * TAU) * 1.5, z: Math.sin((i / 8) * TAU) * 1.5 });
  for (let i = 0; i < 16; i += 1) spots.push({ x: Math.cos((i / 16) * TAU + 0.2) * 3.0, z: Math.sin((i / 16) * TAU + 0.2) * 3.0 });

  spots.forEach((spot, i) => {
    const kind = fillings[i % 3];
    const base = bases[toppings[(i + Math.floor(i / 3)) % 3]];
    const mini = new THREE.Group();
    const bottom = base.bottom.clone();
    const top = base.top.clone();
    const fill = new THREE.Group();
    if (kind === "salmon") {
      fill.add(cream.mesh.clone());
      salmon.forEach((s) => fill.add(s.mesh.clone()));
    } else if (kind === "tuna") {
      const t = new THREE.Mesh(cream.mesh.geometry, tunaMat);
      t.scale.set(1.05, 1.8, 1.05);
      fill.add(t);
      for (let c = 0; c < 4; c += 1) {
        const cu = cucumber.mesh.clone();
        const a = (c / 4) * TAU + rand();
        cu.position.set(Math.cos(a) * 1.3, 0.14, Math.sin(a) * 1.3);
        cu.rotation.set((rand() - 0.5) * 0.2, 0, (rand() - 0.5) * 0.2);
        fill.add(cu);
      }
    } else {
      const ch = new THREE.Mesh(cheddarGeo, cheddarMat);
      ch.position.y = 0.06;
      ch.rotation.y = rand() * 1.5;
      fill.add(ch);
      for (let c = 0; c < 3; c += 1) {
        const tm = tomato.mesh.clone();
        const a = (c / 3) * TAU + rand();
        tm.position.set(Math.cos(a) * 1.25, 0.16, Math.sin(a) * 1.25);
        tm.rotation.set(0.15, 0, 0.1);
        fill.add(tm);
      }
    }
    fill.position.y = 0.02;
    top.position.y = kind === "tuna" ? 0.26 : 0.2;
    top.rotation.set((rand() - 0.5) * 0.12, 0, (rand() - 0.5) * 0.12);
    mini.add(bottom, fill, top);
    mini.scale.setScalar(0.43);
    mini.position.set(spot.x + (rand() - 0.5) * 0.08, 0.3 * 0.43 + 0.01, spot.z + (rand() - 0.5) * 0.08);
    mini.rotation.y = rand() * TAU;
    mini.traverse((o) => { o.castShadow = true; o.receiveShadow = true; });
    group.add(mini);
  });

  return { group, dispose: () => disposables.forEach((d) => d.dispose()) };
}
