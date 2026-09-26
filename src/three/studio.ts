import * as THREE from "three";
import { BagelShow } from "./BagelShow";
import { createBagel, type Topping } from "./bagel";
import { createCarrotCake, createChallah, createPlatter } from "./bakes";
import { createStage } from "./stage";

/**
 * Offline "photo studio" used by scripts/render-assets.mjs to produce the still
 * images in /public/renders (fallbacks, showcase images, share image).
 * Only loaded in development.
 */
export type Shot = "hero" | "opened" | "progress" | "trio" | "challah" | "cake" | "platter" | "top-plain" | "top-sesame" | "top-poppy";

export function renderShot(canvas: HTMLCanvasElement, shot: Shot, w: number, h: number, progress = 0, bg?: string) {
  if (shot === "hero" || shot === "opened" || shot === "progress") {
    const show = new BagelShow(canvas, "high", { preserveDrawingBuffer: true, pixelRatio: 1 });
    show.resize(w, h);
    const p = shot === "hero" ? 0 : shot === "opened" ? 1 : progress;
    // run a few frames so the pointer smoothing settles
    for (let i = 0; i < 60; i += 1) {
      show.update({ progress: p, pointer: { x: -0.25, y: 0.1 }, time: 2.2, touch: false, heroOffset: { x: 0, y: 0 }, heroScale: 1 });
    }
    if (bg) show.stage.renderer.setClearColor(bg, 1);
    show.render();
    return;
  }

  const stage = createStage({ canvas, shadows: true, pixelRatio: 1, preserveDrawingBuffer: true });
  const { scene, camera } = stage;
  stage.resize(w, h);
  if (bg) stage.renderer.setClearColor(bg, 1);
  scene.add(stage.blob, stage.catcher);

  const look = new THREE.Vector3();
  if (shot === "trio") {
    const specs: [Topping, number, number, number][] = [
      ["plain", -2.1, 0.3, 0.4],
      ["poppy", 2.05, 0.5, -0.5],
      ["sesame", 0, 1.7, 1.2],
    ];
    specs.forEach(([topping, x, z, ry], i) => {
      const b = createBagel({ seed: 300 + i * 17, topping, detail: 0.9, texSize: 512, crust: topping === "poppy" ? "pale" : "golden" });
      b.group.position.set(x, 0.33, z);
      b.group.rotation.y = ry;
      scene.add(b.group);
    });
    stage.blob.visible = false;
    stage.catcher.position.y = 0;
    camera.position.set(0, 6.2, 9.6);
    look.set(0, 0.2, 0.7);
  } else if (shot === "challah") {
    const c = createChallah(8);
    c.group.rotation.y = -0.35;
    scene.add(c.group);
    stage.blob.visible = false;
    camera.position.set(1.4, 3.2, 6.6);
    look.set(0, 0.3, 0);
  } else if (shot === "cake") {
    const c = createCarrotCake(4);
    c.group.rotation.y = -0.2;
    scene.add(c.group);
    stage.blob.visible = false;
    stage.catcher.position.y = -0.08;
    camera.position.set(0, 3.6, 8.2);
    look.set(0, 0.75, 0);
  } else if (shot === "platter") {
    const p = createPlatter(12);
    scene.add(p.group);
    stage.blob.visible = false;
    stage.catcher.position.y = -0.2;
    camera.position.set(0, 9.4, 9.6);
    look.set(0, -0.3, 0.1);
  } else {
    const topping = shot.replace("top-", "") as Topping;
    const b = createBagel({ seed: 500 + topping.length, topping, detail: 0.8, texSize: 512, crust: topping === "poppy" ? "pale" : "golden" });
    b.group.position.y = 0.33;
    scene.add(b.group);
    stage.blob.visible = false;
    stage.catcher.visible = false;
    camera.fov = 22;
    camera.position.set(0, 9, 0.001);
    look.set(0, 0, 0);
  }
  camera.aspect = w / h;
  camera.updateProjectionMatrix();
  camera.lookAt(look);
  stage.renderer.render(scene, camera);
}
