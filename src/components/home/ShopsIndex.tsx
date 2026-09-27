import { useState } from "react";
import { Link } from "react-router-dom";
import { locations, type Location } from "../../data/business";
import { directionsUrl, fullAddress, openStatus, telHref, todayHours } from "../../lib/hours";
import { formatKm, useNearest } from "../../lib/nearest";
import { useOrder } from "../../lib/order";
import { useOpenNow } from "../../lib/useOpenNow";
import { ArrowRight, ArrowUpRight, Pin } from "../Icons";
import OpenStatus from "../OpenStatus";
import ShopMap from "../ShopMap";

/** The latest-closing shop, for a line like "West Hampstead is open until midnight, every day." */
function lateShop() {
  const all = locations.filter((l) => l.hours.length === 1 && /mon\s*-\s*sun/i.test(l.hours[0].days));
  return all.sort((a, b) => (b.hours[0].close > a.hours[0].close ? 1 : -1))[0] as Location | undefined;
}

export default function ShopsIndex() {
  const { open, summary } = useOpenNow();
  const late = lateShop();
  return (
    <section className="section shops" id="visit" aria-labelledby="shops-title">
      <div className="container">
        <header className="sec-head">
          <p className="label">
            <span>04</span>
            <span>Visit</span>
          </p>
          <h2 id="shops-title" className="reveal-lines">
            <span className="line">
              <span>Six bakeries across</span>
            </span>
            <span className="line" style={{ ["--i" as string]: 1 }}>
              <span>
                <em>North London.</em>
              </span>
            </span>
          </h2>
          <div className="sec-intro reveal">
            {late && late.hours[0].close === "24:00" && (
              <p className="lede">
                Roni's {late.name}
                {late.opened?.includes("original") ? ", the original," : ""} is open until midnight, every day.
              </p>
            )}
            <p className={`status shops-live${open.length ? " is-open" : ""}`}>
              <i aria-hidden="true" />
              {summary}
            </p>
          </div>
        </header>
        <ShopsBoard />
        <Link to="/locations" className="link shops-all">
          Hours, maps and details for every shop <ArrowRight />
        </Link>
      </div>
    </section>
  );
}

/** Map + list of every shop with live status, today's hours, directions, phone and ordering. */
export function ShopsBoard() {
  const { now } = useOpenNow();
  const { openOrder } = useOrder();
  const near = useNearest();
  const [hover, setHover] = useState<string | null>(null);
  const ordered = near.status === "done" ? near.ranked.map((r) => locations.find((l) => l.slug === r.slug)!) : locations;
  const km = (slug: string) => near.ranked.find((r) => r.slug === slug)?.km;
  return (
    <div className="shops-body">
      <div className="shops-map-wrap">
        <ShopMap active={hover} onPick={(slug) => setHover(slug)} />
        <div className="shops-near">
          <button className="btn btn-ink btn-sm" onClick={near.locate} disabled={near.status === "locating"}>
            <Pin />
            {near.status === "locating" ? "Finding you…" : near.status === "done" ? "Nearest first" : "Find my nearest"}
          </button>
          <p className="small muted" aria-live="polite">
            {near.status === "error"
              ? near.message
              : near.status === "done"
                ? `Closest: ${locations.find((l) => l.slug === near.ranked[0].slug)?.name}, about ${formatKm(near.ranked[0].km)} away in a straight line.`
                : "Uses your location once, on this device only."}
          </p>
        </div>
      </div>

      <ol className="shops-list">
        {ordered.map((l) => {
          const today = todayHours(l.hours, now);
          const d = km(l.slug);
          return (
            <li
              key={l.slug}
              className={`shop-row${hover === l.slug ? " is-active" : ""}`}
              onPointerEnter={() => setHover(l.slug)}
              onPointerLeave={() => setHover(null)}
              onFocusCapture={() => setHover(l.slug)}
            >
              <span className="shop-num label tnum">{String(locations.indexOf(l) + 1).padStart(2, "0")}</span>
              <div className="shop-main">
                <h3 className="serif shop-name">
                  <Link to={`/locations/${l.slug}`}>{l.name}</Link>
                </h3>
                <p className="small muted">{fullAddress(l)}</p>
              </div>
              <div className="shop-when">
                <OpenStatus status={openStatus(l.hours, now)} fallback="Hours not published — call" />
                <p className="small muted tnum">
                  {today ? `Today ${today}` : l.hours.length ? "Closed today" : ""}
                  {d !== undefined && ` · ${formatKm(d)}`}
                </p>
              </div>
              <div className="shop-actions">
                <a className="btn btn-line btn-sm" href={directionsUrl(l)} target="_blank" rel="noopener" aria-label={`Directions to Roni's ${l.name}`}>
                  Directions <ArrowUpRight />
                </a>
                <a className="shop-phone small tnum" href={telHref(l.phone)} aria-label={`Call Roni's ${l.name} on ${l.phone}`}>
                  {l.phone}
                </a>
              </div>
              <button className="shop-order" onClick={() => openOrder(l.slug)} aria-label={`Order from Roni's ${l.name}`}>
                <ArrowRight />
              </button>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
