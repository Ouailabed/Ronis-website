import { useEffect, useState } from "react";
import { lockScroll, reducedMotion } from "../lib/motion";

const KEY = "ronis:intro-seen";

/**
 * A short intro (about a second): a 0–100 counter on Roni's blue, then the panel lifts away.
 * Shown once per visit, never with reduced motion. The page underneath is already rendered.
 */
export default function Loader() {
  const [state, setState] = useState<"off" | "count" | "lift">(() => {
    try {
      if (reducedMotion() || sessionStorage.getItem(KEY)) return "off";
    } catch {
      return "off";
    }
    return "count";
  });
  const [n, setN] = useState(0);

  useEffect(() => {
    if (state !== "count") return;
    try {
      sessionStorage.setItem(KEY, "1");
    } catch {
      /* ignore */
    }
    lockScroll(true);
    const t0 = performance.now(), dur = 650;
    let frame = requestAnimationFrame(function step(t) {
      const k = Math.min(1, (t - t0) / dur);
      setN(Math.round(100 * (1 - Math.pow(1 - k, 3))));
      if (k < 1) frame = requestAnimationFrame(step);
      else setState("lift");
    });
    return () => cancelAnimationFrame(frame);
  }, [state]);

  useEffect(() => {
    if (state !== "lift") return;
    document.documentElement.classList.add("intro-done");
    const id = window.setTimeout(() => {
      lockScroll(false);
      setState("off");
    }, 650);
    return () => window.clearTimeout(id);
  }, [state]);

  useEffect(() => {
    if (state === "off") document.documentElement.classList.add("intro-done");
  }, [state]);

  if (state === "off") return null;
  return (
    <div className={`loader${state === "lift" ? " is-lifting" : ""}`} aria-hidden="true">
      <span className="loader-brand">Roni's · Bagel Bakery · West Hampstead 1989</span>
      <span className="loader-count">{String(n).padStart(3, "0")}</span>
    </div>
  );
}
