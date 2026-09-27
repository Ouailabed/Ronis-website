import { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import BagelShowSection from "../components/BagelShow";
import BagelToss from "../components/BagelToss";
import HorizontalGallery from "../components/HorizontalGallery";
import { ArrowRight, ArrowUpRight, Bag, Pin } from "../components/Icons";
import Loader from "../components/Loader";
import LocationStack from "../components/LocationStack";
import Marquee from "../components/Marquee";
import WordReveal from "../components/WordReveal";
import { catering, locations, ordering, story } from "../data/business";
import renders from "../data/renders";
import { gsap, reducedMotion } from "../lib/motion";
import { useOrder } from "../lib/order";
import { useSeo } from "../lib/seo";

const COUNTER = [
  {
    to: "/menu?category=bagels",
    kicker: "Bagels",
    title: "Filled or by the bag",
    text: "Plain, sesame and poppy. Filled with smoked salmon & cream cheese, hot salt beef and more.",
    img: renders["bagels-trio"],
    alt: "Illustration of a plain, a sesame and a poppy seed bagel",
    tone: "blue",
  },
  {
    to: "/menu?category=bakery",
    kicker: "Baked goods",
    title: "Challah & bakes",
    text: "Roni's own plaited challah, challah rolls, and homemade biscuits and pastries.",
    img: renders.challah,
    alt: "Illustration of a plaited, egg-washed challah loaf",
    tone: "butter",
  },
  {
    to: "/cakes",
    kicker: "Cakes",
    title: "For any occasion",
    text: "Carrot cake by the slice, and bespoke celebration cakes made to order.",
    img: renders["carrot-cake"],
    alt: "Illustration of a layered carrot cake with cream cheese frosting and walnuts",
    tone: "salmon",
  },
  {
    to: "/catering",
    kicker: "Platters",
    title: "Feed a crowd",
    text: `${catering.miniBagelPlatter.count} mini bagels on one platter, plus hot platters and mini desserts.`,
    img: renders.platter,
    alt: "Illustration of a round wooden board with 25 filled mini bagels",
    tone: "orange",
  },
] as const;

export default function Home() {
  const { openOrder } = useOrder();
  const finaleRef = useRef<HTMLElement>(null);
  const platterRef = useRef<HTMLDivElement>(null);
  useSeo(
    "",
    "Roni's Bagel Bakery: bagels and Jewish baked goods since 1989. Six North London bakeries — West Hampstead, Belsize Village, Hampstead, Swains Lane, Muswell Hill and Brent Cross. Order online, platters and cakes.",
  );
  const p = catering.miniBagelPlatter;

  // the platter turns slowly as you scroll past it
  useEffect(() => {
    const el = platterRef.current;
    if (!el || reducedMotion()) return;
    const t = gsap.fromTo(el, { rotate: -18 }, { rotate: 18, ease: "none", scrollTrigger: { trigger: el, start: "top bottom", end: "bottom top", scrub: true } });
    return () => {
      t.scrollTrigger?.kill();
      t.kill();
    };
  }, []);

  return (
    <>
      <Loader />
      <BagelShowSection />

      <Marquee className="band band-orange" items={["Fresh bagels", "Homemade challah", "Cakes for any occasion", "Platters", "Since 1989"]} />

      {/* ------------------------------------------------ statement */}
      <section className="statement container">
        <p className="eyebrow">Since 1989</p>
        <WordReveal text="Roni's started on West End Lane in 1989, baking authentic bagels and Jewish baked goods. Today there are six Roni's across North London, still serving fresh hot bagels, breads, pastries and cakes." />
        <Link to="/about" className="link-arrow">
          Our story <ArrowRight className="icon-inline" />
        </Link>
      </section>

      {/* ------------------------------------------------ the counter (horizontal) */}
      <HorizontalGallery id="showcase" label="What's on the counter">
        <div className="hg-panel hg-intro">
          <p className="eyebrow">The counter</p>
          <h2>
            What's <em>fresh</em> today
          </h2>
          <p className="lede">Bagels, challah, cakes and platters. Scroll to see more, or go straight to the menu.</p>
          <Link to="/menu" className="btn">
            Full menu <ArrowRight />
          </Link>
        </div>
        {COUNTER.map((c, i) => (
          <Link key={c.kicker} to={c.to} className={`hg-panel hg-card tone-${c.tone}`} data-cursor="View">
            <span className="hg-num" aria-hidden="true">
              0{i + 1}
            </span>
            <div className="hg-img">
              <img src={c.img.src} width={c.img.width} height={c.img.height} alt={c.alt} loading="lazy" decoding="async" />
            </div>
            <div className="hg-copy">
              <span className="hg-kicker">{c.kicker}</span>
              <h3>{c.title}</h3>
              <p>{c.text}</p>
              <span className="hg-go">
                Explore <ArrowRight />
              </span>
            </div>
            <span className="render-note">Illustration</span>
          </Link>
        ))}
      </HorizontalGallery>

      {/* ------------------------------------------------ catering */}
      <section className="cater">
        <div className="container cater-grid">
          <div className="cater-copy">
            <p className="eyebrow">Catering & occasions</p>
            <h2>Feeding a crowd?</h2>
            <div className="cater-stat">
              <strong>{p.count}</strong>
              <span>
                mini bagels
                <br />
                per platter · £{p.price}
              </span>
            </div>
            <p className="cater-text">
              Filled with {p.fillings.map((f) => f.toLowerCase()).join(", ").replace(/, ([^,]*)$/, " and $1")}. Hot platters and mini desserts too.
            </p>
            <p className="cater-lead">
              <strong>Order 48 hours ahead.</strong> {catering.collection} {catering.lastMinute}
            </p>
            <div className="cater-actions">
              <a className="btn" href={ordering.catering} target="_blank" rel="noopener">
                Order catering <ArrowUpRight />
              </a>
              <Link className="btn btn-ghost" to="/catering">
                Plan your platters
              </Link>
            </div>
          </div>
          <div className="cater-visual">
            <div ref={platterRef} className="cater-platter">
              <img src={renders.platter.src} width={renders.platter.width} height={renders.platter.height} alt="Illustration of a catering platter of 25 filled mini bagels on a wooden board" loading="lazy" />
            </div>
            <span className="render-note">Illustration · price from Roni's platters menu</span>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------ locations */}
      <section id="find" className="find container">
        <div className="find-head">
          <p className="eyebrow">Find your Roni's</p>
          <h2>
            {locations.length} bakeries.
            <br />
            <em>North London.</em>
          </h2>
          <p className="lede">Open now or not, how to get there, and how to order from each one.</p>
        </div>
        <LocationStack />
        <Link to="/locations" className="btn btn-ghost find-all">
          <Pin />
          All locations & map
        </Link>
      </section>

      {/* ------------------------------------------------ finale */}
      <section className="finale" ref={finaleRef}>
        <BagelToss hostRef={finaleRef} />
        <div className="container finale-copy">
          <p className="finale-kicker">{story.timeline[0].year} → today</p>
          <h2>Your bagel's waiting.</h2>
          <div className="finale-actions">
            <button className="btn btn-gold" onClick={() => openOrder()}>
              <Bag />
              Order now
            </button>
            <Link className="btn btn-light" to="/locations">
              <Pin />
              Find your Roni's
            </Link>
          </div>
          <p className="finale-hint" aria-hidden="true">
            <span className="hint-mouse">Grab a bagel and throw it.</span>
            <span className="hint-touch">Tap a bagel.</span>
          </p>
        </div>
      </section>
    </>
  );
}
