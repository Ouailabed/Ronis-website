import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useOrder } from "../lib/order";
import { usePrefersReducedMotion } from "../lib/useReveal";
import { scrollToTarget } from "../lib/motion";
import { hasWebGL } from "../lib/webgl";
import renders from "../data/renders";
import { Bag, Pin } from "./Icons";
import Steam from "./Steam";

type ShowModule = typeof import("../three/BagelShow");

const STEPS = [
  { at: [0.16, 0.38], n: "01", title: "The bagel", text: "Baked by Roni's in North London since 1989." },
  { at: [0.38, 0.52], n: "02", title: "Cream cheese", text: "Spread thick, edge to edge." },
  { at: [0.52, 0.8], n: "03", title: "Smoked salmon", text: "Folded on, slice by slice." },
] as const;

const clamp01 = (v: number) => Math.min(1, Math.max(0, v));

/**
 * Hero + scroll scene. The HTML (headline and buttons) renders immediately;
 * a still image shows the bagel until the 3D scene has loaded, then crossfades.
 * With reduced motion or no WebGL, the scene becomes a short sequence of stills.
 */
export default function BagelShowSection() {
  const { openOrder } = useOrder();
  const reduced = usePrefersReducedMotion();
  const [webgl] = useState(() => hasWebGL());
  const cinematic = webgl && !reduced;
  const sectionRef = useRef<HTMLElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [ready, setReady] = useState(false);
  // only the parts of the UI that change at thresholds live in React state (not every frame)
  const [stage, setStage] = useState({ active: -1, pastHero: false, finale: false });

  // the static version (reduced motion / no WebGL) has the blue hero too
  useEffect(() => {
    if (cinematic) return;
    const set = () => document.documentElement.classList.toggle("on-dark-hero", window.scrollY < window.innerHeight * 0.6);
    set();
    window.addEventListener("scroll", set, { passive: true });
    return () => {
      window.removeEventListener("scroll", set);
      document.documentElement.classList.remove("on-dark-hero");
    };
  }, [cinematic]);

  useEffect(() => {
    if (!cinematic) return;
    const section = sectionRef.current, canvas = canvasRef.current;
    if (!section || !canvas) return;
    let show: InstanceType<ShowModule["BagelShow"]> | null = null;
    let frame = 0, visible = true, disposed = false;
    let target = 0, smooth = 0, last = performance.now();
    const pointer = { x: 0, y: 0 };
    const lastPointer = { x: 0, y: 0 };
    let lastPointerT = 0, needsDraw = true;
    const touch = window.matchMedia("(hover: none)").matches;
    const t0 = performance.now();

    const measure = () => {
      const rect = section.getBoundingClientRect();
      const total = rect.height - window.innerHeight;
      target = clamp01(-rect.top / Math.max(1, total));
      // light header only while the blue hero is actually on screen
      document.documentElement.classList.toggle("on-dark-hero", target < 0.12 && rect.bottom > 0);
      if (!show) {
        section.style.setProperty("--p", target.toFixed(4)); // keeps the still image in sync before 3D loads
      }
    };
    const layout = () => {
      const w = canvas.clientWidth, h = canvas.clientHeight;
      // side-by-side only on wide, landscape screens; portrait tablets stack like phones
      const wide = w >= 900 && w / h > 1.1;
      return {
        // hero: bagel centred, in front of the giant wordmark
        heroOffset: wide ? { x: 0, y: -h * 0.07 } : { x: 0, y: -h * 0.02 },
        finaleOffset: wide ? { x: w * 0.2, y: h * 0.04 } : { x: 0, y: h * 0.14 },
        heroScale: wide ? 0.92 : w < 520 ? 0.72 : 0.85,
        showScale: wide ? 1 : w < 520 ? 0.56 : 0.78,
      };
    };
    const tick = () => {
      frame = 0;
      if (!show || !visible) return;
      // time-based easing, so slower devices still keep up with the scroll
      const nowT = performance.now(), dt = Math.min(0.1, (nowT - last) / 1000);
      last = nowT;
      smooth += (target - smooth) * (1 - Math.exp(-dt * 16));
      if (Math.abs(target - smooth) < 0.0005) smooth = target;
      // redraw only while something is moving: scrolling, the pointer, or the idle sway in the hero
      const pointerMoved = Math.abs(pointer.x - lastPointer.x) + Math.abs(pointer.y - lastPointer.y) > 0.001;
      const settled = smooth === target && !pointerMoved && nowT - lastPointerT > 1200;
      const idleSway = smooth < 0.2; // the hero bagel gently turns on its own
      if (!settled || idleSway || needsDraw) {
        const l = layout();
        show.update({ progress: smooth, pointer, time: (nowT - t0) / 1000, touch, ...l });
        show.render();
        needsDraw = false;
      }
      if (pointerMoved) {
        lastPointer.x = pointer.x;
        lastPointer.y = pointer.y;
        lastPointerT = nowT;
      }
      section.style.setProperty("--p", smooth.toFixed(4));
      const next = {
        active: STEPS.findIndex((st) => smooth >= st.at[0] && smooth < st.at[1]),
        pastHero: smooth > 0.16,
        finale: smooth >= 0.8,
      };
      setStage((prev) => (prev.active === next.active && prev.pastHero === next.pastHero && prev.finale === next.finale ? prev : next));
      frame = requestAnimationFrame(tick);
    };
    const wake = () => {
      if (!frame && visible) {
        last = performance.now();
        frame = requestAnimationFrame(tick);
      }
    };
    const onScroll = () => {
      measure();
      wake();
    };
    const onPointer = (e: PointerEvent) => {
      pointer.x = (e.clientX / window.innerWidth) * 2 - 1;
      pointer.y = (e.clientY / window.innerHeight) * 2 - 1;
    };
    const resize = () => {
      if (!show) return;
      show.resize(canvas.clientWidth, canvas.clientHeight);
      needsDraw = true;
      measure();
      wake();
    };

    // load three.js after first paint so the headline and buttons are never delayed
    const start = () =>
      import("../three/BagelShow").then(async ({ BagelShow }) => {
        if (disposed) return;
        const low = window.innerWidth < 768 || (navigator.hardwareConcurrency ?? 8) <= 4;
        try {
          const built = await BagelShow.create(canvas, low ? "low" : "high");
          if (disposed) {
            built.dispose();
            return;
          }
          show = built;
        } catch {
          return; // WebGL failed: the still image simply stays
        }
        resize();
        show.update({ progress: target, pointer, time: 0, touch, ...layout() });
        show.render();
        setReady(true);
        wake();
      });
    const idle = (window as Window & { requestIdleCallback?: (cb: () => void) => number }).requestIdleCallback;
    const timer = idle ? idle(start) : window.setTimeout(start, 200);

    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting;
      if (visible) wake();
    });
    io.observe(section);
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("pointermove", onPointer, { passive: true });
    measure();

    return () => {
      disposed = true;
      if (!idle) window.clearTimeout(timer);
      cancelAnimationFrame(frame);
      io.disconnect();
      ro.disconnect();
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("pointermove", onPointer);
      document.documentElement.classList.remove("on-dark-hero");
      show?.dispose();
    };
  }, [cinematic]);

  const { active, finale, pastHero } = stage;

  return (
    <section
      ref={sectionRef}
      className={`show${cinematic ? " is-cinematic" : " is-static"}${ready ? " is-ready" : ""}${pastHero ? " is-past-hero" : ""}`}
      aria-label="Roni's bagels"
    >
      <div className="show-stage">
        {/* background colour shifts with the story: blue hero → cream → salmon finale */}
        <div className="show-bg" aria-hidden="true">
          <i className="bg-cream" />
          <i className="bg-salmon" />
        </div>

        <div className="awning show-awning" aria-hidden="true" />

        <div className="show-word" aria-hidden="true">
          {"RONI'S".split("").map((c, i) => (
            <span key={i} style={{ "--i": i } as React.CSSProperties}>
              {c}
            </span>
          ))}
        </div>

        <div className="show-visual" aria-hidden="true">
          <img
            className="show-still"
            src={renders["bagel-hero"].src}
            alt=""
            width={renders["bagel-hero"].width}
            height={renders["bagel-hero"].height}
            fetchPriority="high"
            decoding="async"
          />
          {cinematic && <canvas ref={canvasRef} className="show-canvas" />}
          <Steam />
        </div>

        <div className="show-hero container">
          <div className="show-hero-copy">
            <h1>
              A London classic. <em>Fresh every day.</em>
            </h1>
            <p className="show-hero-lede">Bagels and Jewish baked goods from West Hampstead, since 1989. Six bakeries across North London.</p>
          </div>
          <div className="show-actions">
            <button className="btn btn-light" onClick={() => openOrder()}>
              <Bag />
              Order now
            </button>
            <Link className="btn btn-ghost" to="/locations">
              <Pin />
              Find your Roni's
            </Link>
          </div>
        </div>

        {cinematic && (
          <>
            <ol className="show-steps" aria-hidden={!ready}>
              {STEPS.map((s, i) => (
                <li key={s.n} className={i === active ? "is-active" : i < active ? "is-done" : undefined}>
                  <span className="show-step-n">{s.n} / 03</span>
                  <strong>{s.title}</strong>
                  <span className="show-step-text">{s.text}</span>
                </li>
              ))}
            </ol>
            <div className={`show-finale${finale ? " is-active" : ""}`}>
              <p className="eyebrow">A Roni's favourite</p>
              <h2>
                Smoked salmon <em>&amp; cream cheese</em>
              </h2>
              <button className="btn" onClick={() => openOrder()} tabIndex={finale ? 0 : -1}>
                Order yours
              </button>
            </div>
            <a
              className="show-skip"
              href="#showcase"
              onClick={(e) => {
                e.preventDefault();
                const el = document.getElementById("showcase");
                if (el) scrollToTarget(el, reduced);
              }}
            >
              Skip ↓
            </a>
            <span className="show-note">Digital illustration</span>
          </>
        )}
      </div>

      {!cinematic && (
        <div className="container show-sequence">
          <p className="eyebrow">A Roni's favourite</p>
          <h2>
            Smoked salmon <em>&amp; cream cheese</em>
          </h2>
          <ol>
            {[
              { img: renders["bagel-step-30"], title: "The bagel", text: STEPS[0].text },
              { img: renders["bagel-step-50"], title: "Cream cheese", text: STEPS[1].text },
              { img: renders["bagel-opened"], title: "Smoked salmon", text: STEPS[2].text },
            ].map((s, i) => (
              <li key={s.title}>
                <div className="show-sequence-img">
                  <img src={s.img.src} alt={`Illustration: ${s.title.toLowerCase()} stage of a smoked salmon and cream cheese bagel`} loading="lazy" width={s.img.width} height={s.img.height} />
                </div>
                <span className="show-step-n">0{i + 1}</span>
                <strong>{s.title}</strong>
                <span>{s.text}</span>
              </li>
            ))}
          </ol>
          <p className="small">Images are digital illustrations.</p>
        </div>
      )}
    </section>
  );
}
