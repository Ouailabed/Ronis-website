import { useEffect, useRef } from "react";
import { renderBagel } from "../lib/bagel";

// A single illustrated bagel, e.g. the "o" in the logo or the menu picks.
export default function Bagel({ size = 48, variant = "sesame", seed = 7, className = "" }) {
  const ref = useRef(null);
  useEffect(() => {
    const host = ref.current;
    if (!host) return;
    const sprite = renderBagel(size / 2 / 1.08, variant, seed, Math.min(window.devicePixelRatio || 1, 2) * 1.5);
    sprite.style.width = sprite.style.height = "100%";
    host.replaceChildren(sprite);
  }, [size, variant, seed]);
  return <span ref={ref} className={`bagel ${className}`} style={{ width: size, height: size }} aria-hidden="true" />;
}
