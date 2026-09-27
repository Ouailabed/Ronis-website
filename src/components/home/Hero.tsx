import { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { brand } from "../../data/business";
import { gsap, scrollFx } from "../../lib/motion";
import { useOrder } from "../../lib/order";
import { ArrowRight } from "../Icons";
import Photo from "../Photo";

/**
 * 01 — The campaign opening. The photograph rises into place like a curtain, the
 * poster type follows, the image drifts a little with the pointer, and as you scroll
 * the photo pulls in at the edges so the page settles onto the paper beneath.
 */
export default function Hero() {
  const { openOrder } = useOrder();
  const root = useRef<HTMLElement>(null);

  useEffect(
    () =>
      scrollFx(root.current, (mm, el) => {
        const frame = el.querySelector(".hero-frame");
        const pic = el.querySelector(".hero-frame picture");
        
        const type = el.querySelector(".hero-type");
        mm.add("(min-width: 761px)", () => {
          const st = { trigger: el, start: "top top", end: "bottom top", scrub: true };
          gsap.fromTo(frame, { clipPath: "inset(0% 0% 0% 0%)" }, { clipPath: "inset(0% 3% 10% 3%)", ease: "none", scrollTrigger: st });
          gsap.to(pic, { yPercent: 10, ease: "none", scrollTrigger: st });
          gsap.to(type, { yPercent: -35, ease: "none", scrollTrigger: st });
          // a little depth with the pointer (hover devices only)
          if (!window.matchMedia("(hover: hover)").matches) return;
          const xTo = gsap.quickTo(pic, "x", { duration: 1.2, ease: "power3" });
          const onMove = (e: PointerEvent) => xTo((e.clientX / window.innerWidth - 0.5) * -18);
          window.addEventListener("pointermove", onMove);
          return () => window.removeEventListener("pointermove", onMove);
        });
        mm.add("(max-width: 760px)", () => {
          gsap.to(type, { yPercent: -20, opacity: 0.2, ease: "none", scrollTrigger: { trigger: el, start: "top top", end: "bottom top", scrub: true } });
        });
      }),
    [],
  );

  return (
    <section className="hero on-dark" data-hero ref={root} aria-labelledby="hero-title">
      <div className="hero-frame">
        <Photo name="hero" art={{ media: "(max-aspect-ratio: 4/5)", name: "hero-tall" }} sizes="100vw" priority note={false} />
      </div>
      <div className="hero-type">
        <p className="label hero-kicker">
          North London <span aria-hidden="true">—</span> Since {brand.founded}
        </p>
        <h1 id="hero-title" className="hero-title">
          <span className="line">
            <span>Roni's</span>
          </span>
          <span className="line">
            <span>Bagels,</span>
          </span>
          <span className="line hero-title-em">
            <span>
              <em>done properly.</em>
            </span>
          </span>
        </h1>
        <div className="hero-cta">
          <button className="btn btn-blue btn-big" onClick={() => openOrder()}>
            Order now <ArrowRight />
          </button>
          <Link to="/menu" className="btn btn-ink btn-big hero-menu">
            The menu
          </Link>
        </div>
      </div>
      <p className="hero-note">Illustration</p>
    </section>
  );
}
