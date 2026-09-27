import { useEffect, useRef } from "react";

/**
 * A soft blue cursor follower for mouse users: grows over links and buttons,
 * and shows a label over elements with data-cursor="…". Hidden for touch and reduced motion.
 */
export default function Cursor() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!fine || reduced) return;
    document.documentElement.classList.add("has-cursor");
    let x = -100, y = -100, cx = -100, cy = -100, frame = 0;
    const label = el.querySelector("span")!;
    const move = (e: PointerEvent) => {
      x = e.clientX;
      y = e.clientY;
      const t = (e.target as HTMLElement).closest<HTMLElement>("[data-cursor], a, button, input, label");
      const text = t?.dataset.cursor ?? "";
      el.classList.toggle("is-hover", !!t);
      el.classList.toggle("has-label", !!text);
      label.textContent = text;
      if (!frame) frame = requestAnimationFrame(loop);
    };
    const loop = () => {
      cx += (x - cx) * 0.2;
      cy += (y - cy) * 0.2;
      el.style.transform = `translate3d(${cx}px, ${cy}px, 0)`;
      frame = Math.abs(x - cx) + Math.abs(y - cy) > 0.3 ? requestAnimationFrame(loop) : 0;
    };
    const leave = () => el.classList.add("is-away");
    const enter = () => el.classList.remove("is-away");
    window.addEventListener("pointermove", move, { passive: true });
    document.addEventListener("pointerleave", leave);
    document.addEventListener("pointerenter", enter);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("pointermove", move);
      document.removeEventListener("pointerleave", leave);
      document.removeEventListener("pointerenter", enter);
      document.documentElement.classList.remove("has-cursor");
    };
  }, []);
  return (
    <div ref={ref} className="cursor" aria-hidden="true">
      <span />
    </div>
  );
}
