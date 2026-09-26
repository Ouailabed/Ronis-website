import { useEffect, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { useOrder } from "../lib/order";
import { Bag, Close, Menu, Pin } from "./Icons";
import Logo from "./Logo";

export const NAV = [
  { to: "/menu", label: "Menu" },
  { to: "/locations", label: "Locations" },
  { to: "/catering", label: "Catering" },
  { to: "/cakes", label: "Cakes" },
  { to: "/about", label: "About" },
  { to: "/contact", label: "Contact" },
];

export default function Header() {
  const { openOrder } = useOrder();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { pathname } = useLocation();

  useEffect(() => setOpen(false), [pathname]);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <>
      <a href="#main" className="skip-link">
        Skip to content
      </a>
      <header className={`site-header${scrolled ? " is-scrolled" : ""}${open ? " is-open" : ""}`}>
        <div className="header-inner">
          <Link to="/" className="header-logo" aria-label="Roni's Bagel Bakery — home">
            <Logo />
          </Link>
          <nav className="header-nav" aria-label="Main">
            {NAV.map((n) => (
              <NavLink key={n.to} to={n.to} className={({ isActive }) => (isActive ? "is-active" : undefined)}>
                {n.label}
              </NavLink>
            ))}
          </nav>
          <div className="header-actions">
            <button className="btn btn-small" onClick={() => openOrder()}>
              <Bag />
              Order now
            </button>
            <button className="icon-btn menu-toggle" aria-expanded={open} aria-controls="mobile-menu" onClick={() => setOpen(!open)} aria-label={open ? "Close menu" : "Open menu"}>
              {open ? <Close /> : <Menu />}
            </button>
          </div>
        </div>
        <div id="mobile-menu" className="mobile-menu" hidden={!open}>
          <nav aria-label="Mobile">
            <NavLink to="/" end>
              Home
            </NavLink>
            {NAV.map((n) => (
              <NavLink key={n.to} to={n.to}>
                {n.label}
              </NavLink>
            ))}
          </nav>
        </div>
      </header>

      {/* always-reachable actions on phones */}
      <div className="mobile-bar" role="region" aria-label="Quick actions">
        <Link to="/locations" className="btn btn-ghost btn-small">
          <Pin />
          Find a Roni's
        </Link>
        <button className="btn btn-small" onClick={() => openOrder()}>
          <Bag />
          Order now
        </button>
      </div>
    </>
  );
}
