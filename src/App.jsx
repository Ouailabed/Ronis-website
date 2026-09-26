import { lazy, Suspense, useEffect, useState } from "react";
import { RibbonFieldBackground } from "@designcodeio/threeui/components/RibbonFieldBackground";
import { business, marquee, story, menu, occasions, stores } from "./content";

// three.js is large, so the 3D bagel loads after the page text is visible
const Bagel3D = lazy(() => import("./components/Bagel3D"));

const NAV = [
  { href: "#menu", label: "Menu" },
  { href: "#occasions", label: "Occasions" },
  { href: "#stores", label: "Stores" },
  { href: "#story", label: "Our story" },
];

const mapsUrl = (store) =>
  `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    store.address ? `Roni's ${store.address}` : `Roni's Bakery ${store.name} London`,
  )}`;

function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header className={`header${scrolled ? " is-scrolled" : ""}${open ? " is-open" : ""}`}>
      <a href="#top" className="logo" onClick={() => setOpen(false)}>
        {business.name}
        <span>Bagel Bakery</span>
      </a>
      <nav className="nav" aria-label="Main">
        {NAV.map((item) => (
          <a key={item.href} href={item.href} onClick={() => setOpen(false)}>
            {item.label}
          </a>
        ))}
        <a className="btn btn-small" href={business.onlineOrderUrl} target="_blank" rel="noreferrer">
          Order online
        </a>
      </nav>
      <button className="menu-toggle" aria-label="Toggle menu" aria-expanded={open} onClick={() => setOpen(!open)}>
        <span />
        <span />
      </button>
    </header>
  );
}

function Hero() {
  return (
    <section className="hero" id="top">
      <div className="hero-bg">
        {/* ThreeUI Community background, recoloured to warm oven tones */}
        <RibbonFieldBackground hue={175} saturation={0.85} brightness={1.05} opacity={0.9} speed={0.6} />
      </div>
      <div className="hero-inner">
        <div className="hero-copy">
          <p className="eyebrow">North London · Since 1989</p>
          <h1>
            Proper bagels,
            <br />
            <em>boiled &amp; baked.</em>
          </h1>
          <p className="lede">{business.intro}</p>
          <div className="hero-actions">
            <a className="btn" href={business.onlineOrderUrl} target="_blank" rel="noreferrer">
              Order online
            </a>
            <a className="btn btn-ghost" href="#stores">
              Find a store
            </a>
          </div>
        </div>
        <div className="hero-visual">
          <Suspense fallback={null}>
            <Bagel3D />
          </Suspense>
        </div>
      </div>
    </section>
  );
}

function Marquee() {
  const row = [...marquee, ...marquee];
  return (
    <div className="marquee" aria-hidden="true">
      <div className="marquee-track">
        {row.map((text, i) => (
          <span key={i}>
            {text}
            <i>✦</i>
          </span>
        ))}
      </div>
    </div>
  );
}

function Menu() {
  const [active, setActive] = useState(0);
  const current = menu[active];
  return (
    <section className="section" id="menu">
      <div className="section-head">
        <p className="eyebrow">The menu</p>
        <h2>Made fresh, every morning</h2>
      </div>
      <div className="tabs" role="tablist">
        {menu.map((cat, i) => (
          <button key={cat.category} role="tab" aria-selected={i === active} className={i === active ? "is-active" : ""} onClick={() => setActive(i)}>
            {cat.category}
          </button>
        ))}
      </div>
      <div className="menu-grid" key={current.category}>
        {current.items.map((item) => (
          <article className="menu-card" key={item.name}>
            {item.image && <img src={item.image} alt={item.name} loading="lazy" />}
            <div className="menu-card-top">
              <h3>{item.name}</h3>
              {item.price && <span className="price">{item.price}</span>}
            </div>
            {item.description && <p>{item.description}</p>}
            {item.tags?.length > 0 && (
              <div className="tags">
                {item.tags.map((tag) => (
                  <span key={tag}>{tag}</span>
                ))}
              </div>
            )}
          </article>
        ))}
      </div>
    </section>
  );
}

function Occasions() {
  return (
    <section className="section occasions" id="occasions">
      <div className="occasions-inner">
        <div>
          <p className="eyebrow">Cakes · Platters · Catering</p>
          <h2>{occasions.heading}</h2>
          <p className="lede">{occasions.intro}</p>
          <a className="btn" href={occasions.ctaUrl} target="_blank" rel="noreferrer">
            {occasions.ctaLabel}
          </a>
        </div>
        <div className="occasion-list">
          {occasions.items.map((item, i) => (
            <div className="occasion" key={item.title}>
              <span className="num">0{i + 1}</span>
              <div>
                <h3>{item.title}</h3>
                <p>{item.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Stores() {
  return (
    <section className="section" id="stores">
      <div className="section-head">
        <p className="eyebrow">Visit us</p>
        <h2>{stores.length} stores across North London</h2>
      </div>
      <div className="store-grid">
        {stores.map((store) => (
          <article className="store-card" key={store.name}>
            <h3>{store.name}</h3>
            {store.since && <p className="since">{store.since}</p>}
            {store.address && <p>{store.address}</p>}
            {store.phone && (
              <p>
                <a href={`tel:${store.phone.replace(/\s/g, "")}`}>{store.phone}</a>
              </p>
            )}
            {store.hours?.length > 0 && (
              <dl className="hours">
                {store.hours.map((h) => (
                  <div key={h.days}>
                    <dt>{h.days}</dt>
                    <dd>{h.time}</dd>
                  </div>
                ))}
              </dl>
            )}
            <div className="store-links">
              <a href={mapsUrl(store)} target="_blank" rel="noreferrer">
                Directions →
              </a>
              {store.deliveroo && (
                <a href={store.deliveroo} target="_blank" rel="noreferrer">
                  Deliveroo →
                </a>
              )}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function Story() {
  return (
    <section className="section story" id="story">
      <div className="story-inner">
        <div>
          <p className="eyebrow">Our story</p>
          <h2>{story.heading}</h2>
        </div>
        <div>
          {story.paragraphs.map((p) => (
            <p key={p.slice(0, 20)}>{p}</p>
          ))}
          <div className="stats">
            {story.stats.map((s) => (
              <div key={s.label}>
                <strong>{s.value}</strong>
                <span>{s.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="footer">
      <div className="footer-cta">
        <h2>
          Hungry? <em>Your bagel's waiting.</em>
        </h2>
        <a className="btn" href={business.onlineOrderUrl} target="_blank" rel="noreferrer">
          Order online
        </a>
      </div>
      <div className="footer-bottom">
        <span>
          © {new Date().getFullYear()} {business.fullName}
        </span>
        <div className="footer-links">
          {business.instagram && (
            <a href={business.instagram} target="_blank" rel="noreferrer">
              Instagram
            </a>
          )}
          {business.facebook && (
            <a href={business.facebook} target="_blank" rel="noreferrer">
              Facebook
            </a>
          )}
          {business.email && <a href={`mailto:${business.email}`}>{business.email}</a>}
        </div>
      </div>
    </footer>
  );
}

export default function App() {
  return (
    <>
      <Header />
      <main>
        <Hero />
        <Marquee />
        <Menu />
        <Occasions />
        <Stores />
        <Story />
      </main>
      <Footer />
    </>
  );
}
