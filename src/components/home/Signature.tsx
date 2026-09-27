import { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { menu } from "../../data/business";
import { gsap, reducedMotion } from "../../lib/motion";
import { useOrder } from "../../lib/order";
import { ArrowRight } from "../Icons";
import Photo from "../Photo";

const signature = menu.find((m) => m.name === "Smoked salmon & cream cheese")!;

/**
 * The signature bagel. As the section scrolls up, the framed photograph opens out to the
 * full width of the screen and settles from a slight zoom — a static full-bleed image
 * when motion is reduced.
 */
export default function Signature() {
  const { openOrder } = useOrder();
  const stage = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = stage.current;
    if (!el || reducedMotion()) return;
    const frame = el.querySelector(".sig-frame");
    const img = el.querySelector("img");
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ scrollTrigger: { trigger: el, start: "top 85%", end: "top 15%", scrub: 0.6 } });
      tl.fromTo(frame, { clipPath: "inset(0% 14% 0% 14%)" }, { clipPath: "inset(0% 0% 0% 0%)", ease: "none" }, 0);
      tl.fromTo(img, { scale: 1.18 }, { scale: 1, ease: "none" }, 0);
    }, el);
    return () => ctx.revert();
  }, []);

  return (
    <section className="signature on-dark" aria-labelledby="sig-title">
      <div className="container sig-head">
        <header className="sec-head">
          <p className="label">
            <span>03</span>
            <span>The Roni's bagel</span>
          </p>
          <h2 id="sig-title" className="reveal-lines">
            <span className="line">
              <span>Smoked salmon</span>
            </span>
            <span className="line" style={{ ["--i" as string]: 1 }}>
              <span>
                <em>&amp; cream cheese.</em>
              </span>
            </span>
          </h2>
        </header>
      </div>
      <div className="sig-stage" ref={stage}>
        <div className="sig-frame">
          <Photo name="signature" sizes="100vw" />
        </div>
      </div>
      <div className="container sig-foot">
        <p className="sig-desc reveal">{signature.description}</p>
        <div className="sig-actions reveal" style={{ ["--delay" as string]: "0.1s" }}>
          <button className="btn btn-paper" onClick={() => openOrder()}>
            Order now <ArrowRight />
          </button>
          <Link className="link" to="/menu?category=bagels">
            All filled bagels <ArrowRight />
          </Link>
        </div>
      </div>
    </section>
  );
}
