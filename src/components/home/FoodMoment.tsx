import { useEffect, useRef } from "react";
import { gsap, scrollFx } from "../../lib/motion";
import Photo from "../Photo";

/**
 * 04 — The food moment. One huge photograph, three words. The image settles from a
 * close crop as it scrolls through, and each word moves at its own pace.
 */
export default function FoodMoment() {
  const root = useRef<HTMLElement>(null);
  useEffect(
    () =>
      scrollFx(root.current, (mm, el) => {
        mm.add("(min-width: 0px)", () => {
          const st = { trigger: el, start: "top bottom", end: "bottom top", scrub: true };
          gsap.fromTo(el.querySelector("img"), { scale: 1.3, yPercent: -6 }, { scale: 1.02, yPercent: 6, ease: "none", scrollTrigger: st });
          el.querySelectorAll<HTMLElement>(".moment-word").forEach((w, i) => {
            gsap.fromTo(w, { xPercent: (i - 1) * 18 + 10 }, { xPercent: (i - 1) * -6, ease: "none", scrollTrigger: st });
          });
        });
      }),
    [],
  );
  return (
    <section className="moment on-dark" ref={root} aria-label="Fresh. Simple. Roni's.">
      <Photo name="signature" art={{ media: "(max-aspect-ratio: 4/5)", name: "bagel-salmon" }} sizes="100vw" className="moment-photo" />
      <p className="moment-words display" aria-hidden="true">
        <span className="moment-word">Fresh.</span>
        <span className="moment-word">
          <em>Simple.</em>
        </span>
        <span className="moment-word">Roni's.</span>
      </p>
      <p className="moment-caption label">Smoked salmon &amp; cream cheese — Roni's famous homemade bagel</p>
    </section>
  );
}
