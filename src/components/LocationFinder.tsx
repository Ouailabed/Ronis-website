import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { locations, type Location } from "../data/business";
import { directionsUrl, fullAddress, hoursRows, openStatus, telHref } from "../lib/hours";
import { useOrder } from "../lib/order";
import { formatKm, useNearest } from "../lib/nearest";
import { useLondonNow } from "../lib/useLondonNow";
import { ArrowRight, ArrowUpRight, Bag, Clock, Phone, Pin } from "./Icons";
import OpenStatus from "./OpenStatus";
import ShopsMap from "./ShopsMap";

export function ShopDetails({ shop, headingLevel = 3 }: { shop: Location; headingLevel?: 2 | 3 }) {
  const now = useLondonNow();
  const { openOrder } = useOrder();
  const H = headingLevel === 2 ? "h2" : "h3";
  return (
    <div className="shop-details">
      <H className="shop-details-name">Roni's {shop.name}</H>
      {shop.opened && <p className="chip">{shop.opened}</p>}
      <OpenStatus status={openStatus(shop.hours, now)} fallback="Hours not published — please call" />
      <ul className="shop-facts">
        <li>
          <Pin />
          <span>{fullAddress(shop)}</span>
        </li>
        <li>
          <Phone />
          <a href={telHref(shop.phone)}>{shop.phone}</a>
        </li>
        <li>
          <Clock />
          {shop.hours.length ? (
            <span>
              {hoursRows(shop.hours).map((r) => (
                <span key={r.days} className="shop-hours-row">
                  {r.days}: {r.time}
                </span>
              ))}
            </span>
          ) : (
            <span>{shop.needsCheck}</span>
          )}
        </li>
      </ul>
      <div className="shop-actions">
        <button className="btn btn-small" onClick={() => openOrder(shop.slug)}>
          <Bag />
          Order from here
        </button>
        <a className="btn btn-ghost btn-small" href={directionsUrl(shop)} target="_blank" rel="noopener">
          Directions <ArrowUpRight />
        </a>
      </div>
      <Link className="link-arrow shop-page-link" to={`/locations/${shop.slug}`}>
        Shop page <ArrowRight className="icon-inline" />
      </Link>
    </div>
  );
}

export default function LocationFinder({ headingLevel = 3 }: { headingLevel?: 2 | 3 }) {
  const now = useLondonNow();
  const [selected, setSelected] = useState(locations[0].slug);
  const shop = locations.find((l) => l.slug === selected)!;
  const near = useNearest();
  const kmFor = (slug: string) => near.ranked.find((r) => r.slug === slug)?.km;
  // once located: nearest first, and select the nearest one
  const ordered = near.status === "done" ? near.ranked.map((r) => locations.find((l) => l.slug === r.slug)!) : locations;
  useEffect(() => {
    if (near.status === "done" && near.ranked[0]) setSelected(near.ranked[0].slug);
  }, [near.status, near.ranked]);

  return (
    <div className="finder-wrap">
      <div className="finder-near">
        <button className="btn btn-small btn-gold" onClick={near.locate} disabled={near.status === "locating"}>
          <Pin />
          {near.status === "locating" ? "Finding you…" : near.status === "done" ? "Nearest first ✓" : "Find my nearest Roni's"}
        </button>
        <p className="small" aria-live="polite">
          {near.status === "error"
            ? near.message
            : near.status === "done"
              ? `Closest: Roni's ${locations.find((l) => l.slug === near.ranked[0].slug)?.name}, about ${formatKm(near.ranked[0].km)} away (straight line).`
              : "Uses your location once, only on this device. Nothing is stored."}
        </p>
      </div>
    <div className="finder">
      <div className="finder-list" role="group" aria-label="Choose a Roni's bakery">
        {ordered.map((l) => (
          <button
            key={l.slug}
            aria-pressed={l.slug === selected}
            className={`finder-item${l.slug === selected ? " is-selected" : ""}`}
            onClick={() => setSelected(l.slug)}
          >
            <span className="finder-num">{String(locations.indexOf(l) + 1).padStart(2, "0")}</span>
            <span className="finder-name">{l.name}</span>
            <span className="finder-meta">
              <OpenStatus status={openStatus(l.hours, now)} fallback="Call for hours" />
              {kmFor(l.slug) !== undefined && <span className="finder-km">{formatKm(kmFor(l.slug)!)}</span>}
            </span>
          </button>
        ))}
      </div>

      <ShopsMap className="finder-map" selected={selected} onSelect={setSelected} />

      <div className="finder-detail" aria-live="polite">
        <ShopDetails shop={shop} headingLevel={headingLevel} />
      </div>
    </div>
    </div>
  );
}
