import { useRef } from "react";
import { Link } from "react-router-dom";
import BagelShowSection from "../components/BagelShow";
import BagelToss from "../components/BagelToss";
import { ArrowRight, ArrowUpRight, Bag, Pin } from "../components/Icons";
import LocationFinder from "../components/LocationFinder";
import RenderImage from "../components/RenderImage";
import { catering, locations, ordering, story } from "../data/business";
import renders from "../data/renders";
import { useOrder } from "../lib/order";
import { useSeo } from "../lib/seo";

const SHOWCASE = [
  {
    to: "/menu?category=bagels",
    n: "01",
    kicker: "Bagels",
    title: "Bagels, filled or by the bag",
    text: "Plain, sesame and poppy — or filled with smoked salmon & cream cheese, hot salt beef and more.",
    img: renders["bagels-trio"],
    alt: "Illustration of a plain, a sesame and a poppy seed bagel",
    tone: "blue",
  },
  {
    to: "/menu?category=bakery",
    n: "02",
    kicker: "Baked goods",
    title: "Challah & bakes",
    text: "Roni's own plaited challah, challah rolls, and homemade biscuits and pastries.",
    img: renders.challah,
    alt: "Illustration of a plaited, egg-washed challah loaf",
    tone: "kraft",
  },
  {
    to: "/cakes",
    n: "03",
    kicker: "Cakes",
    title: "Cakes for any occasion",
    text: "Carrot cake by the slice, and bespoke celebration cakes made to order.",
    img: renders["carrot-cake"],
    alt: "Illustration of a layered carrot cake with cream cheese frosting and walnuts, one slice cut",
    tone: "cream",
  },
  {
    to: "/catering",
    n: "04",
    kicker: "Platters",
    title: "Platters for a crowd",
    text: `${catering.miniBagelPlatter.count} mini bagels on one platter — plus hot platters and mini desserts.`,
    img: renders.platter,
    alt: "Illustration of a round wooden board with 25 filled mini bagels",
    tone: "gold",
  },
] as const;

/** Small pointer-tilt for product cards: makes the food feel tangible. */
function tilt(e: React.PointerEvent<HTMLElement>) {
  if (e.pointerType !== "mouse") return;
  const el = e.currentTarget, r = el.getBoundingClientRect();
  el.style.setProperty("--tx", String((e.clientX - r.left) / r.width - 0.5));
  el.style.setProperty("--ty", String((e.clientY - r.top) / r.height - 0.5));
}
function untilt(e: React.PointerEvent<HTMLElement>) {
  e.currentTarget.style.setProperty("--tx", "0");
  e.currentTarget.style.setProperty("--ty", "0");
}

export default function Home() {
  const { openOrder } = useOrder();
  const finaleRef = useRef<HTMLElement>(null);
  useSeo(
    "",
    "Roni's Bagel Bakery: bagels and Jewish baked goods since 1989. Six North London bakeries — West Hampstead, Belsize Village, Hampstead, Swains Lane, Muswell Hill and Brent Cross. Order online, platters and cakes.",
  );
  const p = catering.miniBagelPlatter;

  return (
    <>
      <BagelShowSection />

      {/* ------------------------------------------------ food showcase */}
      <section id="showcase" className="section showcase">
        <div className="container">
          <div className="section-head split reveal">
            <div>
              <p className="eyebrow">Fresh from Roni's</p>
              <h2>
                The bakery counter, <em>every morning.</em>
              </h2>
            </div>
            <p className="lede">Fresh hot bagels, breads, pastries, cakes, breakfasts, salads and coffee — the Roni's counter, from the first bagel of the day.</p>
          </div>
          <div className="showcase-grid">
            {SHOWCASE.map((c) => (
              <Link key={c.n} to={c.to} className={`food-card tone-${c.tone} reveal`} onPointerMove={tilt} onPointerLeave={untilt}>
                <span className="food-card-n">{c.n}</span>
                <div className="food-card-img">
                  <RenderImage src={c.img.src} width={c.img.width} height={c.img.height} alt={c.alt} />
                </div>
                <div className="food-card-copy">
                  <span className="food-card-kicker">{c.kicker}</span>
                  <h3>{c.title}</h3>
                  <p>{c.text}</p>
                  <span className="food-card-go">
                    Explore <ArrowRight />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ------------------------------------------------ story */}
      <section className="section story-teaser">
        <div className="container story-grid">
          <div className="story-year reveal" aria-hidden="true">
            <span>19</span>
            <span>89</span>
          </div>
          <div className="story-copy reveal">
            <p className="eyebrow">Our story</p>
            <h2>
              It started on <em>West End Lane.</em>
            </h2>
            <p className="lede">{story.intro}</p>
            <p>{story.reputation}</p>
            <ol className="mini-timeline">
              {story.timeline.map((t) => (
                <li key={t.year}>
                  <strong>{t.year}</strong>
                  <span>{t.title}</span>
                </li>
              ))}
            </ol>
            <Link to="/about" className="link-arrow">
              Read the Roni's story <ArrowRight className="icon-inline" />
            </Link>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------ catering */}
      <section className="catering-band">
        <div className="container catering-grid">
          <div className="catering-copy reveal">
            <p className="eyebrow">Catering & occasions</p>
            <h2>
              Feeding a crowd? <em>We've got platters.</em>
            </h2>
            <div className="platter-stat">
              <strong>{p.count}</strong>
              <span>
                mini bagels
                <br />
                per platter · £{p.price}
              </span>
            </div>
            <p>
              Filled with {p.fillings.map((f) => f.toLowerCase()).join(", ").replace(/, ([^,]*)$/, " and $1")}. Hot platters and mini desserts too.
            </p>
            <div className="lead-time">
              <strong>Order 48 hours ahead.</strong> {catering.collection} {catering.lastMinute}
            </div>
            <div className="catering-actions">
              <a className="btn" href={ordering.catering} target="_blank" rel="noopener">
                Order catering <ArrowUpRight />
              </a>
              <Link className="btn btn-ghost" to="/catering">
                Plan your platters
              </Link>
            </div>
          </div>
          <div className="catering-visual reveal">
            <RenderImage src={renders.platter.src} width={renders.platter.width} height={renders.platter.height} alt="Illustration of a catering platter of 25 filled mini bagels on a wooden board" />
            <span className="paper-tag">Price from Roni's platters menu. Confirm when ordering.</span>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------ find a bakery */}
      <section id="find" className="section find">
        <div className="container">
          <div className="section-head split reveal">
            <div>
              <p className="eyebrow">Find your Roni's</p>
              <h2>
                {locations.length} bakeries across <em>North London.</em>
              </h2>
            </div>
            <p className="lede">See what's open right now, get directions, or order from the shop nearest you.</p>
          </div>
          <div className="reveal">
            <LocationFinder />
          </div>
        </div>
      </section>

      {/* ------------------------------------------------ finale */}
      <section className="finale" ref={finaleRef}>
        <BagelToss hostRef={finaleRef} />
        <div className="container finale-copy">
          <p className="eyebrow">Fresh from Roni's</p>
          <h2>
            Your bagel's <em>waiting.</em>
          </h2>
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
            <span className="hint-mouse">Go on — grab a bagel and throw it.</span>
            <span className="hint-touch">Tap a bagel.</span>
          </p>
        </div>
      </section>
    </>
  );
}
