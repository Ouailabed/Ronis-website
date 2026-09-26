import { Link } from "react-router-dom";
import { locations } from "../data/business";
import { directionsUrl, fullAddress, hoursRows, openStatus } from "../lib/hours";
import { useOrder } from "../lib/order";
import { useLondonNow } from "../lib/useLondonNow";
import { ArrowRight, ArrowUpRight, Bag } from "./Icons";
import OpenStatus from "./OpenStatus";

const TONES = ["blue", "orange", "cream", "salmon", "butter", "ink"] as const;

/** Six bakeries as cards that stack on top of each other as you scroll (pure CSS sticky). */
export default function LocationStack() {
  const now = useLondonNow();
  const { openOrder } = useOrder();
  return (
    <ol className="loc-stack">
      {locations.map((l, i) => (
        <li key={l.slug} className={`loc-stack-card tone-${TONES[i % TONES.length]}`} style={{ "--i": i } as React.CSSProperties}>
          <div className="lsc-top">
            <span className="lsc-n">{String(i + 1).padStart(2, "0")}</span>
            <OpenStatus status={openStatus(l.hours, now)} fallback="Hours: please call" />
          </div>
          <h3 className="lsc-name">{l.name}</h3>
          <div className="lsc-bottom">
            <div className="lsc-info">
              <p>{fullAddress(l)}</p>
              <p>{l.hours.length ? hoursRows(l.hours).map((r) => `${r.days} · ${r.time}`).join(" / ") : l.needsCheck}</p>
              <p>{l.phone}</p>
            </div>
            <div className="lsc-actions">
              <button className="btn btn-small" onClick={() => openOrder(l.slug)}>
                <Bag />
                Order
              </button>
              <a className="btn btn-small btn-ghost" href={directionsUrl(l)} target="_blank" rel="noopener">
                Directions <ArrowUpRight />
              </a>
              <Link className="btn btn-small btn-ghost" to={`/locations/${l.slug}`} aria-label={`${l.name} shop page`}>
                Shop page <ArrowRight />
              </Link>
            </div>
          </div>
        </li>
      ))}
    </ol>
  );
}
