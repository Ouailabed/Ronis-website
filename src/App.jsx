import { useEffect, useRef, useState } from "react";
import BagelPit from "./components/BagelPit";
import Bagel from "./components/Bagel";
import { Arrow, Circle, Underline } from "./components/Scribble";
import { business, fridayMessage, liveMessages, menu, occasions, stores, story } from "./content";
import { formatTime, liveMessage, londonNow, storeStatus } from "./lib/time";

const NAV = [
  { href: "#menu", label: "Menu" },
  { href: "#occasions", label: "Occasions" },
  { href: "#stores", label: "Shops" },
  { href: "#story", label: "Our story" },
];

const mapsUrl = (store) =>
  `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    store.address ? `Roni's ${store.address}` : `Roni's Bakery ${store.name} London`,
  )}`;

// London time, re-checked every 30 seconds
function useLondonNow() {
  const [now, setNow] = useState(() => londonNow());
  useEffect(() => {
    const id = setInterval(() => setNow(londonNow()), 30000);
    return () => clearInterval(id);
  }, []);
  return now;
}

// Adds .is-in to .reveal elements as they scroll into view
function useReveal() {
  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) =>
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("is-in");
            io.unobserve(e.target);
          }
        }),
      { threshold: 0.2 },
    );
    document.querySelectorAll(".reveal").forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);
}

function Logo() {
  return (
    <span className="wordmark">
      R<Bagel size={30} seed={3} className="wordmark-o" />
      ni's
    </span>
  );
}

function LiveStrip({ now }) {
  const text = liveMessage(liveMessages, fridayMessage, now);
  return (
    <div className="live-strip" role="status">
      <span className="pulse" aria-hidden="true" />
      <span className="mono">{formatTime(now.minutes)} in London</span>
      {text && <span className="live-text">— {text}</span>}
    </div>
  );
}

function Header() {
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);
  return (
    <header className={`header${open ? " is-open" : ""}`}>
      <a href="#top" className="logo" onClick={close} aria-label={`${business.fullName} — home`}>
        <Logo />
      </a>
      <nav className="nav" aria-label="Main">
        {NAV.map((item) => (
          <a key={item.href} href={item.href} onClick={close}>
            {item.label}
          </a>
        ))}
        <a className="btn" href={business.onlineOrderUrl} target="_blank" rel="noreferrer">
          Order online
        </a>
      </nav>
      <button className="menu-toggle" aria-label="Menu" aria-expanded={open} onClick={() => setOpen(!open)}>
        {open ? "Close" : "Menu"}
      </button>
    </header>
  );
}

function Hero() {
  const pitRef = useRef(null);
  return (
    <section className="hero" id="top" ref={pitRef}>
      <div className="hero-copy" data-solid>
        <p className="mono label">Est. {business.established} · North London</p>
        <h1>
          Bagels, done the{" "}
          <span className="marked draw">
            proper
            <Underline />
          </span>{" "}
          way.
        </h1>
        <p className="hero-intro">{business.intro}</p>
        <div className="actions">
          <a className="btn btn-big" href={business.onlineOrderUrl} target="_blank" rel="noreferrer">
            Order online
          </a>
          <a className="link" href="#stores">
            Find your nearest shop →
          </a>
        </div>
      </div>
      <p className="hint hand draw" aria-hidden="true">
        <span className="hint-mouse">go on — grab one &amp; throw it</span>
        <span className="hint-touch">tap a bagel!</span>
        <Arrow />
      </p>
      <BagelPit hostRef={pitRef} />
    </section>
  );
}

function Menu() {
  return (
    <section className="section" id="menu">
      <div className="section-head reveal">
        <p className="mono label">The menu</p>
        <h2>What's on the counter</h2>
        <div className="picks" aria-hidden="true">
          {["plain", "sesame", "poppy"].map((v, i) => (
            <figure key={v} className="pick">
              <Bagel size={96} variant={v} seed={40 + i} />
              <figcaption className="hand">{v}</figcaption>
            </figure>
          ))}
        </div>
      </div>
      <div className="board reveal">
        {menu.map((cat) => (
          <div className="board-col" key={cat.category}>
            <h3>{cat.category}</h3>
            <ul>
              {cat.items.map((item) => (
                <li key={item.name} className="item">
                  <div className="item-line">
                    <span className="item-name">{item.name}</span>
                    {item.note && <span className="hand margin-note">← {item.note}</span>}
                    {item.tags?.map((tag) => (
                      <span key={tag} className={`sticker${tag === "Bestseller" ? " sticker-red" : ""}`}>
                        {tag}
                      </span>
                    ))}
                    {item.price && (
                      <>
                        <span className="dots" aria-hidden="true" />
                        <span className="price">{item.price}</span>
                      </>
                    )}
                  </div>
                  {item.description && <p>{item.description}</p>}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
}

function Occasions() {
  return (
    <section className="occasions" id="occasions">
      <div className="occasions-inner">
        <div className="reveal">
          <p className="mono label">Cakes · platters · catering</p>
          <h2>{occasions.heading}</h2>
          <p className="big-text">{occasions.intro}</p>
          <a className="btn btn-big btn-paper" href={occasions.ctaUrl} target="_blank" rel="noreferrer">
            {occasions.ctaLabel}
          </a>
        </div>
        <div className="receipt reveal" aria-label="What we cater">
          <p className="receipt-title">{business.fullName.toUpperCase()}</p>
          <p className="receipt-sub">EST. {business.established} · NORTH LONDON</p>
          <p className="receipt-rule">ORDER FOR ANY OCCASION</p>
          <ul>
            {occasions.items.map((item) => (
              <li key={item}>
                <span>1 × {item}</span>
                <span>✓</span>
              </li>
            ))}
          </ul>
          <p className="receipt-total">
            <span>TOTAL</span>
            <span>one happy crowd</span>
          </p>
          <p className="receipt-thanks">*** THANK YOU ***</p>
          <div className="barcode" aria-hidden="true" />
        </div>
      </div>
    </section>
  );
}

function Stores({ now }) {
  return (
    <section className="section" id="stores">
      <div className="section-head reveal">
        <p className="mono label">Come and say hello</p>
        <h2>
          {stores.length} shops, <em>one bagel.</em>
        </h2>
      </div>
      <ol className="store-list">
        {stores.map((store, i) => {
          const status = storeStatus(store.hours, now);
          return (
            <li className="store reveal" key={store.name}>
              <span className="mono store-num">{String(i + 1).padStart(2, "0")}</span>
              <div className="store-name">
                <h3>{store.name}</h3>
                {store.note && <span className="hand">{store.note}</span>}
              </div>
              <div className="store-info">
                {status && (
                  <span className={`status${status.open ? " is-open" : ""}`}>
                    <i aria-hidden="true" />
                    {status.label}
                  </span>
                )}
                {store.address && <span>{store.address}</span>}
                {store.phone && <a href={`tel:${store.phone.replace(/\s/g, "")}`}>{store.phone}</a>}
              </div>
              <div className="store-links">
                <a href={mapsUrl(store)} target="_blank" rel="noreferrer">
                  Directions
                </a>
                {store.deliveroo && (
                  <a href={store.deliveroo} target="_blank" rel="noreferrer">
                    Deliveroo
                  </a>
                )}
              </div>
            </li>
          );
        })}
      </ol>
    </section>
  );
}

function Story() {
  const parts = story.headline.split(/\[(.+?)\]/);
  return (
    <section className="section story" id="story">
      <div className="stamp" aria-hidden="true">
        <svg viewBox="0 0 200 200">
          <defs>
            <path id="stamp-circle" d="M100,100 m-78,0 a78,78 0 1,1 156,0 a78,78 0 1,1 -156,0" />
          </defs>
          <text>
            <textPath href="#stamp-circle">FRESH EVERY DAY · BOILED &amp; BAKED · EST. {business.established} ·</textPath>
          </text>
        </svg>
        <Bagel size={92} variant="sesame" seed={11} className="stamp-bagel" />
      </div>
      <p className="mono label reveal">Our story</p>
      <h2 className="story-headline reveal draw">
        {parts.map((part, i) =>
          i % 2 ? (
            <span className="marked" key={i}>
              {part}
              <Circle />
            </span>
          ) : (
            part
          ),
        )}
      </h2>
      <div className="story-body reveal">
        {story.paragraphs.map((p) => (
          <p key={p.slice(0, 24)}>{p}</p>
        ))}
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="footer">
      <div className="footer-top">
        <p className="footer-cta">
          Hungry yet?{" "}
          <a href={business.onlineOrderUrl} target="_blank" rel="noreferrer">
            Order online →
          </a>
        </p>
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
      <p className="giant" aria-hidden="true">
        R<Bagel size={200} seed={5} variant="poppy" className="giant-o" />
        ni's
      </p>
      <p className="mono footer-small">
        © {new Date().getFullYear()} {business.fullName} · Boiled &amp; baked in North London since {business.established}
      </p>
    </footer>
  );
}

export default function App() {
  const now = useLondonNow();
  useReveal();
  return (
    <>
      <LiveStrip now={now} />
      <Header />
      <main>
        <Hero />
        <Menu />
        <Occasions />
        <Stores now={now} />
        <Story />
      </main>
      <Footer />
    </>
  );
}
