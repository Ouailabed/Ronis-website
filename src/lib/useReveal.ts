import { useEffect } from "react";

const SELECTOR = ".reveal, .reveal-lines, .reveal-photo";

/**
 * Adds .is-in to .reveal / .reveal-lines / .reveal-photo elements as they enter the viewport
 * (the CSS in base.css decides what that looks like). Watches the DOM, so it
 * also works for lazily loaded pages that mount after navigation.
 */
export function useReveal() {
  useEffect(() => {
    if (!("IntersectionObserver" in window)) {
      const showAll = () => document.querySelectorAll(SELECTOR).forEach((el) => el.classList.add("is-in"));
      showAll();
      const mo = new MutationObserver(showAll);
      mo.observe(document.body, { childList: true, subtree: true });
      return () => mo.disconnect();
    }
    const io = new IntersectionObserver(
      (entries) =>
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("is-in");
            io.unobserve(e.target);
          }
        }),
      { rootMargin: "0px 0px -10% 0px", threshold: 0.01 },
    );
    const seen = new WeakSet<Element>();
    const scan = () =>
      document.querySelectorAll(SELECTOR).forEach((el) => {
        if (el.classList.contains("is-in")) return;
        if (seen.has(el)) return;
        seen.add(el);
        io.observe(el);
      });
    scan();
    const mo = new MutationObserver(scan);
    mo.observe(document.body, { childList: true, subtree: true });
    return () => {
      io.disconnect();
      mo.disconnect();
    };
  }, []);
}

export function usePrefersReducedMotion() {
  const query = typeof window !== "undefined" ? window.matchMedia("(prefers-reduced-motion: reduce)") : null;
  return query?.matches ?? false;
}
