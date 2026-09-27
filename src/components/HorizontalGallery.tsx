import { useEffect, useRef, type ReactNode } from "react";

/**
 * On wide screens the row of panels slides sideways as you scroll down.
 * Built on CSS `position: sticky` (handled by the browser's compositor, so it never
 * jumps or goes blank) with one transform updated per animation frame.
 * On phones, tablets and with reduced motion it's a normal swipeable row.
 */
const QUERY = "(min-width: 900px) and (min-aspect-ratio: 11/10) and (prefers-reduced-motion: no-preference)";

export default function HorizontalGallery({ id, children, label }: { id?: string; children: ReactNode; label: string }) {
  const sectionRef = useRef<HTMLElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const section = sectionRef.current, track = trackRef.current;
    if (!section || !track) return;
    const mq = window.matchMedia(QUERY);
    let distance = 0, frame = 0, active = false;

    const measure = () => {
      active = mq.matches;
      section.classList.toggle("is-pinned", active);
      if (!active) {
        section.style.height = "";
        track.style.transform = "";
        return;
      }
      distance = Math.max(0, track.scrollWidth - window.innerWidth);
      // tall enough to scroll through the whole row while the stage stays stuck
      section.style.height = `${window.innerHeight + distance}px`;
      update();
    };
    const update = () => {
      frame = 0;
      if (!active) return;
      const top = section.getBoundingClientRect().top;
      const t = Math.min(1, Math.max(0, -top / Math.max(1, distance)));
      track.style.transform = `translate3d(${(-t * distance).toFixed(1)}px, 0, 0)`;
    };
    const onScroll = () => {
      if (!frame && active) frame = requestAnimationFrame(update);
    };

    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(track);
    mq.addEventListener("change", measure);
    window.addEventListener("resize", measure);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(frame);
      ro.disconnect();
      mq.removeEventListener("change", measure);
      window.removeEventListener("resize", measure);
      window.removeEventListener("scroll", onScroll);
      section.style.height = "";
      section.classList.remove("is-pinned");
    };
  }, []);

  return (
    <section ref={sectionRef} id={id} className="hgallery" aria-label={label}>
      <div className="hg-stage">
        <div ref={trackRef} className="hg-track">
          {children}
        </div>
      </div>
    </section>
  );
}
