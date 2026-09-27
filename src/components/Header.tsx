import { useEffect, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { useOrder } from "../lib/order";

export const NAV = [
  { to: "/menu", label: "Menu" },
  { to: "/about", label: "About", wide: true },
  { to: "/locations", label: "Locations", wide: true },
];

export function Wordmark({ sub = true }: { sub?: boolean }) {
  return (
    <span className="wordmark">
      <span className="wordmark-name">Roni's</span>
      {sub && <span className="wordmark-sub">Bagel Bakery</span>}
    </span>
  );
}

export default function Header() {
  const { openOrder } = useOrder();
  const { pathname } = useLocation();
  // on the home page the header sits on the photograph until the hero has scrolled away
  const [over, setOver] = useState(pathname === "/");
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    if (pathname !== "/") {
      setOver(false);
      return;
    }
    let frame = 0;
    const update = () => {
      frame = 0;
      const hero = document.querySelector<HTMLElement>("[data-hero]");
      const h = parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--header-h")) || 64;
      setOver(!!hero && hero.getBoundingClientRect().bottom > h);
      setScrolled(window.scrollY > 24);
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
      <header className={`site-header${over ? " is-over" : ""}${over && scrolled ? " is-scrolled" : ""}`}>
        <div className="container header-inner">
          <Link to="/" aria-label="Roni's Bagel Bakery — home">
            <Wordmark />
          </Link>
          <nav className="header-nav" aria-label="Main">
            {NAV.map((n) => (
              <NavLink key={n.to} to={n.to} className={({ isActive }) => `${n.wide ? "nav-wide" : ""}${isActive ? " is-active" : ""}`.trim() || undefined}>
                {n.label}
              </NavLink>
            ))}
            <button className="btn" onClick={() => openOrder()}>
              Order
            </button>
          </nav>
        </div>
      </header>
    </>
  );
}
