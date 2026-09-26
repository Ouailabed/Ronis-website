import { useEffect, useRef, type ReactNode } from "react";
import { gsap } from "../lib/motion";

/**
 * On wide screens the section pins and its panels slide sideways as you scroll down.
 * On phones, tablets and with reduced motion it's a normal swipeable row (scroll-snap).
 */
export default function HorizontalGallery({ id, children, label }: { id?: string; children: ReactNode; label: string }) {
  const sectionRef = useRef<HTMLElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const section = sectionRef.current, track = trackRef.current;
    if (!section || !track) return;
    const mm = gsap.matchMedia();
    mm.add("(min-width: 900px) and (min-aspect-ratio: 11/10) and (prefers-reduced-motion: no-preference)", () => {
      section.classList.add("is-pinned");
      const distance = () => track.scrollWidth - window.innerWidth;
      const tween = gsap.to(track, {
        x: () => -distance(),
        ease: "none",
        scrollTrigger: { trigger: section, start: "top top", end: () => `+=${distance()}`, pin: true, scrub: 0.8, invalidateOnRefresh: true, anticipatePin: 1 },
      });
      // each panel's image drifts slightly against the movement (depth)
      const imgs = gsap.utils.toArray<HTMLElement>(".hg-img", track).map((img) =>
        gsap.fromTo(img, { xPercent: 8 }, { xPercent: -8, ease: "none", scrollTrigger: { trigger: img, containerAnimation: tween, start: "left right", end: "right left", scrub: true } }),
      );
      return () => {
        imgs.forEach((t) => t.kill());
        section.classList.remove("is-pinned");
      };
    });
    return () => mm.revert();
  }, []);
  return (
    <section ref={sectionRef} id={id} className="hgallery" aria-label={label}>
      <div ref={trackRef} className="hg-track">
        {children}
      </div>
    </section>
  );
}
