import { Link } from "react-router-dom";
import { ArrowRight, ArrowUpRight, Bag, Phone } from "../components/Icons";
import LocationFinder from "../components/LocationFinder";
import OpenStatus from "../components/OpenStatus";
import { LAST_CHECKED, locations } from "../data/business";
import { directionsUrl, fullAddress, hoursRows, openStatus, telHref } from "../lib/hours";
import { useOrder } from "../lib/order";
import { useSeo } from "../lib/seo";
import { useLondonNow } from "../lib/useLondonNow";

export default function Locations() {
  const now = useLondonNow();
  const { openOrder } = useOrder();
  useSeo(
    "Locations",
    "Find your Roni's: West Hampstead, Belsize Village, Hampstead, Swains Lane, Muswell Hill and Brent Cross. Addresses, opening hours, directions and ordering.",
  );
  const openCount = locations.filter((l) => openStatus(l.hours, now)?.open).length;

  return (
    <>
      <section className="page-hero container">
        <p className="eyebrow">Locations</p>
        <h1>
          Find your <em>Roni's.</em>
        </h1>
        <p className="lede">
          Six bakeries across North London. {openCount > 0 ? `${openCount} open right now.` : "All closed right now — see you in the morning."}
        </p>
      </section>

      <section className="container">
        <LocationFinder />
      </section>

      <section className="container section loc-cards-section">
        <h2 className="loc-cards-title">All bakeries</h2>
        <ul className="loc-cards">
          {locations.map((l) => (
            <li key={l.slug} className="loc-card reveal">
              <div className="loc-card-top">
                <h3>
                  <Link to={`/locations/${l.slug}`}>{l.name}</Link>
                </h3>
                <OpenStatus status={openStatus(l.hours, now)} fallback="Hours not published" />
              </div>
              <p className="loc-card-addr">{fullAddress(l)}</p>
              {l.hours.length > 0 ? (
                <dl className="loc-hours">
                  {hoursRows(l.hours).map((r) => (
                    <div key={r.days}>
                      <dt>{r.days}</dt>
                      <dd>{r.time}</dd>
                    </div>
                  ))}
                </dl>
              ) : (
                <p className="small">{l.needsCheck}</p>
              )}
              <div className="loc-card-actions">
                <button className="btn btn-small" onClick={() => openOrder(l.slug)}>
                  <Bag />
                  Order
                </button>
                <a className="btn btn-ghost btn-small" href={directionsUrl(l)} target="_blank" rel="noopener">
                  Directions <ArrowUpRight />
                </a>
                <a className="btn btn-ghost btn-small" href={telHref(l.phone)} aria-label={`Call Roni's ${l.name} on ${l.phone}`}>
                  <Phone />
                  Call
                </a>
              </div>
              <Link to={`/locations/${l.slug}`} className="link-arrow">
                {l.name} details <ArrowRight className="icon-inline" />
              </Link>
            </li>
          ))}
        </ul>
        <p className="small loc-disclaimer">
          Hours from Roni's website, checked {LAST_CHECKED}. Bank holiday hours can differ — if in doubt, call the shop.
        </p>
      </section>
    </>
  );
}
