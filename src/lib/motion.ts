import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";

gsap.registerPlugin(ScrollTrigger);

let lenis: Lenis | null = null;

export const reducedMotion = () => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/** Smooth, weighted scrolling (desktop and touch) kept in sync with ScrollTrigger. Off for reduced motion. */
export function startSmoothScroll() {
  if (lenis || reducedMotion()) return () => undefined;
  lenis = new Lenis({ lerp: 0.11, wheelMultiplier: 1, touchMultiplier: 1.2 });
  lenis.on("scroll", ScrollTrigger.update);
  const tick = (time: number) => lenis?.raf(time * 1000);
  gsap.ticker.add(tick);
  gsap.ticker.lagSmoothing(0);
  return () => {
    gsap.ticker.remove(tick);
    lenis?.destroy();
    lenis = null;
  };
}

/** Jump to a position (or element), with or without smoothing. */
export function scrollToTarget(target: number | HTMLElement, immediate = false) {
  if (lenis) lenis.scrollTo(target, { immediate, offset: typeof target === "number" ? 0 : -80 });
  else if (typeof target === "number") window.scrollTo(0, target);
  else target.scrollIntoView({ behavior: immediate || reducedMotion() ? "auto" : "smooth" });
}

export function lockScroll(locked: boolean) {
  if (!lenis) return;
  if (locked) lenis.stop();
  else lenis.start();
}

export { gsap, ScrollTrigger };
