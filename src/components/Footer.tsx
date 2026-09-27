import { Link } from "react-router-dom";
import { brand, LAST_CHECKED, locations, ordering } from "../data/business";
import { telHref } from "../lib/hours";
import { useOrder } from "../lib/order";
import { ArrowUpRight, Facebook, Instagram } from "./Icons";

export default function Footer() {
  const { openOrder } = useOrder();
  return (
    <footer className="footer on-dark">
      <div className="container footer-grid">
        <div className="footer-brand">
          <p className="footer-mark display">Roni's</p>
          <p className="muted">Bagels and Jewish baked goods, North London, since {brand.founded}.</p>
        </div>
        <div className="footer-col footer-shops">
          <h2 className="label muted">Bakeries</h2>
          <ul>
            {locations.map((l) => (
              <li key={l.slug}>
                <Link to={`/locations/${l.slug}`}>{l.name}</Link>
                <a href={telHref(l.phone)} className="tnum muted" aria-label={`Call Roni's ${l.name} on ${l.phone}`}>
                  {l.phone}
                </a>
              </li>
            ))}
          </ul>
        </div>
        <div className="footer-col">
          <h2 className="label muted">Order</h2>
          <ul>
            <li>
              <button onClick={() => openOrder()}>Order now</button>
            </li>
            <li>
              <a href={ordering.online} target="_blank" rel="noopener">
                Online ordering <ArrowUpRight className="icon-inline" />
              </a>
            </li>
            <li>
              <Link to="/catering">Catering &amp; platters</Link>
            </li>
            <li>
              <Link to="/cakes">Cakes</Link>
            </li>
          </ul>
        </div>
        <div className="footer-col">
          <h2 className="label muted">Roni's</h2>
          <ul>
            <li>
              <Link to="/menu">Menu</Link>
            </li>
            <li>
              <Link to="/about">About</Link>
            </li>
            <li>
              <Link to="/locations">Locations</Link>
            </li>
            <li>
              <Link to="/contact">Contact</Link>
            </li>
            <li>
              <a href={ordering.review} target="_blank" rel="noopener">
                Leave a review <ArrowUpRight className="icon-inline" />
              </a>
            </li>
          </ul>
          <div className="footer-social">
            <a href={brand.instagram} target="_blank" rel="noopener" aria-label="Roni's on Instagram">
              <Instagram />
            </a>
            <a href={brand.facebook} target="_blank" rel="noopener" aria-label="Roni's on Facebook">
              <Facebook />
            </a>
          </div>
        </div>
      </div>
      <div className="container footer-base">
        <p>
          © {new Date().getFullYear()} {brand.legalName}. Shop details from ronisonline.co.uk, checked {LAST_CHECKED}.
        </p>
        <p>Food images are illustrations, not photographs of Roni's products.</p>
      </div>
    </footer>
  );
}
