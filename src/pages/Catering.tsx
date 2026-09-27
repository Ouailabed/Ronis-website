import { useState } from "react";
import { Link } from "react-router-dom";
import CallGrid from "../components/CallGrid";
import EventPlanner from "../components/EventPlanner";
import { ArrowRight, ArrowUpRight } from "../components/Icons";
import Photo from "../components/Photo";
import { catering, ordering } from "../data/business";
import { useSeo } from "../lib/seo";

/** Planning guide only — based on the published platter size and price. */
function PlatterPlanner() {
  const [guests, setGuests] = useState(30);
  const [perGuest, setPerGuest] = useState(2);
  const p = catering.miniBagelPlatter;
  const minis = guests * perGuest;
  const platters = Math.max(1, Math.ceil(minis / p.count));
  return (
    <div className="panel planner">
      <h3 className="serif">Platter planner</h3>
      <div className="field">
        <label htmlFor="guests">
          Guests <output htmlFor="guests">{guests}</output>
        </label>
        <input id="guests" type="range" min={5} max={200} step={5} value={guests} onChange={(e) => setGuests(Number(e.target.value))} />
      </div>
      <fieldset className="field">
        <legend>Mini bagels per guest</legend>
        <div className="chips">
          {[1, 2, 3, 4].map((n) => (
            <label key={n} className={`chip${perGuest === n ? " is-active" : ""}`}>
              <input type="radio" name="per-guest" value={n} checked={perGuest === n} onChange={() => setPerGuest(n)} className="visually-hidden" />
              {n}
            </label>
          ))}
        </div>
      </fieldset>
      <div className="planner-result" aria-live="polite">
        <p className="planner-big serif">
          {platters} {platters === 1 ? "platter" : "platters"}
        </p>
        <p className="small muted tnum">
          {platters * p.count} mini bagels for {minis} needed · guide price £{platters * p.price} at £{p.price} per platter
        </p>
      </div>
      <p className="small muted">A planning guide based on Roni's published platter menu. Your order and price are confirmed by Roni's.</p>
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
      <header className="container page-head page-split">
        <div>
          <p className="label">
            <span>Roni's</span>
            <span>Catering &amp; platters</span>
          </p>
          <h1 className="reveal-lines">
            <span className="line">
              <span>Platters for</span>
            </span>
            <span className="line" style={{ ["--i" as string]: 1 }}>
              <span>
                <em>a crowd.</em>
              </span>
            </span>
          </h1>
          <p className="lede">Mini bagel platters, hot platters and mini desserts — ordered online and collected from your chosen Roni's.</p>
          <div className="page-head-actions">
            <a className="btn" href={ordering.catering} target="_blank" rel="noopener">
              Order catering <ArrowUpRight />
            </a>
            <a className="btn btn-line" href={ordering.plattersMenu} target="_blank" rel="noopener">
              Platters menu <ArrowUpRight />
            </a>
          </div>
        </div>
        <Photo name="platter" sizes="(min-width: 821px) 45vw, 100vw" priority className="page-split-photo" />
      </header>

      <section className="container section-tight">
        <ol className="steps">
          <li>
            <span className="steps-n serif">1</span>
            <h2 className="h3">Order 48 hours ahead</h2>
            <p className="muted">{catering.leadTimeText} Order online through Roni's catering page.</p>
          </li>
          <li>
            <span className="steps-n serif">2</span>
            <h2 className="h3">Collect in store</h2>
            <p className="muted">{catering.collection}</p>
          </li>
          <li>
            <span className="steps-n serif">3</span>
            <h2 className="h3">Short notice?</h2>
            <p className="muted">{catering.lastMinute}</p>
          </li>
        </ol>
      </section>

      <section className="container section" aria-labelledby="platter-h">
        <header className="sec-head">
          <p className="label">
            <span>—</span>
            <span>On the platters</span>
          </p>
          <h2 id="platter-h">
            {p.count} mini bagels, <em>£{p.price}.</em>
          </h2>
        </header>
        <div className="catering-grid">
          <div>
            <p className="lede">A mix of {p.count} mini bagels filled with:</p>
            <ul className="rule-list">
              {p.fillings.map((f) => (
                <li key={f} className="serif">
                  {f}
                </li>
              ))}
            </ul>
            <h3 className="label catering-sub">Also for catering</h3>
            <ul className="rule-list rule-list-small">
              {catering.otherPlatters.map((o) => (
                <li key={o.name}>
                  <strong>{o.name}</strong>
                  <span className="small muted">{o.note}</span>
                </li>
              ))}
            </ul>
            <p className="small muted">{catering.dietary} Price from Roni's platters menu — please confirm when ordering.</p>
          </div>
          <div className="catering-tools">
            <PlatterPlanner />
            <EventPlanner />
          </div>
        </div>
      </section>

      <section className="container section" aria-labelledby="call-h">
        <header className="sec-head">
          <p className="label">
            <span>—</span>
            <span>Questions</span>
          </p>
          <h2 id="call-h">
            Call your <em>Roni's.</em>
          </h2>
          <p className="sec-intro muted">For last-minute orders or questions about your platters, call the shop you'll collect from.</p>
        </header>
        <CallGrid />
        <p className="small call-more">
          Cakes too?{" "}
          <Link className="link" to="/cakes">
            Cakes for any occasion <ArrowRight />
          </Link>
        </p>
      </section>
    </>
  );
}
