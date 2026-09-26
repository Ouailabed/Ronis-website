import * as THREE from "three";
import { createBagel } from "./bagel";
import { createCreamCheese, createSalmonSlice, salmonMaterial } from "./ingredients";
import { clamp, mix, smoothstep } from "./noise";
import { createStage } from "./stage";
import { toMaps, type SurfaceMaps } from "./textures";
import { makeTextureData } from "./textureWorker";

type ShowMaps = { crust: SurfaceMaps; crumb: SurfaceMaps; cream: SurfaceMaps; salmon: SurfaceMaps };

export type ShowQuality = "high" | "low";

const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);
const easeOutBack = (t: number) => {
  const c1 = 1.4, c3 = c1 + 1;
  return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
};
const easeInOut = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

/** Scroll timeline (0 → 1). Adjust here to retime the scene. */
export const TIMELINE = {
  centre: [0.0, 0.2] as const, // bagel travels from beside the headline to centre
  approach: [0.05, 0.4] as const, // camera moves closer and higher
  open: [0.2, 0.4] as const, // top half lifts away
  cheese: [0.36, 0.52] as const,
  salmon: [0.5, 0.8] as const, // three slices, staggered
  settle: [0.8, 0.95] as const, // lid comes to rest, final hero shot
};

export type ShowFrame = {
  progress: number;
  pointer: { x: number; y: number }; // -1..1
  time: number; // seconds
  touch: boolean;
  /** how far the hero bagel sits from centre, in CSS px */
  heroOffset: { x: number; y: number };
  heroScale: number;
  /** scale of the scene once centred (smaller on narrow screens) */
  showScale?: number;
  /** where the finished bagel sits for the final shot (leaves room for the title) */
  finaleOffset?: { x: number; y: number };
};

export class BagelShow {
  readonly stage;
  private root = new THREE.Group();
  private turntable = new THREE.Group();
  private lid = new THREE.Group();
  private cheese;
  private slices: { holder: THREE.Group; rest: THREE.Euler; seed: number }[] = [];
  private disposers: (() => void)[] = [];
  private width = 1;
  private height = 1;
  private pointer = { x: 0, y: 0 };

  /** Builds the heavy textures in a worker first, so the page never freezes. */
  static async create(canvas: HTMLCanvasElement, quality: ShowQuality = "high") {
    const t = quality === "high" ? 512 : 256;
    const [crust, crumb, cream, salmon] = await makeTextureData([
      { kind: "crust", size: t, seed: 1989 },
      { kind: "crumb", size: Math.max(256, t / 2), seed: 1989 },
      { kind: "cream", size: 256, seed: 7 },
      { kind: "salmon", size: t, seed: 21 },
    ]);
    return new BagelShow(canvas, quality, {}, { crust: toMaps(crust), crumb: toMaps(crumb), cream: toMaps(cream), salmon: toMaps(salmon) });
  }

  constructor(canvas: HTMLCanvasElement, quality: ShowQuality = "high", opts: { preserveDrawingBuffer?: boolean; pixelRatio?: number } = {}, maps?: ShowMaps) {
    const high = quality === "high";
    this.stage = createStage({
      canvas,
      // the soft contact shadow under the bagel is baked; real-time shadow maps cost too much per frame
      shadows: !!opts.preserveDrawingBuffer,
      pixelRatio: opts.pixelRatio ?? Math.min(window.devicePixelRatio || 1, high ? 1.75 : 1.25),
      preserveDrawingBuffer: opts.preserveDrawingBuffer,
    });
    const { scene } = this.stage;

    const bagel = createBagel({ seed: 1989, topping: "sesame", detail: high ? 1 : 0.6, texSize: high ? 512 : 256, maps: maps && { crust: maps.crust, crumb: maps.crumb } });
    this.disposers.push(bagel.dispose);
    // hinge the top half on its back edge so it can open like a lid
    const hingeZ = 1.45;
    this.lid.position.set(0, 0, -hingeZ);
    bagel.top.position.set(0, 0, hingeZ);
    this.lid.add(bagel.top);

    const cheese = createCreamCheese(7, high ? 1 : 0.6, maps?.cream);
    cheese.mesh.position.y = 0.05;
    this.cheese = cheese.mesh;
    this.disposers.push(cheese.dispose);

    const salmon = salmonMaterial(21, maps?.salmon);
    this.disposers.push(salmon.dispose);
    // five folded slices laid around the ring, overlapping a little
    const starts = [0.1, 1.35, 2.55, 3.8, 5.0];
    starts.forEach((start, i) => {
      const slice = createSalmonSlice(40 + i * 7, start, 1.45, high ? 1 : 0.6, salmon.mat);
      this.disposers.push(slice.dispose);
      const holder = new THREE.Group();
      holder.add(slice.mesh);
      holder.position.y = 0.13 + i * 0.012;
      this.slices.push({ holder, rest: new THREE.Euler(0, 0, 0), seed: i });
    });

    this.turntable.add(bagel.bottom, this.lid, this.cheese, ...this.slices.map((s) => s.holder));
    this.root.add(this.turntable);
    scene.add(this.root);

    this.stage.blob.position.y = -0.36;
    this.stage.blob.scale.set(4.2, 4.2, 1);
    this.stage.catcher.position.y = -0.345;
    scene.add(this.stage.blob, this.stage.catcher);
  }

  resize(w: number, h: number) {
    this.width = w;
    this.height = h;
    this.stage.resize(w, h);
  }

  update(f: ShowFrame) {
    const p = clamp(f.progress);
    const { camera } = this.stage;

    // pointer follows smoothly; on touch screens, a gentle controlled sway instead
    const target = f.touch ? { x: Math.sin(f.time * 0.45) * 0.35, y: Math.sin(f.time * 0.3) * 0.15 } : f.pointer;
    this.pointer.x = mix(this.pointer.x, target.x, 0.06);
    this.pointer.y = mix(this.pointer.y, target.y, 0.06);

    const centre = easeInOut(smoothstep(...TIMELINE.centre, p));
    const approach = easeInOut(smoothstep(...TIMELINE.approach, p));
    const open = smoothstep(...TIMELINE.open, p);
    const settle = easeInOut(smoothstep(...TIMELINE.settle, p));

    // camera: from a relaxed 3/4 view to closer and higher, looking into the bagel
    const dist = mix(8.6, 7.8, approach) + open * 1.6 - settle * 0.4;
    const elev = THREE.MathUtils.degToRad(mix(26, 46, approach) - settle * 8);
    const azim = THREE.MathUtils.degToRad(settle * -14);
    camera.position.set(Math.sin(azim) * Math.cos(elev) * dist, Math.sin(elev) * dist, Math.cos(azim) * Math.cos(elev) * dist);
    camera.lookAt(0, mix(0.05, 0.5, open), mix(0, -0.45, open));

    // hero framing: shift the whole picture beside the headline, then to centre
    const fin = f.finaleOffset ?? { x: 0, y: 0 };
    const off = { x: f.heroOffset.x * (1 - centre) + fin.x * settle, y: f.heroOffset.y * (1 - centre) + fin.y * settle };
    camera.setViewOffset(this.width, this.height, -off.x, -off.y, this.width, this.height);
    const s = mix(f.heroScale, f.showScale ?? 1, centre);
    this.root.scale.setScalar(s);

    // slow idle turn + pointer response, calming down once the bagel opens
    const calm = 1 - open * 0.7;
    // (no continuous spin: the lid's hinge must stay at the back, away from the camera)
    this.turntable.rotation.y = Math.sin(f.time * 0.35) * 0.22 * (1 - centre) + this.pointer.x * 0.4 * calm;
    this.root.rotation.x = this.pointer.y * 0.18 * calm;
    this.root.rotation.z = -this.pointer.x * 0.05 * calm;
    this.root.position.y = Math.sin(f.time * 1.1) * 0.035 * (1 - approach);

    // the lid lifts and hinges back, then settles leaning open
    const lidAngle = easeOutCubic(open) * 0.95 - settle * 0.1;
    this.lid.rotation.x = -lidAngle;
    this.lid.position.y = easeOutCubic(open) * 0.22 - settle * 0.04;

    // cream cheese spreads outwards from the middle of the ring
    const ch = smoothstep(...TIMELINE.cheese, p);
    this.cheese.visible = ch > 0.001;
    const chE = easeOutCubic(ch);
    this.cheese.scale.set(mix(0.55, 1, chE), Math.max(0.001, chE), mix(0.55, 1, chE));

    // salmon slices drop in one after another and settle with a little give
    const [s0, s1] = TIMELINE.salmon;
    const step = (s1 - s0) / (this.slices.length + 1);
    this.slices.forEach((slice, i) => {
      const t = smoothstep(s0 + i * step, s0 + (i + 2) * step, p);
      slice.holder.visible = t > 0.001;
      const e = easeOutBack(t);
      slice.holder.position.y = 0.13 + i * 0.012 + (1 - e) * 2.6;
      slice.holder.rotation.set((1 - t) * 0.6 * (i % 2 ? 1 : -1), (1 - t) * 0.8, (1 - t) * 0.4);
    });

    // light warms up for the final shot
    this.stage.key.intensity = mix(2.6, 3.0, settle);
    this.stage.rim.intensity = mix(1.8, 2.4, open);

    const blob = this.stage.blob.material as THREE.MeshBasicMaterial;
    blob.opacity = mix(1, 0.85, open);
    this.stage.blob.scale.setScalar(4.2 * s);
  }

  render() {
    this.stage.renderer.render(this.stage.scene, this.stage.camera);
  }

  dispose() {
    this.disposers.forEach((d) => d());
    this.stage.dispose();
  }
}
