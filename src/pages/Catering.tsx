import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowUpRight, Phone } from "../components/Icons";
import EventPlanner from "../components/EventPlanner";
import RenderImage from "../components/RenderImage";
import { catering, locations, ordering } from "../data/business";
import renders from "../data/renders";
import { telHref } from "../lib/hours";
import { useSeo } from "../lib/seo";


/** Planning guide only — based on the published platter size and price. */
function PlatterPlanner() {
  const [guests, setGuests] = useState(30);
  const [perGuest, setPerGuest] = useState(2);
  const p = catering.miniBagelPlatter;
  const minis = guests * perGuest;
  const platters = Math.max(1, Math.ceil(minis / p.count));
  return (
    <div className="planner">
      <h3>Platter planner</h3>
      <div className="planner-field">
        <label htmlFor="guests">
          Guests <output htmlFor="guests">{guests}</output>
        </label>
        <input id="guests" type="range" min={5} max={200} step={5} value={guests} onChange={(e) => setGuests(Number(e.target.value))} />
      </div>
      <fieldset className="planner-field planner-choice">
        <legend>Mini bagels per guest</legend>
        {[1, 2, 3, 4].map((n) => (
          <label key={n} className={perGuest === n ? "is-active" : undefined}>
            <input type="radio" name="per-guest" value={n} checked={perGuest === n} onChange={() => setPerGuest(n)} />
            {n}
          </label>
        ))}
      </fieldset>
      <div className="planner-result" aria-live="polite">
        <p>
          <strong>{platters}</strong> mini bagel {platters === 1 ? "platter" : "platters"}
        </p>
        <p className="small">
          {platters * p.count} mini bagels for {minis} needed · guide price £{platters * p.price} at £{p.price} per platter
        </p>
      </div>
      <p className="small planner-note">A planning guide based on Roni's published platter menu. Your order and price are confirmed by Roni's.</p>
    </div>
  );
}

export default function Catering() {
  useSeo(
    "Catering & platters",
    "Roni's catering: mini bagel platters (25 mini bagels), hot platters and mini desserts. Order online at least 48 hours ahead and collect from your chosen Roni's.",
  );
  const p = catering.miniBagelPlatter;
  return (
    <>
      <section className="page-hero container page-hero-split">
        <div>
          <p className="eyebrow">Catering & platters</p>
          <h1>
            Platters for <em>a crowd.</em>
          </h1>
          <p className="lede">Mini bagel platters, hot platters and mini desserts — ordered online and collected from your chosen Roni's.</p>
          <div className="hero-actions">
            <a className="btn" href={ordering.catering} target="_blank" rel="noopener">
              Order catering online <ArrowUpRight />
            </a>
            <a className="btn btn-ghost" href={ordering.plattersMenu} target="_blank" rel="noopener">
              See the platters menu <ArrowUpRight />
            </a>
          </div>
        </div>
        <div className="page-hero-art">
          <RenderImage src={renders.platter.src} width={renders.platter.width} height={renders.platter.height} alt="Illustration of a platter of 25 filled mini bagels" eager />
        </div>
      </section>

      <section className="container catering-steps-wrap">
        <ol className="catering-steps">
          <li>
            <span className="step-n">1</span>
            <h2>Order 48 hours ahead</h2>
            <p>{catering.leadTimeText} Order online through Roni's catering page.</p>
          </li>
          <li>
            <span className="step-n">2</span>
            <h2>Collect in store</h2>
            <p>{catering.collection}</p>
          </li>
          <li>
            <span className="step-n">3</span>
            <h2>Short notice?</h2>
            <p>{catering.lastMinute}</p>
          </li>
        </ol>
        <EventPlanner />
      </section>

      <section className="container section catering-menu">
        <div className="catering-menu-grid">
          <div>
            <p className="eyebrow">On the platters</p>
            <h2>
              {p.count} mini bagels, <em>£{p.price}.</em>
            </h2>
            <p className="lede">A mix of {p.count} mini bagels filled with:</p>
            <ul className="filling-list">
              {p.fillings.map((f) => (
                <li key={f}>{f}</li>
              ))}
            </ul>
            <h3 className="catering-sub">Also for catering</h3>
            <ul className="catering-others">
              {catering.otherPlatters.map((o) => (
                <li key={o.name}>
                  <strong>{o.name}</strong>
                  <span>{o.note}</span>
                </li>
              ))}
            </ul>
            <p className="small">{catering.dietary} Price from Roni's platters menu — please confirm when ordering.</p>
          </div>
          <PlatterPlanner />
        </div>
      </section>

      <section className="container catering-call">
        <h2>
          Call your <em>Roni's</em>
        </h2>
        <p className="lede">For last-minute orders or questions about your platters, call the shop you'll collect from.</p>
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
        <p className="small">
          Cakes too? See <Link to="/cakes">cakes for any occasion</Link>.
        </p>
      </section>
    </>
  );
}
