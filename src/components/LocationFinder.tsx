import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { locations, type Location } from "../data/business";
import { directionsUrl, fullAddress, hoursRows, openStatus, telHref } from "../lib/hours";
import { useOrder } from "../lib/order";
import { formatKm, useNearest } from "../lib/nearest";
import { useLondonNow } from "../lib/useLondonNow";
import { ArrowRight, ArrowUpRight, Bag, Clock, Phone, Pin } from "./Icons";
import OpenStatus from "./OpenStatus";

// Schematic map bounds (North-west London). Pins use approximate positions only.
const B = { n: 51.602, s: 51.535, w: -0.24, e: -0.128 };
// label placement per pin so neighbouring names don't collide
const LABEL: Record<string, { dx: number; dy: number; anchor: "start" | "end" | "middle" }> = {
  "west-hampstead": { dx: -16, dy: 18, anchor: "end" },
  "belsize-village": { dx: 16, dy: 16, anchor: "start" },
  hampstead: { dx: 16, dy: 2, anchor: "start" },
  "swains-lane": { dx: 0, dy: -18, anchor: "middle" },
  "muswell-hill": { dx: -16, dy: 4, anchor: "end" },
  "brent-cross": { dx: 16, dy: 4, anchor: "start" },
};
const project = (l: Location) => ({
  x: ((l.approx.lng - B.w) / (B.e - B.w)) * 400,
  y: ((B.n - l.approx.lat) / (B.n - B.s)) * 300,
});

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

      <div className="finder-map" aria-hidden="true">
        <svg viewBox="0 0 400 300" preserveAspectRatio="xMidYMid slice" role="presentation">
          <defs>
            <pattern id="streets" width="26" height="26" patternUnits="userSpaceOnUse" patternTransform="rotate(18)">
              <path d="M0 13h26M13 0v26" stroke="rgba(143,84,36,.10)" strokeWidth="1" />
            </pattern>
          </defs>
          <rect width="400" height="300" fill="url(#streets)" />
          {/* Hampstead Heath, roughly placed as a landmark */}
          <path d="M218 150c20-16 64-18 90-4 16 10 12 36-4 50-20 18-60 20-80 6-16-12-20-38-6-52Z" fill="rgba(95,127,51,.16)" />
          <text x="236" y="170" className="map-area">Heath</text>
          {locations.map((l, i) => {
            const p = project(l);
            const active = l.slug === selected;
            return (
              <g key={l.slug} className={`map-pin${active ? " is-active" : ""}`} transform={`translate(${p.x} ${p.y})`} onClick={() => setSelected(l.slug)}>
                <circle r={active ? 15 : 11} />
                <text className="map-num" y="4">
                  {i + 1}
                </text>
                <text className="map-label" x={LABEL[l.slug]?.dx ?? 16} y={LABEL[l.slug]?.dy ?? 4} textAnchor={LABEL[l.slug]?.anchor ?? "start"}>
                  {l.name}
                </text>
              </g>
            );
          })}
        </svg>
        <span className="finder-map-note">Schematic map, not to scale</span>
      </div>

      <div className="finder-detail" aria-live="polite">
        <ShopDetails shop={shop} headingLevel={headingLevel} />
      </div>
    </div>
    </div>
  );
}
