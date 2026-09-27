import { useEffect, useRef, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { brand, locations } from "../data/business";
import { lockScroll } from "../lib/motion";
import { useOrder } from "../lib/order";
import { useOpenNow } from "../lib/useOpenNow";
import { ArrowRight, Instagram } from "./Icons";

export const NAV = [
  { to: "/menu", label: "Menu" },
  { to: "/about", label: "About" },
  { to: "/locations", label: "Location" },
];
const MORE = [
  { to: "/catering", label: "Catering" },
  { to: "/cakes", label: "Cakes" },
  { to: "/contact", label: "Contact" },
];

export function Wordmark() {
  return <span className="wordmark">Roni's</span>;
}

/**
 * Minimal bar: wordmark, three links, and an Order block that never goes away.
 * It tucks itself away while you read down the page and comes back when you scroll up;
 * while it's tucked away a small Order tab stays in the corner. On phones the links
 * live in a full-screen menu.
 */
export default function Header() {
  const { openOrder } = useOrder();
  const { pathname } = useLocation();
  const { open, summary } = useOpenNow();
  const [over, setOver] = useState(pathname === "/");
  const [hidden, setHidden] = useState(false);
  const [moved, setMoved] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => setMenuOpen(false), [pathname]);

  useEffect(() => {
    let frame = 0;
    let lastY = window.scrollY;
    const update = () => {
      frame = 0;
      const y = window.scrollY;
      const hero = pathname === "/" ? document.querySelector<HTMLElement>("[data-hero]") : null;
      setOver(!!hero && hero.getBoundingClientRect().bottom > 64);
      setMoved(y > 20);
      if (Math.abs(y - lastY) > 6) {
        setHidden(y > lastY && y > window.innerHeight * 0.6);
        lastY = y;
      }
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [pathname]);

  useEffect(() => {
    lockScroll(menuOpen);
    if (!menuOpen) return;
    menuRef.current?.querySelector<HTMLElement>("a, button")?.focus();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setMenuOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [menuOpen]);

  return (
    <>
      <a
        href="#main"
        className="skip-link"
        onClick={(e) => {
          e.preventDefault();
          document.getElementById("main")?.focus();
        }}
      >
        Skip to content
      </a>
      <header className={`nav${over ? " is-over" : ""}${over && moved ? " is-solid" : ""}${hidden && !menuOpen ? " is-hidden" : ""}`}>
        <Link to="/" className="nav-brand" aria-label="Roni's Bagel Bakery — home">
          <Wordmark />
          <span className="nav-since">Bagel Bakery · {brand.founded}</span>
        </Link>
        <nav className="nav-links" aria-label="Main">
          {NAV.map((n) => (
            <NavLink key={n.to} to={n.to} className={({ isActive }) => (isActive ? "is-active" : undefined)}>
              {n.label}
            </NavLink>
          ))}
        </nav>
        <Link to="/locations" className={`nav-live status${open.length ? " is-open" : ""}`}>
          <i aria-hidden="true" />
          {summary}
        </Link>
        <button className="nav-menu" aria-expanded={menuOpen} aria-controls="site-menu" onClick={() => setMenuOpen(true)}>
          Menu
        </button>
        <button className="nav-order" onClick={() => openOrder()}>
          Order
        </button>
      </header>

      {/* Order stays one tap away while the bar is tucked away */}
      <button className={`order-tab${hidden && !menuOpen ? " is-shown" : ""}`} onClick={() => openOrder()} tabIndex={hidden ? 0 : -1} aria-hidden={!hidden}>
        Order <ArrowRight />
      </button>

      <div id="site-menu" ref={menuRef} className={`site-menu on-dark${menuOpen ? " is-open" : ""}`} role="dialog" aria-modal="true" aria-label="Menu" hidden={!menuOpen}>
        <div className="site-menu-top">
          <Wordmark />
          <button className="nav-menu" onClick={() => setMenuOpen(false)}>
            Close
          </button>
        </div>
        <nav className="site-menu-links" aria-label="Site">
          {[{ to: "/", label: "Home" }, ...NAV, ...MORE].map((n, i) => (
            <NavLink key={n.to} to={n.to} end style={{ ["--i" as string]: i }}>
              <span className="label tnum">{String(i + 1).padStart(2, "0")}</span>
              {n.label}
            </NavLink>
          ))}
        </nav>
        <div className="site-menu-foot">
          <p className={`status${open.length ? " is-open" : ""}`}>
            <i aria-hidden="true" />
            {summary}
          </p>
          <button
            className="btn btn-blue btn-big"
            onClick={() => {
              setMenuOpen(false);
              openOrder();
            }}
          >
            Order now <ArrowRight />
          </button>
          <p className="small muted">
            {locations.length} bakeries across North London ·{" "}
            <a href={brand.instagram} target="_blank" rel="noopener" className="link">
              <Instagram /> Instagram
            </a>
          </p>
        </div>
      </div>
    </>
  );
}
