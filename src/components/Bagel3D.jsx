import { useEffect, useRef } from "react";
import * as THREE from "three";

// A procedural, sesame-topped bagel that slowly turns and leans toward the pointer.
export default function Bagel3D() {
  const hostRef = useRef(null);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return undefined;

    let renderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    } catch {
      return undefined; // no WebGL — the hero still works without the bagel
    }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    host.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(32, 1, 0.1, 50);
    camera.position.set(0, 0, 7.2);

    // --- Dough: a lumpy torus coloured golden on top, pale on the underside
    const R = 1.3, r = 0.56;
    const geometry = new THREE.TorusGeometry(R, r, 96, 192);
    const pos = geometry.attributes.position;
    const normal = geometry.attributes.normal;
    const colors = new Float32Array(pos.count * 3);
    const top = new THREE.Color("#b8621b"), mid = new THREE.Color("#d99a4a"), under = new THREE.Color("#f0d3a1");
    const v = new THREE.Vector3(), n = new THREE.Vector3(), c = new THREE.Color();
    for (let i = 0; i < pos.count; i += 1) {
      v.fromBufferAttribute(pos, i);
      n.fromBufferAttribute(normal, i);
      const a = Math.atan2(v.y, v.x);
      const bump = 0.035 * Math.sin(a * 5 + v.z * 3) + 0.02 * Math.sin(a * 13 + v.z * 9) + 0.012 * Math.sin(a * 29);
      v.addScaledVector(n, bump);
      if (v.z < 0) v.z *= 0.82; // flatter base, like a real bagel
      pos.setXYZ(i, v.x, v.y, v.z);
      const t = THREE.MathUtils.clamp(n.z * 0.5 + 0.5, 0, 1);
      if (t > 0.55) c.copy(mid).lerp(top, (t - 0.55) / 0.45);
      else c.copy(under).lerp(mid, t / 0.55);
      colors.set([c.r, c.g, c.b], i * 3);
    }
    geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));
    geometry.computeVertexNormals();

    const dough = new THREE.Mesh(
      geometry,
      new THREE.MeshPhysicalMaterial({ vertexColors: true, roughness: 0.48, clearcoat: 0.45, clearcoatRoughness: 0.5, sheen: 0.4, sheenColor: new THREE.Color("#ffd9a0") }),
    );

    // --- Sesame seeds scattered over the top of the crust
    const seedCount = 360;
    const seedGeometry = new THREE.SphereGeometry(0.036, 8, 6);
    seedGeometry.scale(1.7, 0.75, 0.55);
    const seeds = new THREE.InstancedMesh(seedGeometry, new THREE.MeshStandardMaterial({ color: "#fbe9c6", roughness: 0.55 }), seedCount);
    const m = new THREE.Matrix4(), q = new THREE.Quaternion(), s = new THREE.Vector3(1, 1, 1), p = new THREE.Vector3(), nn = new THREE.Vector3();
    const zAxis = new THREE.Vector3(0, 0, 1);
    for (let i = 0; i < seedCount; i += 1) {
      const u = Math.random() * Math.PI * 2;
      const w = (Math.random() - 0.5) * Math.PI * 0.95; // upper half of the tube
      const cx = Math.cos(u) * R, cy = Math.sin(u) * R;
      nn.set(Math.cos(u) * Math.sin(w), Math.sin(u) * Math.sin(w), Math.cos(w)).normalize();
      p.set(cx, cy, 0).addScaledVector(nn, r + 0.03);
      q.setFromUnitVectors(zAxis, nn);
      q.multiply(new THREE.Quaternion().setFromAxisAngle(zAxis, Math.random() * Math.PI));
      m.compose(p, q, s.setScalar(0.8 + Math.random() * 0.45));
      seeds.setMatrixAt(i, m);
    }

    const bagel = new THREE.Group();
    bagel.add(dough, seeds);
    bagel.rotation.x = -0.95;
    scene.add(bagel);

    // --- Warm "bakery window" lighting
    scene.add(new THREE.HemisphereLight("#fff1dc", "#3a2412", 1.1));
    const key = new THREE.DirectionalLight("#ffe2b8", 2.6);
    key.position.set(3, 4, 5);
    scene.add(key);
    const rim = new THREE.DirectionalLight("#ff9a3c", 2.2);
    rim.position.set(-4, -2, -3);
    scene.add(rim);

    let targetX = 0, targetY = 0, x = 0, y = 0, frame = 0;
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const onPointer = (e) => {
      targetX = (e.clientX / window.innerWidth - 0.5) * 0.6;
      targetY = (e.clientY / window.innerHeight - 0.5) * 0.4;
    };
    const resize = () => {
      const { width, height } = host.getBoundingClientRect();
      renderer.setSize(Math.max(1, width), Math.max(1, height), false);
      camera.aspect = Math.max(1, width) / Math.max(1, height);
      camera.updateProjectionMatrix();
    };
    const clock = new THREE.Clock();
    const render = () => {
      const t = clock.getElapsedTime();
      x += (targetX - x) * 0.05;
      y += (targetY - y) * 0.05;
      if (!reduceMotion) bagel.rotation.z = t * 0.25;
      bagel.rotation.x = -0.95 + y;
      bagel.rotation.y = x;
      bagel.position.y = reduceMotion ? 0 : Math.sin(t * 1.2) * 0.06;
      renderer.render(scene, camera);
      frame = requestAnimationFrame(render);
    };

    const observer = new ResizeObserver(resize);
    observer.observe(host);
    window.addEventListener("pointermove", onPointer, { passive: true });
    resize();
    render();

    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      window.removeEventListener("pointermove", onPointer);
      geometry.dispose();
      seedGeometry.dispose();
      dough.material.dispose();
      seeds.material.dispose();
      renderer.dispose();
      renderer.domElement.remove();
    };
  }, []);

  return <div ref={hostRef} className="bagel3d" aria-hidden="true" />;
}
