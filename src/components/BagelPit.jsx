import { useEffect, useRef } from "react";
import { renderBagel, VARIANTS } from "../lib/bagel";

// A pile of bagels at the bottom of the hero. Mouse: grab & throw.
// Touch: tap a bagel to flip it into the air. Click/tap empty space for another bagel.
const GRAVITY = 0.55; // px per step²
const MAX_BAGELS = 36;

export default function BagelPit({ hostRef }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const host = hostRef.current;
    if (!canvas || !host) return undefined;
    const ctx = canvas.getContext("2d");
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let W = 0, H = 0, frame = 0, visible = true, seed = 1;
    const bodies = [];
    let solids = []; // the hero text column — bagels bounce off it instead of covering it
    const pointer = { x: 0, y: 0, px: 0, py: 0, down: false, grabbed: null, ox: 0, oy: 0, startX: 0, startY: 0, startT: 0 };

    const radiusRange = () => (W < 640 ? [26, 40] : [40, 66]);

    function addBagel(x, y, vx = 0, vy = 0) {
      const [lo, hi] = radiusRange();
      const r = lo + Math.random() * (hi - lo);
      const variant = VARIANTS[seed % VARIANTS.length];
      const sprite = renderBagel(r, variant, seed, dpr);
      seed += 1;
      bodies.push({ x, y, px: x - vx, py: y - vy, r, angle: Math.random() * Math.PI * 2, spin: 0, sprite });
      if (bodies.length > MAX_BAGELS) {
        const i = bodies.findIndex((b) => b !== pointer.grabbed);
        bodies.splice(i, 1);
      }
    }

    function resize() {
      const rect = host.getBoundingClientRect();
      W = rect.width;
      H = rect.height;
      canvas.width = Math.round(W * dpr);
      canvas.height = Math.round(H * dpr);
      canvas.style.width = `${W}px`;
      canvas.style.height = `${H}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      solids = [...host.querySelectorAll("[data-solid]")].map((el) => {
        const boxes = [...el.children].map((c) => c.getBoundingClientRect());
        return {
          l: Math.min(...boxes.map((b) => b.left)) - rect.left - 8,
          r: Math.max(...boxes.map((b) => b.right)) - rect.left + 8,
          t: -1e5, // reaches up forever, so nothing can land on top of the text
          b: Math.max(...boxes.map((b) => b.bottom)) - rect.top + 12,
        };
      });
    }

    function collideSolids(a) {
      for (const s of solids) {
        const nx = Math.max(s.l, Math.min(a.x, s.r)), ny = Math.max(s.t, Math.min(a.y, s.b));
        const dx = a.x - nx, dy = a.y - ny, d2 = dx * dx + dy * dy;
        if (d2 >= a.r * a.r) continue;
        if (d2 === 0) {
          // centre inside the column: push out the nearest side (or underneath)
          const left = a.x - s.l, right = s.r - a.x, below = s.b - a.y;
          if (below <= left && below <= right) a.y = s.b + a.r;
          else if (left < right) a.x = s.l - a.r;
          else a.x = s.r + a.r;
          continue;
        }
        const d = Math.sqrt(d2), push = (a.r - d) / d;
        a.x += dx * push;
        a.y += dy * push;
        if (dy < 0) a.px = a.x - (a.x - a.px) * 0.9; // resting on top: friction
      }
    }

    function step() {
      for (const b of bodies) {
        if (b === pointer.grabbed) {
          b.px = b.x;
          b.py = b.y;
          b.x = pointer.x - pointer.ox;
          b.y = pointer.y - pointer.oy;
          continue;
        }
        const vx = (b.x - b.px) * 0.995, vy = (b.y - b.py) * 0.995;
        b.px = b.x;
        b.py = b.y;
        b.x += vx;
        b.y += vy + GRAVITY;
        b.angle += b.spin;
        b.spin *= 0.985;
      }

      for (let iter = 0; iter < 4; iter += 1) {
        for (let i = 0; i < bodies.length; i += 1) {
          const a = bodies[i];
          for (let j = i + 1; j < bodies.length; j += 1) {
            const b = bodies[j];
            const dx = b.x - a.x, dy = b.y - a.y;
            const min = (a.r + b.r) * 0.92; // bagels squash together a little
            const d2 = dx * dx + dy * dy;
            if (d2 >= min * min || d2 === 0) continue;
            const d = Math.sqrt(d2), push = (min - d) / d;
            const wa = a === pointer.grabbed ? 0 : b === pointer.grabbed ? 1 : 0.5;
            const wb = 1 - wa;
            a.x -= dx * push * wa;
            a.y -= dy * push * wa;
            b.x += dx * push * wb;
            b.y += dy * push * wb;
            // rub against each other -> spin
            const rel = (b.x - b.px - (a.x - a.px)) * (dy / d) - (b.y - b.py - (a.y - a.py)) * (dx / d);
            a.spin += (rel / a.r) * 0.02;
            b.spin -= (rel / b.r) * 0.02;
          }
          // floor & walls
          if (a === pointer.grabbed) continue;
          collideSolids(a);
          if (a.y + a.r > H) {
            a.y = H - a.r;
            const vx = a.x - a.px;
            a.px = a.x - vx * 0.9; // floor friction
            a.spin += (vx / a.r - a.spin) * 0.3; // roll
          }
          if (a.x - a.r < 0) {
            a.x = a.r;
            a.px = a.x + (a.x - a.px) * 0.4;
          }
          if (a.x + a.r > W) {
            a.x = W - a.r;
            a.px = a.x + (a.x - a.px) * 0.4;
          }
        }
      }
    }

    function draw() {
      ctx.clearRect(0, 0, W, H);
      for (const b of bodies) {
        // shadow
        ctx.fillStyle = "rgba(42,26,18,0.16)";
        ctx.beginPath();
        ctx.ellipse(b.x + b.r * 0.08, b.y + b.r * 0.14, b.r * 0.95, b.r * 0.9, 0, 0, Math.PI * 2);
        ctx.fill();
      }
      for (const b of bodies) {
        const s = b.sprite.width / dpr;
        ctx.save();
        ctx.translate(b.x, b.y);
        ctx.rotate(b.angle);
        if (b === pointer.grabbed) ctx.scale(1.06, 1.06);
        ctx.drawImage(b.sprite, -s / 2, -s / 2, s, s);
        ctx.restore();
      }
    }

    function loop() {
      step();
      draw();
      frame = visible && !document.hidden ? requestAnimationFrame(loop) : 0;
    }
    const wake = () => {
      if (!frame && visible && !reduceMotion) frame = requestAnimationFrame(loop);
    };

    function localPoint(e) {
      const rect = host.getBoundingClientRect();
      return [e.clientX - rect.left, e.clientY - rect.top];
    }
    const hit = (x, y) => {
      for (let i = bodies.length - 1; i >= 0; i -= 1) {
        const b = bodies[i];
        if ((x - b.x) ** 2 + (y - b.y) ** 2 < b.r * b.r) return b;
      }
      return null;
    };

    function onDown(e) {
      if (e.target.closest("a, button")) return;
      const [x, y] = localPoint(e);
      Object.assign(pointer, { x, y, px: x, py: y, down: true, startX: x, startY: y, startT: performance.now() });
      const b = hit(x, y);
      if (!b) return;
      if (e.pointerType === "touch") {
        // flip it up in the air
        b.py = b.y + 10 + Math.random() * 5;
        b.px = b.x + (Math.random() - 0.5) * 10;
        b.spin += (Math.random() - 0.5) * 0.5;
        wake();
        return;
      }
      e.preventDefault(); // no text selection while dragging
      pointer.grabbed = b;
      pointer.ox = x - b.x;
      pointer.oy = y - b.y;
      bodies.splice(bodies.indexOf(b), 1);
      bodies.push(b); // bring to front
      host.classList.add("is-grabbing");
      wake();
    }
    function onMove(e) {
      const [x, y] = localPoint(e);
      pointer.px = pointer.x;
      pointer.py = pointer.y;
      pointer.x = x;
      pointer.y = y;
      if (!pointer.grabbed) host.classList.toggle("is-over-bagel", e.pointerType !== "touch" && !!hit(x, y));
    }
    function onUp(e) {
      if (!pointer.down) return;
      pointer.down = false;
      const [x, y] = localPoint(e);
      const b = pointer.grabbed;
      if (b) {
        const vx = Math.max(-40, Math.min(40, pointer.x - pointer.px));
        const vy = Math.max(-40, Math.min(40, pointer.y - pointer.py));
        b.px = b.x - vx;
        b.py = b.y - vy;
        b.spin = vx * 0.01;
        pointer.grabbed = null;
        host.classList.remove("is-grabbing");
        return;
      }
      const tap = performance.now() - pointer.startT < 300 && Math.hypot(x - pointer.startX, y - pointer.startY) < 8;
      if (tap && !e.target.closest("a, button") && !hit(x, y)) {
        addBagel(x, Math.min(y, H * 0.4), (Math.random() - 0.5) * 6, -4);
        wake();
      }
    }

    resize();
    // initial drop — staggered so they tumble in beside / below the text
    const initial = W < 640 ? 15 : 20;
    const [, hi] = radiusRange();
    const col = solids[0];
    const roomRight = col ? W - col.r : W;
    for (let i = 0; i < initial; i += 1) {
      if (col && roomRight > hi * 3) {
        addBagel(col.r + hi + Math.random() * (roomRight - hi * 2), -hi - i * hi * 0.9, (Math.random() - 0.5) * 3, 0);
      } else {
        const top = col ? col.b + hi : 0;
        addBagel(hi + Math.random() * (W - hi * 2), top - (i % 3) * hi * 0.5, (Math.random() - 0.5) * 3, 0);
      }
    }
    if (reduceMotion) {
      for (let i = 0; i < 900; i += 1) step();
      draw();
    } else {
      frame = requestAnimationFrame(loop);
    }

    const ro = new ResizeObserver(() => {
      resize();
      if (reduceMotion) draw();
    });
    ro.observe(host);
    document.fonts?.ready.then(resize); // button positions shift once fonts load
    const io = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      wake();
    });
    io.observe(host);
    const onVisibility = () => wake();
    document.addEventListener("visibilitychange", onVisibility);
    host.addEventListener("pointerdown", onDown);
    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerup", onUp);

    return () => {
      cancelAnimationFrame(frame);
      ro.disconnect();
      io.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
      host.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
    };
  }, [hostRef]);

  return <canvas ref={canvasRef} className="bagel-pit" aria-hidden="true" />;
}
