import { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { gsap, scrollFx } from "../../lib/motion";
import { useOrder } from "../../lib/order";
import { ArrowRight } from "../Icons";
import Photo from "../Photo";

/** 07 — The sign-off: a table of bagels, the last word, the two things to do next. */
export default function SeeYou() {
  const { openOrder } = useOrder();
  const root = useRef<HTMLElement>(null);
  useEffect(
    () =>
      scrollFx(root.current, (mm, el) => {
        mm.add("(min-width: 0px)", () => {
          gsap.fromTo(el.querySelector("img"), { scale: 1.2 }, { scale: 1, ease: "none", scrollTrigger: { trigger: el, start: "top bottom", end: "bottom bottom", scrub: true } });
        });
      }),
    [],
  );
  return (
    <section className="seeyou on-dark" ref={root} aria-labelledby="seeyou-title">
      <Photo name="bagels" art={{ media: "(max-aspect-ratio: 4/5)", name: "crust" }} sizes="100vw" className="seeyou-photo" />
      <div className="seeyou-inner">
        <h2 id="seeyou-title" className="reveal-lines">
          <span className="line">
            <span>See you</span>
          </span>
          <span className="line" style={{ ["--i" as string]: 1 }}>
            <span>at Roni's.</span>
          </span>
        </h2>
        <div className="seeyou-actions reveal">
          <button className="btn btn-blue btn-big" onClick={() => openOrder()}>
            Order now <ArrowRight />
          </button>
          <Link className="btn btn-paper btn-big" to="/locations">
            Get directions <ArrowRight />
          </Link>
        </div>
      </div>
    </section>
  );
}
