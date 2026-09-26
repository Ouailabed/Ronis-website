import { useEffect, useRef } from "react";
import renders from "../data/renders.json";

/**
 * The finale: rendered bagels tumble onto the table and pile up. Mouse: grab and throw.
 * Touch: tap a bagel to flip it. Click empty space for one more. Decorative only —
 * everything important on the page is plain HTML around it.
 */
const SPRITES = [renders["top-sesame"].src, renders["top-plain"].src, renders["top-poppy"].src];
const GRAVITY = 0.5;
const MAX = 34;

type Body = { x: number; y: number; px: number; py: number; r: number; a: number; spin: number; img: HTMLImageElement };

export default function BagelToss({ hostRef, count = 16 }: { hostRef: React.RefObject<HTMLElement | null>; count?: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current, host = hostRef.current;
    if (!canvas || !host) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const imgs = SPRITES.map((src) => Object.assign(new Image(), { src }));
    const bodies: Body[] = [];
    const ptr = { x: 0, y: 0, px: 0, py: 0, down: false, held: null as Body | null, ox: 0, oy: 0, sx: 0, sy: 0, t: 0 };
    let W = 0, H = 0, frame = 0, visible = false, started = false, seed = 0;

    const radius = () => (W < 640 ? 34 + Math.random() * 12 : 50 + Math.random() * 22);
    const add = (x: number, y: number, vx = 0, vy = 0) => {
      const r = radius();
      bodies.push({ x, y, px: x - vx, py: y - vy, r, a: Math.random() * 6.28, spin: (Math.random() - 0.5) * 0.1, img: imgs[seed++ % imgs.length] });
      if (bodies.length > MAX) bodies.splice(bodies.findIndex((b) => b !== ptr.held), 1);
    };
    const resize = () => {
      const r = host.getBoundingClientRect();
      W = r.width;
      H = r.height;
      canvas.width = Math.round(W * dpr);
      canvas.height = Math.round(H * dpr);
      canvas.style.width = `${W}px`;
      canvas.style.height = `${H}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    const step = () => {
      for (const b of bodies) {
        if (b === ptr.held) {
          b.px = b.x;
          b.py = b.y;
          b.x = ptr.x - ptr.ox;
          b.y = ptr.y - ptr.oy;
          continue;
        }
        const vx = (b.x - b.px) * 0.995, vy = (b.y - b.py) * 0.995;
        b.px = b.x;
        b.py = b.y;
        b.x += vx;
        b.y += vy + GRAVITY;
        b.a += b.spin;
        b.spin *= 0.985;
      }
      for (let it = 0; it < 4; it += 1) {
        for (let i = 0; i < bodies.length; i += 1) {
          const a = bodies[i];
          for (let j = i + 1; j < bodies.length; j += 1) {
            const b = bodies[j];
            const dx = b.x - a.x, dy = b.y - a.y, min = (a.r + b.r) * 0.9, d2 = dx * dx + dy * dy;
            if (d2 >= min * min || d2 === 0) continue;
            const d = Math.sqrt(d2), push = (min - d) / d;
            const wa = a === ptr.held ? 0 : b === ptr.held ? 1 : 0.5;
            a.x -= dx * push * wa;
            a.y -= dy * push * wa;
            b.x += dx * push * (1 - wa);
            b.y += dy * push * (1 - wa);
          }
          if (a === ptr.held) continue;
          if (a.y + a.r > H) {
            a.y = H - a.r;
            const vx = a.x - a.px;
            a.px = a.x - vx * 0.88;
            a.spin += (vx / a.r - a.spin) * 0.3;
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
    };
    const draw = () => {
      ctx.clearRect(0, 0, W, H);
      for (const b of bodies) {
        if (!b.img.complete || !b.img.naturalWidth) continue;
        const s = b.r * 2.2 * (b === ptr.held ? 1.06 : 1);
        ctx.save();
        ctx.translate(b.x, b.y);
        ctx.rotate(b.a);
        ctx.drawImage(b.img, -s / 2, -s / 2, s, s);
        ctx.restore();
      }
    };
    const loop = () => {
      step();
      draw();
      frame = visible && !document.hidden ? requestAnimationFrame(loop) : 0;
    };
    const wake = () => {
      if (!frame && visible && !reduced) frame = requestAnimationFrame(loop);
    };
    const start = () => {
      if (started) return;
      started = true;
      for (let i = 0; i < count; i += 1) add(W * 0.15 + Math.random() * W * 0.7, -80 - i * 70, (Math.random() - 0.5) * 4);
      if (reduced) {
        for (let i = 0; i < 900; i += 1) step();
        Promise.all(imgs.map((im) => im.decode().catch(() => undefined))).then(draw);
      }
    };

    const local = (e: PointerEvent) => {
      const r = host.getBoundingClientRect();
      return [e.clientX - r.left, e.clientY - r.top] as const;
    };
    const hit = (x: number, y: number) => {
      for (let i = bodies.length - 1; i >= 0; i -= 1) if ((x - bodies[i].x) ** 2 + (y - bodies[i].y) ** 2 < bodies[i].r ** 2) return bodies[i];
      return null;
    };
    const onDown = (e: PointerEvent) => {
      if ((e.target as HTMLElement).closest("a, button")) return;
      const [x, y] = local(e);
      Object.assign(ptr, { x, y, px: x, py: y, down: true, sx: x, sy: y, t: performance.now() });
      const b = hit(x, y);
      if (!b) return;
      if (e.pointerType === "touch") {
        b.py = b.y + 12 + Math.random() * 6;
        b.px = b.x + (Math.random() - 0.5) * 8;
        b.spin += (Math.random() - 0.5) * 0.4;
        wake();
        return;
      }
      e.preventDefault();
      ptr.held = b;
      ptr.ox = x - b.x;
      ptr.oy = y - b.y;
      bodies.splice(bodies.indexOf(b), 1);
      bodies.push(b);
      host.classList.add("is-grabbing");
      wake();
    };
    const onMove = (e: PointerEvent) => {
      const [x, y] = local(e);
      ptr.px = ptr.x;
      ptr.py = ptr.y;
      ptr.x = x;
      ptr.y = y;
      if (!ptr.held) host.classList.toggle("is-over-bagel", e.pointerType !== "touch" && !!hit(x, y));
    };
    const onUp = (e: PointerEvent) => {
      if (!ptr.down) return;
      ptr.down = false;
      const [x, y] = local(e);
      const b = ptr.held;
      if (b) {
        const vx = Math.max(-40, Math.min(40, ptr.x - ptr.px)), vy = Math.max(-40, Math.min(40, ptr.y - ptr.py));
        b.px = b.x - vx;
        b.py = b.y - vy;
        b.spin = vx * 0.01;
        ptr.held = null;
        host.classList.remove("is-grabbing");
        return;
      }
      const tap = performance.now() - ptr.t < 300 && Math.hypot(x - ptr.sx, y - ptr.sy) < 8;
      if (tap && !(e.target as HTMLElement).closest("a, button") && !hit(x, y) && !reduced) {
        add(x, Math.min(y, H * 0.3), (Math.random() - 0.5) * 6, -3);
        wake();
      }
    };

    resize();
    const ro = new ResizeObserver(() => {
      resize();
      if (reduced) draw();
    });
    ro.observe(host);
    const io = new IntersectionObserver(
      ([e]) => {
        visible = e.isIntersecting;
        if (visible) start();
        wake();
      },
      { threshold: 0.25 },
    );
    io.observe(host);
    const onVis = () => wake();
    document.addEventListener("visibilitychange", onVis);
    host.addEventListener("pointerdown", onDown);
    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerup", onUp);
    return () => {
      cancelAnimationFrame(frame);
      ro.disconnect();
      io.disconnect();
      document.removeEventListener("visibilitychange", onVis);
      host.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
    };
  }, [hostRef, count]);

  return <canvas ref={canvasRef} className="bagel-toss" aria-hidden="true" />;
}
