import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { locations } from "../../data/business";
import { directionsUrl, fullAddress, hoursRows, openStatus, telHref, todayHours } from "../../lib/hours";
import { formatKm, useNearest } from "../../lib/nearest";
import { useOrder } from "../../lib/order";
import { useLondonNow } from "../../lib/useLondonNow";
import { ArrowRight, ArrowUpRight, Pin } from "../Icons";
import OpenStatus from "../OpenStatus";
import ShopMap from "../ShopMap";

/**
 * 06 — Where. A poster map of North London in Roni's blue: pick a bakery on the map or
 * the list and its address, today's hours, phone and directions take over the panel.
 */
export default function Visit({ head = true }: { head?: boolean }) {
  const now = useLondonNow();
  const { openOrder } = useOrder();
  const near = useNearest();
  const [slug, setSlug] = useState(locations[0].slug);
  const shop = locations.find((l) => l.slug === slug)!;
  const today = todayHours(shop.hours, now);
  // once located, jump to the nearest shop
  const nearest = near.status === "done" ? near.ranked[0]?.slug : undefined;
  useEffect(() => {
    if (nearest) setSlug(nearest);
  }, [nearest]);
  const km = near.ranked.find((r) => r.slug === slug)?.km;

  return (
    <section className={`visit on-blue${head ? "" : " visit-bare"}`} id="visit" aria-labelledby="visit-title">
      {!head && (
        <h2 id="visit-title" className="visually-hidden">
          Choose a Roni's
        </h2>
      )}
      {head && (
        <div className="visit-head">
          <p className="label muted">
            <span className="tnum">04</span> — Visit
          </p>
          <h2 id="visit-title" className="reveal-lines">
            <span className="line">
              <span>Roni's,</span>
            </span>
            <span className="line" style={{ ["--i" as string]: 1 }}>
              <span>North London</span>
            </span>
          </h2>
        </div>
      )}

      <div className="visit-body">
        <div className="visit-map">
          <ShopMap active={slug} onPick={setSlug} />
        </div>

        <div className="visit-panel">
          <ul className="visit-tabs" aria-label="Choose a bakery">
            {locations.map((l, i) => (
              <li key={l.slug}>
                <button className={l.slug === slug ? "is-active" : undefined} aria-pressed={l.slug === slug} onClick={() => setSlug(l.slug)}>
                  <span className="label tnum">{String(i + 1).padStart(2, "0")}</span>
                  {l.name}
                </button>
              </li>
            ))}
          </ul>

          <div className="visit-detail" aria-live="polite" key={slug}>
            <p className="visit-address serif">{fullAddress(shop)}</p>
            <div className="visit-facts">
              <div>
                <p className="label muted">Today</p>
                <OpenStatus status={openStatus(shop.hours, now)} fallback="Hours not published — please call" />
                {today && <p className="small tnum">{today}</p>}
              </div>
              <div>
                <p className="label muted">Hours</p>
                {shop.hours.length ? (
                  hoursRows(shop.hours).map((r) => (
                    <p key={r.days} className="small tnum">
                      {r.days}, {r.time}
                    </p>
                  ))
                ) : (
                  <p className="small">Please call the shop</p>
                )}
              </div>
              <div>
                <p className="label muted">Call</p>
                <a className="small tnum visit-phone" href={telHref(shop.phone)} aria-label={`Call Roni's ${shop.name} on ${shop.phone}`}>
                  {shop.phone}
                </a>
              </div>
            </div>
            <div className="visit-actions">
              <a className="btn btn-paper" href={directionsUrl(shop)} target="_blank" rel="noopener" aria-label={`Get directions to Roni's ${shop.name}`}>
                Get directions <ArrowUpRight />
              </a>
              <button className="btn btn-line" onClick={() => openOrder(shop.slug)}>
                Order from here <ArrowRight />
              </button>
            </div>
            <div className="visit-more">
              <button className="link small" onClick={near.locate} disabled={near.status === "locating"}>
                <Pin /> {near.status === "locating" ? "Finding you…" : "Find my nearest"}
              </button>
              <span className="small muted" aria-live="polite">
                {near.status === "error" ? near.message : km !== undefined ? `About ${formatKm(km)} from you in a straight line.` : ""}
              </span>
              <Link to={`/locations/${shop.slug}`} className="link small">
                {shop.name} details <ArrowRight />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
