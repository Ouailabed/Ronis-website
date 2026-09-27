import { Link } from "react-router-dom";
import { brand, LAST_CHECKED, locations, ordering } from "../data/business";
import { telHref } from "../lib/hours";
import { useOrder } from "../lib/order";
import { Wordmark } from "./Header";
import { ArrowUpRight, Facebook, Instagram } from "./Icons";

export default function Footer() {
  const { openOrder } = useOrder();
  return (
    <footer className="site-footer on-dark">
      <div className="container">
        <div className="footer-top">
          <div className="footer-brand">
            <Link to="/" aria-label="Roni's Bagel Bakery — home">
              <Wordmark sub={false} />
            </Link>
            <p>Bagels and Jewish baked goods, made in North London since {brand.founded}.</p>
            <div className="footer-social">
              <a href={brand.instagram} target="_blank" rel="noopener" aria-label="Roni's on Instagram">
                <Instagram />
              </a>
              <a href={brand.facebook} target="_blank" rel="noopener" aria-label="Roni's on Facebook">
                <Facebook />
              </a>
            </div>
          </div>
          <div className="footer-col footer-col-wide">
            <h2>Visit</h2>
            <ul>
              {locations.map((l) => (
                <li key={l.slug} className="footer-shop">
                  <Link to={`/locations/${l.slug}`}>{l.name}</Link>
                  <a href={telHref(l.phone)} aria-label={`Call Roni's ${l.name} on ${l.phone}`}>
                    <span>{l.phone}</span>
                  </a>
                </li>
              ))}
            </ul>
          </div>
          <div className="footer-col">
            <h2>Order</h2>
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
            <h2>Roni's</h2>
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
          </div>
        </div>
        <div className="footer-base">
          <p>
            © {new Date().getFullYear()} {brand.legalName}. Shop details from ronisonline.co.uk, checked {LAST_CHECKED}.
          </p>
          <p>Food images are illustrations, not photographs of Roni's products.</p>
        </div>
      </div>
    </footer>
  );
}
