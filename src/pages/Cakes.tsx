import { Link } from "react-router-dom";
import { ArrowUpRight, Phone } from "../components/Icons";
import RenderImage from "../components/RenderImage";
import { catering, locations, ordering } from "../data/business";
import renders from "../data/renders.json";
import { telHref } from "../lib/hours";
import { useSeo } from "../lib/seo";

export default function Cakes() {
  useSeo("Cakes", "Cakes from Roni's: homemade carrot cake and bespoke cakes for any occasion, ordered online and collected in store.");
  return (
    <>
      <section className="page-hero container page-hero-split">
        <div>
          <p className="eyebrow">Cakes</p>
          <h1>
            Cakes for <em>any occasion.</em>
          </h1>
          <p className="lede">Homemade cakes from the Roni's counter, and bespoke cakes made to order for birthdays, celebrations and get-togethers — collected from your chosen shop.</p>
          <div className="hero-actions">
            <a className="btn" href={ordering.occasions} target="_blank" rel="noopener">
              Order a cake <ArrowUpRight />
            </a>
            <Link className="btn btn-ghost" to="/menu?category=cakes">
              Cakes on the menu
            </Link>
          </div>
        </div>
        <div className="page-hero-art">
          <RenderImage src={renders["carrot-cake"].src} width={renders["carrot-cake"].width} height={renders["carrot-cake"].height} alt="Illustration of a layered carrot cake with cream cheese frosting and walnuts" eager />
        </div>
      </section>

      <section className="container section cakes-grid">
        <article className="cake-card reveal">
          <p className="eyebrow">At the counter</p>
          <h2>Carrot cake</h2>
          <p>A Roni's favourite, alongside homemade biscuits and pastries made from scratch and preservative free.</p>
          <Link to="/menu?category=cakes" className="link-arrow">
            See the menu
          </Link>
        </article>
        <article className="cake-card tone-blue reveal">
          <p className="eyebrow">Made to order</p>
          <h2>Bespoke celebration cakes</h2>
          <p>Order through Roni's “Order for Any Occasion” page and collect in store. For timings on a bespoke cake, check when you order or call your shop.</p>
          <a className="btn btn-light btn-small" href={ordering.occasions} target="_blank" rel="noopener">
            Order for any occasion <ArrowUpRight />
          </a>
        </article>
        <article className="cake-card tone-kraft reveal">
          <p className="eyebrow">For a crowd</p>
          <h2>Mini desserts</h2>
          <p>A selection of signature mini desserts is available with catering orders. {catering.leadTimeText}</p>
          <Link to="/catering" className="link-arrow">
            Catering & platters
          </Link>
        </article>
      </section>

      <section className="container catering-call">
        <h2>
          Questions about <em>a cake?</em>
        </h2>
        <p className="lede">Call the shop you'd like to collect from.</p>
        <ul className="call-grid">
          {locations.map((l) => (
            <li key={l.slug}>
              <a href={telHref(l.phone)}>
                <Phone />
                <span>
                  <strong>{l.name}</strong>
                  <span>{l.phone}</span>
                </span>
              </a>
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}
