import * as THREE from "three";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import { shadowTexture } from "./textures";

export type StageOptions = {
  canvas: HTMLCanvasElement;
  /** real-time shadow maps (desktop / stills only) */
  shadows?: boolean;
  pixelRatio?: number;
  preserveDrawingBuffer?: boolean;
};

/** Renderer, camera and warm "bakery window" lighting shared by every scene. */
export function createStage({ canvas, shadows = true, pixelRatio = 1, preserveDrawingBuffer = false }: StageOptions) {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: "high-performance", preserveDrawingBuffer });
  renderer.setPixelRatio(pixelRatio);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.0;
  renderer.shadowMap.enabled = shadows;
  renderer.shadowMap.type = THREE.PCFShadowMap;
  renderer.setClearColor(0x000000, 0);

  const scene = new THREE.Scene();
  const pmrem = new THREE.PMREMGenerator(renderer);
  const envTex = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
  scene.environment = envTex;
  scene.environmentIntensity = 0.45;

  const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 100);

  // key: warm, soft window light from the upper left
  const key = new THREE.DirectionalLight("#ffe3bd", 2.6);
  key.position.set(-4, 7, 5);
  key.castShadow = shadows;
  key.shadow.mapSize.set(1024, 1024);
  key.shadow.camera.left = key.shadow.camera.bottom = -4;
  key.shadow.camera.right = key.shadow.camera.top = 4;
  key.shadow.camera.near = 1;
  key.shadow.camera.far = 20;
  key.shadow.radius = 6;
  key.shadow.bias = -0.0004;
  key.shadow.normalBias = 0.02;
  scene.add(key);

  // cool fill from the right keeps the shadows from going muddy
  const fill = new THREE.DirectionalLight("#fff0dc", 0.45);
  fill.position.set(6, 2, 3);
  scene.add(fill);

  // warm rim from behind makes the crust glow at the edges
  const rim = new THREE.DirectionalLight("#ffb46b", 1.8);
  rim.position.set(2, 3, -6);
  scene.add(rim);

  scene.add(new THREE.HemisphereLight("#fff4e2", "#9a6a3a", 0.55));

  const shadowTex = shadowTexture();
  const blob = new THREE.Mesh(
    new THREE.PlaneGeometry(1, 1),
    new THREE.MeshBasicMaterial({ map: shadowTex, transparent: true, depthWrite: false, toneMapped: false }),
  );
  blob.rotation.x = -Math.PI / 2;
  blob.renderOrder = -1;

  // invisible floor that only shows cast shadows
  const catcher = new THREE.Mesh(new THREE.PlaneGeometry(30, 30), new THREE.ShadowMaterial({ opacity: 0.22 }));
  catcher.rotation.x = -Math.PI / 2;
  catcher.receiveShadow = true;
  catcher.visible = shadows;

  const resize = (w: number, h: number) => {
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  };

  const dispose = () => {
    envTex.dispose();
    pmrem.dispose();
    shadowTex.dispose();
    blob.geometry.dispose();
    (blob.material as THREE.Material).dispose();
    catcher.geometry.dispose();
    (catcher.material as THREE.Material).dispose();
    renderer.dispose();
  };

  return { renderer, scene, camera, key, rim, fill, blob, catcher, resize, dispose };
}

export type Stage = ReturnType<typeof createStage>;
