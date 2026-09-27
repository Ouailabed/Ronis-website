import { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { brand } from "../../data/business";
import { gsap, reducedMotion } from "../../lib/motion";
import { useOrder } from "../../lib/order";
import { useOpenNow } from "../../lib/useOpenNow";
import { ArrowRight } from "../Icons";
import Photo from "../Photo";

/**
 * Full-bleed photograph that uncovers on load while the headline rises line by line,
 * then drifts slowly as the page scrolls away (desktop, and only with motion allowed).
 */
export default function Hero() {
  const { openOrder } = useOrder();
  const { open, summary } = useOpenNow();
  const media = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (reducedMotion() || !media.current) return;
    const mm = gsap.matchMedia();
    mm.add("(min-width: 821px)", () => {
      gsap.to(media.current, {
        yPercent: 14,
        ease: "none",
        scrollTrigger: { trigger: media.current, start: "top top", end: "bottom top", scrub: true },
      });
    });
    return () => mm.revert();
  }, []);

  return (
    <section className="hero on-dark" data-hero aria-labelledby="hero-title">
      <div className="hero-media" ref={media}>
        <Photo name="hero" art={{ media: "(max-aspect-ratio: 4/5)", name: "hero-tall" }} sizes="100vw" priority note={false} className="hero-photo" />
      </div>
      <div className="container hero-inner">
        <p className="label hero-kicker">Roni's Bagel Bakery</p>
        <h1 id="hero-title" className="hero-title">
          <span className="line">
            <span>Fresh bagels.</span>
          </span>
          <span className="line">
            <span>
              <em>Made properly.</em>
            </span>
          </span>
        </h1>
        <div className="hero-actions">
          <button className="btn btn-paper" onClick={() => openOrder()}>
            Order now <ArrowRight />
          </button>
          <Link className="btn btn-line" to="/menu">
            View menu
          </Link>
        </div>
      </div>
      <div className="hero-bar">
        <div className="container hero-bar-inner">
          <p className="label">North London · Est. {brand.founded}</p>
          <Link to="/locations" className="hero-live">
            <span className={`status${open.length ? " is-open" : ""}`}>
              <i aria-hidden="true" />
              {summary}
            </span>
          </Link>
          <p className="hero-note">Illustration</p>
        </div>
      </div>
    </section>
  );
}
