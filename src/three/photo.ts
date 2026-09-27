import * as THREE from "three";
import { BokehPass } from "three/examples/jsm/postprocessing/BokehPass.js";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { OutputPass } from "three/examples/jsm/postprocessing/OutputPass.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { ShaderPass } from "three/examples/jsm/postprocessing/ShaderPass.js";
import { createBagel, type Topping } from "./bagel";
import { createCarrotCake, createChallah, createPlatter } from "./bakes";
import { createCreamCheese, createSalmonSlice, createSlice, salmonMaterial } from "./ingredients";
import { createNoise3, mulberry32 } from "./noise";
import { createStage } from "./stage";
import { creamMaps, woodMaps } from "./textures";

/**
 * "Food photography" studio: renders the 3D food as editorial photographs —
 * real surfaces (wooden counter, Roni's blue-and-white striped deli paper),
 * contact shadows and shallow depth of field. Used offline by scripts/render-assets.mjs.
 */

export type Filling = "salmon" | "saltbeef" | "cheddar" | "tuna";
const TAU = Math.PI * 2;

/* ------------------------------------------------------------------ surfaces */
function counter() {
  const wood = woodMaps(1024, 3);
  [wood.map, wood.normalMap, wood.roughnessMap].forEach((t) => {
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    t.repeat.set(3, 3);
  });
  // dark, oiled walnut: low-key so the food carries the colour
  const mat = new THREE.MeshStandardMaterial({ ...wood, roughness: 0.85, color: "#4a3a2e" });
  const mesh = new THREE.Mesh(new THREE.PlaneGeometry(60, 60), mat);
  mesh.rotation.x = -Math.PI / 2;
  mesh.position.y = -0.36;
  mesh.receiveShadow = true;
  return mesh;
}

/** A sheet of blue-and-white striped deli paper with soft creases. */
function deliPaper(w = 7, h = 5.5, seed = 2, angle = -0.25) {
  const canvas = document.createElement("canvas");
  canvas.width = 1024;
  canvas.height = 1024;
  const ctx = canvas.getContext("2d")!;
  ctx.fillStyle = "#efe9dc";
  ctx.fillRect(0, 0, 1024, 1024);
  // fine blue pinstripes, printed slightly soft like ink on greaseproof paper
  ctx.fillStyle = "rgba(43,76,147,0.78)";
  for (let x = 0; x < 1024; x += 64) ctx.fillRect(x, 0, 9, 1024);
  // paper fibre
  const r = mulberry32(seed);
  for (let i = 0; i < 9000; i += 1) {
    ctx.fillStyle = `rgba(${r() > 0.5 ? "255,255,255" : "60,50,40"},${0.03 + r() * 0.05})`;
    ctx.fillRect(r() * 1024, r() * 1024, 1 + r() * 2, 1);
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 8;
  const geo = new THREE.PlaneGeometry(w, h, 90, 70);
  const n = createNoise3(seed);
  const pos = geo.attributes.position as THREE.BufferAttribute;
  for (let i = 0; i < pos.count; i += 1) {
    const x = pos.getX(i), y = pos.getY(i);
    // gentle creases and a curl at the edges
    const crease = Math.abs(n(x * 0.9, y * 0.9, 0)) * 0.05 + n(x * 3, y * 3, 1) * 0.008;
    const edge = Math.max(0, Math.abs(x) - w / 2 + 0.5) + Math.max(0, Math.abs(y) - h / 2 + 0.5);
    pos.setZ(i, crease + edge * edge * 0.18);
  }
  geo.computeVertexNormals();
  const mat = new THREE.MeshStandardMaterial({ map: tex, roughness: 0.92, side: THREE.DoubleSide });
  const mesh = new THREE.Mesh(geo, mat);
  mesh.rotation.x = -Math.PI / 2;
  mesh.rotation.z = angle;
  mesh.position.y = -0.345;
  mesh.receiveShadow = true;
  return mesh;
}

/* ------------------------------------------------------------------ fillings */
function beefTexture(seed: number) {
  const c = document.createElement("canvas");
  c.width = c.height = 512;
  const ctx = c.getContext("2d")!;
  const g = ctx.createLinearGradient(0, 0, 512, 512);
  g.addColorStop(0, "#a84f42");
  g.addColorStop(1, "#8a3b31");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 512, 512);
  const r = mulberry32(seed);
  // grain lines and pale fat seams, like sliced brisket
  for (let i = 0; i < 140; i += 1) {
    ctx.strokeStyle = `rgba(60,15,12,${0.15 + r() * 0.2})`;
    ctx.lineWidth = 1 + r() * 2;
    const y = r() * 512;
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.bezierCurveTo(170, y + (r() - 0.5) * 30, 340, y + (r() - 0.5) * 30, 512, y + (r() - 0.5) * 20);
    ctx.stroke();
  }
  for (let i = 0; i < 3; i += 1) {
    ctx.strokeStyle = `rgba(225,180,160,${0.3 + r() * 0.2})`;
    ctx.lineWidth = 3 + r() * 5;
    const y = r() * 512;
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.bezierCurveTo(170, y + 30, 340, y - 30, 512, y + 10);
    ctx.stroke();
  }
  ctx.strokeStyle = "rgba(60,25,15,0.8)"; // peppered crust edge
  ctx.lineWidth = 16;
  ctx.strokeRect(0, 0, 512, 512);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

function flatMaterial(color: string, rough: number, maps?: ReturnType<typeof creamMaps>, normal = 1) {
  return new THREE.MeshPhysicalMaterial({
    color,
    roughness: rough,
    normalMap: maps?.normalMap,
    normalScale: new THREE.Vector2(normal, normal),
    clearcoat: 0.15,
    clearcoatRoughness: 0.5,
  });
}

/** A bagel cut and filled; the lid rests on the filling or sits beside it. */
export function createFilledBagel(filling: Filling, opts: { seed?: number; topping?: Topping; lid?: "on" | "beside" | "none"; tilt?: number } = {}) {
  const { seed = 21, topping = "sesame", lid = "on", tilt = 0.07 } = opts;
  const bagel = createBagel({ seed, topping, detail: 1, texSize: 1024 });
  const group = new THREE.Group();
  const fill = new THREE.Group();
  const rand = mulberry32(seed);
  let height = 0.2;

  if (filling === "salmon") {
    const cheese = createCreamCheese(seed, 1);
    cheese.mesh.position.y = 0.05;
    fill.add(cheese.mesh);
    const mat = salmonMaterial(seed).mat;
    // generous, overlapping folds that spill past the crust
    for (let i = 0; i < 8; i += 1) {
      const slice = createSalmonSlice(seed + i * 7, i * 0.82 + rand() * 0.2, 1.35, 1, mat, 1.45);
      slice.mesh.position.y = 0.12 + (i % 3) * 0.018;
      fill.add(slice.mesh);
    }
    height = 0.34;
  } else if (filling === "saltbeef") {
    const mustard = createCreamCheese(seed + 1, 1);
    mustard.mesh.material = flatMaterial("#d4a019", 0.45);
    mustard.mesh.scale.set(1, 0.35, 1);
    mustard.mesh.position.y = 0.03;
    fill.add(mustard.mesh);
    const beefMat = new THREE.MeshPhysicalMaterial({ map: beefTexture(seed), roughness: 0.55, clearcoat: 0.25, side: THREE.DoubleSide });
    for (let layer = 0; layer < 3; layer += 1) {
      [0, 1.6, 3.2, 4.8].forEach((s, i) => {
        const slice = createSalmonSlice(seed + layer * 11 + i, s + layer * 0.5, 1.7, 1, beefMat);
        slice.mesh.position.y = 0.08 + layer * 0.07;
        slice.mesh.scale.set(1.02, 1.3, 1.02);
        fill.add(slice.mesh);
      });
    }
    const pickle = createSlice("cucumber", 0.3);
    (pickle.mesh.material as THREE.Material[])[1] = new THREE.MeshPhysicalMaterial({ color: "#a3a557", roughness: 0.35, clearcoat: 0.5 });
    (pickle.mesh.material as THREE.Material[])[0] = new THREE.MeshStandardMaterial({ color: "#4d5a24", roughness: 0.5 });
    for (let i = 0; i < 3; i += 1) {
      const p = pickle.mesh.clone();
      const a = (i / 3) * TAU + 0.7;
      p.position.set(Math.cos(a) * 1.15, 0.36, Math.sin(a) * 1.15);
      p.rotation.set((rand() - 0.5) * 0.4, 0, (rand() - 0.5) * 0.4);
      fill.add(p);
    }
    height = 0.44;
  } else if (filling === "cheddar") {
    const cheese = flatMaterial("#f1c35a", 0.5);
    const geo = new THREE.BoxGeometry(2.05, 0.07, 2.05, 1, 1, 1);
    for (let i = 0; i < 2; i += 1) {
      const c = new THREE.Mesh(geo, cheese);
      c.position.set((rand() - 0.5) * 0.3, 0.05 + i * 0.065, (rand() - 0.5) * 0.3);
      c.rotation.y = i * 0.45 + 0.2;
      c.castShadow = c.receiveShadow = true;
      fill.add(c);
    }
    const tomato = createSlice("tomato", 0.5);
    for (let i = 0; i < 4; i += 1) {
      const t = tomato.mesh.clone();
      const a = (i / 4) * TAU + 0.3;
      t.position.set(Math.cos(a) * 1.05, 0.24, Math.sin(a) * 1.05);
      t.rotation.set((rand() - 0.5) * 0.2, 0, (rand() - 0.5) * 0.2);
      fill.add(t);
    }
    height = 0.3;
  } else {
    const tuna = createCreamCheese(seed + 2, 1, creamMaps(512, seed + 9));
    tuna.mesh.material = flatMaterial("#cbb68e", 0.8, creamMaps(512, seed + 9), 4);
    tuna.mesh.scale.set(1.05, 2.4, 1.05);
    tuna.mesh.position.y = 0.04;
    fill.add(tuna.mesh);
    const cucumber = createSlice("cucumber", 0.42);
    for (let i = 0; i < 5; i += 1) {
      const c = cucumber.mesh.clone();
      const a = (i / 5) * TAU + 0.4;
      c.position.set(Math.cos(a) * 1.12, 0.3, Math.sin(a) * 1.12);
      c.rotation.set((rand() - 0.5) * 0.3, 0, (rand() - 0.5) * 0.3);
      fill.add(c);
    }
    height = 0.38;
  }

  // the lid rests on the filling, a little askew, or sits beside the open half
  group.add(bagel.bottom, fill);
  if (lid === "on") {
    bagel.top.position.set(0.08, height, -0.12);
    bagel.top.rotation.set(-tilt, 0.4, tilt * 0.5);
    group.add(bagel.top);
  } else if (lid === "beside") {
    bagel.top.position.set(3.25, -0.33, 0.35);
    bagel.top.rotation.set(0, 1.1, 0);
    group.add(bagel.top);
  }
  group.traverse((o) => {
    o.castShadow = true;
    o.receiveShadow = true;
  });
  return group;
}

/* ------------------------------------------------------------------ shots */
export type PhotoShot =
  | "photo-hero"
  | "photo-hero-tall"
  | "photo-signature"
  | "photo-salmon"
  | "photo-saltbeef"
  | "photo-cheddar"
  | "photo-tuna"
  | "photo-crust"
  | "photo-challah"
  | "photo-cake"
  | "photo-platter"
  | "photo-bagels";

type Framing = { cam: [number, number, number]; look: [number, number, number]; fov?: number; focus?: number; aperture?: number; exposure?: number };

export function renderPhoto(canvas: HTMLCanvasElement, shot: PhotoShot, w: number, h: number) {
  const stage = createStage({ canvas, shadows: true, pixelRatio: 1, preserveDrawingBuffer: true });
  const { scene, camera, renderer } = stage;
  stage.resize(w, h);
  renderer.setClearColor("#15100c", 1);
  renderer.toneMappingExposure = 1.05;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  // low-key food lighting: one soft key from behind-left so the crust and fish catch the light,
  // a weak front bounce, and very little ambient — the shadows stay deep and warm
  stage.key.shadow.mapSize.set(4096, 4096);
  stage.key.shadow.radius = 14;
  stage.key.shadow.camera.left = stage.key.shadow.camera.bottom = -8;
  stage.key.shadow.camera.right = stage.key.shadow.camera.top = 8;
  stage.key.position.set(-7, 6.5, -1.8);
  stage.key.intensity = 3.2;

  scene.environmentIntensity = 0.32;
  scene.traverse((o) => {
    if (o instanceof THREE.HemisphereLight) o.intensity = 0.25;
    if (o instanceof THREE.DirectionalLight && o !== stage.key) o.intensity *= 0.6;
  });
  const bounce = new THREE.DirectionalLight("#fff1dd", 1.1);
  bounce.position.set(3, 2, 6);
  scene.add(bounce);
  scene.add(counter());
  // a dark backdrop far behind: the room disappears, as in a real low-key shot
  const backdrop = new THREE.Mesh(new THREE.PlaneGeometry(80, 30), new THREE.MeshBasicMaterial({ color: "#15100c" }));
  backdrop.position.set(0, 5, -14);
  scene.add(backdrop);

  let f: Framing;
  const add = (o: THREE.Object3D, x = 0, y = 0, z = 0, ry = 0) => {
    o.position.set(x, y, z);
    o.rotation.y = ry;
    scene.add(o);
    return o;
  };
  const prop = (seed: number, topping: Topping, x: number, z: number, ry: number, crust: "golden" | "pale" = "golden") =>
    add(createBagel({ seed, topping, detail: 0.8, texSize: 512, crust }).group, x, 0, z, ry);

  switch (shot) {
    case "photo-hero":
    case "photo-hero-tall": {
      // the sandwich close and low, bagels trailing off into the dark behind it. The wide frame keeps
      // the left third dark for the headline; the tall (phone) frame keeps the top dark instead.
      const tall = shot === "photo-hero-tall";
      scene.add(deliPaper(6, 5, 4, -0.22));
      add(createFilledBagel("salmon", { seed: 1989, tilt: 0.09 }), 0, 0, 0, 0.35);
      prop(77, "poppy", 3.0, -3.4, 1, "pale");
      prop(78, "sesame", -2.2, -4.6, 2);
      prop(79, "plain", 0.9, -6.8, 0.4);
      f = tall
        ? { cam: [0.9, 1.1, 4.4], look: [0, 0.95, -0.2], fov: 30, focus: 4.6, aperture: 0.008 }
        : { cam: [1.3, 1.6, 7.1], look: [-1.6, 0.3, -0.3], fov: 30, focus: 7.1, aperture: 0.006 };
      break;
    }
    case "photo-salmon": {
      scene.add(deliPaper(9, 7, 5, 0.3));
      add(createFilledBagel("salmon", { seed: 1990, tilt: 0.06 }), 0, 0, 0, -0.9);
      prop(81, "sesame", 3.2, -3.8, 0.4);
      prop(82, "poppy", -3.0, -4.4, 1.3, "pale");
      f = { cam: [-0.7, 1.6, 4.5], look: [0, 0.22, -0.2], fov: 30, focus: 4.7, aperture: 0.008 };
      break;
    }
    case "photo-signature": {
      // the signature: one sandwich front and centre, the morning's bagels behind it
      scene.add(deliPaper(10, 8, 6, 0.12));
      add(createFilledBagel("salmon", { seed: 2024, tilt: 0.07 }), 0, 0, 0, 0.9);
      prop(83, "sesame", -3.1, -2.6, 0.4);
      prop(84, "poppy", 2.9, -3.2, 1.9, "pale");
      prop(85, "plain", -0.4, -5.2, 2.6);
      prop(86, "sesame", 4.4, -6.4, 0.2);
      f = { cam: [2.0, 2.4, 4.6], look: [0, 0.05, -0.8], fov: 32, focus: 5.0, aperture: 0.006 };
      break;
    }
    case "photo-saltbeef":
    case "photo-cheddar":
    case "photo-tuna": {
      scene.add(deliPaper(9, 7, shot.length, -0.1));
      const filling = shot.replace("photo-", "") as Filling;
      const topping: Topping = filling === "cheddar" ? "plain" : filling === "tuna" ? "poppy" : "sesame";
      add(createFilledBagel(filling, { seed: 300 + shot.length, topping, tilt: 0.08 }), 0, 0, 0, 0.3);
      prop(90 + shot.length, "plain", 3.1, -3.6, 1.2);
      prop(95 + shot.length, "sesame", -3.2, -4.6, 0.3, "pale");
      f = { cam: [0.8, 1.5, 4.6], look: [0, 0.22, -0.2], fov: 30, focus: 4.75, aperture: 0.008 };
      break;
    }
    case "photo-crust": {
      scene.add(deliPaper(8, 6, 9, 0.3));
      add(createBagel({ seed: 1234, topping: "sesame", detail: 1, texSize: 1024 }).group, 0, 0, 0, 0.4);
      prop(1235, "poppy", 2.6, -2.4, 0.4, "pale");
      f = { cam: [-1.2, 1.25, 3.2], look: [0, 0.1, 0], fov: 30, focus: 3.3, aperture: 0.01 };
      break;
    }
    case "photo-bagels": {
      scene.add(deliPaper(11, 9, 12, -0.05));
      const specs: [Topping, number, number, number][] = [
        ["sesame", 0, 0, 0.2], ["poppy", 3.1, -0.6, 1], ["plain", -3, -0.4, 2], ["sesame", 1.4, -3.2, 0.5], ["plain", -1.6, -3.4, 2.4],
      ];
      specs.forEach(([t, x, z, ry], i) => add(createBagel({ seed: 400 + i, topping: t, detail: 0.9, texSize: 1024, crust: t === "poppy" ? "pale" : "golden" }).group, x, 0, z, ry));
      f = { cam: [0, 4.2, 6.2], look: [0, -0.1, -1], fov: 36, focus: 6.8, aperture: 0.004 };
      break;
    }
    case "photo-challah": {
      scene.add(deliPaper(9, 7, 13, 0.2));
      const c = createChallah(8);
      // egg-washed gold rather than the darker bake the scroll scene uses
      c.group.traverse((o) => {
        if (o instanceof THREE.Mesh && "emissive" in o.material) {
          const m = o.material as THREE.MeshPhysicalMaterial;
          m.emissive = new THREE.Color("#7a4212");
          m.emissiveIntensity = 0.45;
          if ("clearcoat" in m) m.clearcoatRoughness = 0.45;
        }
      });
      add(c.group, 0, -0.34, 0, -0.4);
      f = { cam: [1.3, 1.9, 4.4], look: [0, 0.15, 0], fov: 32, focus: 4.6, aperture: 0.006, exposure: 1.25 };
      break;
    }
    case "photo-cake": {
      const c = createCarrotCake(4);
      add(c.group, 0, -0.32, 0, -0.35);
      scene.add(deliPaper(9, 7, 14, 0.1));
      f = { cam: [0.9, 2.1, 5.0], look: [0, 0.75, 0], fov: 30, focus: 5.0, aperture: 0.005, exposure: 1.2 };
      break;
    }
    case "photo-platter":
    default: {
      const p = createPlatter(12);
      add(p.group, 0, -0.14, 0, 0.2);
      f = { cam: [0, 6.4, 4.6], look: [0, -0.3, 0.3], fov: 36, focus: 7.8, aperture: 0.0025, exposure: 1.2 };
    }
  }

  // photographic finish: matte crust, toasted (not white) seeds
  scene.traverse((o) => {
    if (o instanceof THREE.InstancedMesh) {
      const m = o.material as THREE.MeshPhysicalMaterial;
      m.color.set("#d8c6a2");
      m.roughness = 0.75;
      m.clearcoat = 0.05;
    } else if (o instanceof THREE.Mesh && o.material instanceof THREE.MeshPhysicalMaterial && o.material.sheenColor?.getHexString() === "ffc080") {
      o.material.clearcoat = 0.04;
      o.material.sheen = 0.12;
      o.material.specularIntensity = 0.45;
    }
  });

  // framings are composed for 3:2; narrower frames step the camera back so the food still fits
  const aspect = w / h;
  const back = aspect < 1.5 ? Math.pow(1.5 / aspect, 0.8) : 1;
  const look = new THREE.Vector3(...f.look);
  const offset = new THREE.Vector3(...f.cam).sub(look).multiplyScalar(back);
  // portrait frames look down a little more, so the food fills the height rather than the paper
  if (aspect < 1.2) offset.y *= 1.45;
  camera.fov = f.fov ?? 32;
  camera.position.copy(look).add(offset);
  if (f.focus) f.focus *= back;
  if (f.exposure) renderer.toneMappingExposure = f.exposure;
  // the counter falls away into shadow instead of meeting a horizon
  const dist = offset.length();
  scene.fog = new THREE.Fog("#15100c", dist * 1.35, dist * 2.8);
  camera.aspect = aspect;
  camera.updateProjectionMatrix();
  camera.lookAt(look);

  const composer = new EffectComposer(renderer);
  composer.setSize(w, h);
  composer.addPass(new RenderPass(scene, camera));
  composer.addPass(new BokehPass(scene, camera, { focus: f.focus ?? 6, aperture: f.aperture ?? 0.004, maxblur: 0.014 }));
  composer.addPass(new OutputPass());
  // a soft lens vignette, as a real exposure would have
  composer.addPass(
    new ShaderPass({
      uniforms: { tDiffuse: { value: null }, strength: { value: 0.55 } },
      vertexShader: "varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }",
      fragmentShader:
        "uniform sampler2D tDiffuse; uniform float strength; varying vec2 vUv; void main(){ vec4 c = texture2D(tDiffuse, vUv); vec2 d = vUv - 0.5; float v = smoothstep(0.85, 0.2, length(d * vec2(1.0, 1.25))); c.rgb *= mix(1.0 - strength, 1.0, v); gl_FragColor = c; }",
    }),
  );
  composer.render();
}
