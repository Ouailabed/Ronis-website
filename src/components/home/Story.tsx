import { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { brand, story } from "../../data/business";
import { gsap, scrollFx } from "../../lib/motion";
import { ArrowRight } from "../Icons";
import Photo from "../Photo";

/**
 * 02 — Since 1989. A magazine spread: the year set huge across the page, pulled
 * together as it scrolls in; the photograph and the words travel at different speeds.
 */
export default function Story() {
  const root = useRef<HTMLElement>(null);

  useEffect(
    () =>
      scrollFx(root.current, (mm, el) => {
        mm.add("(min-width: 761px)", () => {
          const st = { trigger: el, start: "top bottom", end: "top 20%", scrub: true };
          gsap.fromTo(el.querySelector(".story-since"), { xPercent: -14 }, { xPercent: 0, ease: "none", scrollTrigger: st });
          gsap.fromTo(el.querySelector(".story-year"), { xPercent: 14 }, { xPercent: 0, ease: "none", scrollTrigger: st });
          gsap.fromTo(
            el.querySelector(".story-photo img"),
            { yPercent: -8, scale: 1.16 },
            { yPercent: 8, scale: 1.16, ease: "none", scrollTrigger: { trigger: el.querySelector(".story-photo"), start: "top bottom", end: "bottom top", scrub: true } },
          );
          gsap.fromTo(
            el.querySelector(".story-copy"),
            { y: 80 },
            { y: -40, ease: "none", scrollTrigger: { trigger: el.querySelector(".story-body"), start: "top bottom", end: "bottom top", scrub: true } },
          );
        });
      }),
    [],
  );

  return (
    <section className="story" id="story" ref={root} aria-labelledby="story-title">
      <h2 id="story-title" className="story-head" aria-label={`Since ${brand.founded}`}>
        <span className="story-since" aria-hidden="true">
          Since
        </span>
        <span className="story-year" aria-hidden="true">
          {brand.founded}
        </span>
      </h2>
      <div className="story-body">
        <Photo name="crust" sizes="(min-width: 761px) 46vw, 100vw" className="story-photo" />
        <div className="story-copy">
          <p className="label muted">
            <span className="tnum">01</span> — West Hampstead
          </p>
          <p className="story-intro serif">{story.intro}</p>
          <blockquote className="story-quote">
            <p>“{story.reputation}”</p>
            <cite className="label muted">In Roni's words</cite>
          </blockquote>
          <ol className="story-years">
            {story.timeline.map((t) => (
              <li key={t.year}>
                <span className="story-years-y display tnum">{t.year}</span>
                <span>
                  <strong>{t.title}.</strong> <span className="muted">{t.text}</span>
                </span>
              </li>
            ))}
          </ol>
          <Link className="link" to="/about">
            The full story <ArrowRight />
          </Link>
        </div>
      </div>
    </section>
  );
}
