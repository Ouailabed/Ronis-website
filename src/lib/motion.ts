import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);
// mobile browsers resize the viewport when the address bar hides; don't re-measure for that
ScrollTrigger.config({ ignoreMobileResize: true });

export const reducedMotion = () => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/**
 * Native scrolling everywhere (no scroll-jacking): it's the smoothest and most reliable on
 * every device. Returns a cleanup for API compatibility.
 */
export function startSmoothScroll() {
  // re-measure scroll-driven animations once fonts and images have settled the layout
  const refresh = () => ScrollTrigger.refresh();
  document.fonts?.ready.then(refresh);
  window.addEventListener("load", refresh);
  return () => window.removeEventListener("load", refresh);
}

/** Jump to a position (or element). */
export function scrollToTarget(target: number | HTMLElement, immediate = false) {
  // "instant" (not "auto") so a page change always lands at the top without a visible scroll
  const behavior: ScrollBehavior = immediate || reducedMotion() ? "instant" : "smooth";
  if (typeof target === "number") window.scrollTo({ top: target, behavior });
  else target.scrollIntoView({ behavior });
}

/** Stop the page scrolling behind a dialog or menu. */
export function lockScroll(locked: boolean) {
  document.documentElement.style.overflow = locked ? "hidden" : "";
}

export { gsap, ScrollTrigger };
