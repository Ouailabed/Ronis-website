import { Link } from "react-router-dom";
import { brand, LAST_CHECKED, locations, ordering } from "../data/business";
import { telHref } from "../lib/hours";
import { useOrder } from "../lib/order";
import { NAV } from "./Header";
import { ArrowUpRight, Facebook, Instagram } from "./Icons";
import Logo from "./Logo";

export default function Footer() {
  const { openOrder } = useOrder();
  return (
    <footer className="site-footer">
      <div className="awning footer-awning" aria-hidden="true" /> 
      <div className="container footer-grid">
        <div className="footer-brand">
          <Logo light />
          <p>
            Bagels and Jewish baked goods, made in North London since {brand.founded}.
          </p>
          <div className="footer-social">
            <a href={brand.instagram} target="_blank" rel="noopener" aria-label="Roni's on Instagram">
              <Instagram />
            </a>
            <a href={brand.facebook} target="_blank" rel="noopener" aria-label="Roni's on Facebook">
              <Facebook />
            </a>
          </div>
        </div>
        <div>
          <h2 className="footer-title">Our bakeries</h2>
          <ul className="footer-list">
            {locations.map((l) => (
              <li key={l.slug}>
                <Link to={`/locations/${l.slug}`}>{l.name}</Link>
                <a className="footer-phone" href={telHref(l.phone)}>
                  {l.phone}
                </a>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h2 className="footer-title">Order</h2>
          <ul className="footer-list">
            <li>
              <button className="footer-link-btn" onClick={() => openOrder()}>
                Order now
              </button>
            </li>
            <li>
              <a href={ordering.online} target="_blank" rel="noopener">
                Online ordering <ArrowUpRight className="icon-inline" />
              </a>
            </li>
            <li>
              <Link to="/catering">Catering & platters</Link>
            </li>
            <li>
              <Link to="/cakes">Cakes for any occasion</Link>
            </li>
          </ul>
        </div>
        <div>
          <h2 className="footer-title">Roni's</h2>
          <ul className="footer-list">
            {NAV.filter((n) => !["/catering", "/cakes"].includes(n.to)).map((n) => (
              <li key={n.to}>
                <Link to={n.to}>{n.label}</Link>
              </li>
            ))}
            <li>
              <a href={ordering.review} target="_blank" rel="noopener">
                Leave a review <ArrowUpRight className="icon-inline" />
              </a>
            </li>
          </ul>
        </div>
      </div>
      <p className="footer-giant" aria-hidden="true">
        Roni's
      </p>
      <div className="container footer-small">
        <p>
          © {new Date().getFullYear()} {brand.legalName}. Shop details checked against ronisonline.co.uk, {LAST_CHECKED}.
        </p>
        <p>Food images on this site are digital illustrations, not photographs of Roni's products.</p>
      </div>
    </footer>
  );
}
