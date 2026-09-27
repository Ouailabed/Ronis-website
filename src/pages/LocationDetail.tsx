import { Link, useParams } from "react-router-dom";
import CopyShare from "../components/CopyShare";
import { ArrowLeft, ArrowRight, ArrowUpRight, Bag, Bike, Phone } from "../components/Icons";
import OpenStatus from "../components/OpenStatus";
import Photo from "../components/Photo";
import ShopMap from "../components/ShopMap";
import { LAST_CHECKED, locations, ordering } from "../data/business";
import { appleMapsUrl, directionsUrl, fullAddress, hoursRows, openStatus, telHref, todayHours } from "../lib/hours";
import { useOrder } from "../lib/order";
import { bakeryJsonLd, useSeo } from "../lib/seo";
import { useLondonNow } from "../lib/useLondonNow";
import NotFound from "./NotFound";

export default function LocationDetail() {
  const { slug } = useParams();
  const shop = locations.find((l) => l.slug === slug);
  const now = useLondonNow();
  const { openOrder } = useOrder();
  useSeo(
    shop ? `Roni's ${shop.name}` : "Bakery not found",
    shop
      ? `Roni's ${shop.name}: ${fullAddress(shop)}. Phone ${shop.phone}.${shop.hours.length ? ` Open ${hoursRows(shop.hours).map((r) => `${r.days} ${r.time}`).join(", ")}.` : ""} Directions and ordering.`
      : "This Roni's page doesn't exist.",
    shop ? bakeryJsonLd(shop) : undefined,
  );
  if (!shop) return <NotFound />;
  const others = locations.filter((l) => l.slug !== shop.slug);
  const today = todayHours(shop.hours, now);

  return (
    <>
      <header className="container page-head loc-head">
        <Link to="/locations" className="back-link">
          <ArrowLeft /> All locations
        </Link>
        <p className="label">
          <span>{String(locations.indexOf(shop) + 1).padStart(2, "0")}</span>
          <span>{shop.opened ?? "Roni's bakery"}</span>
        </p>
        <h1>
          Roni's <em>{shop.name}</em>
        </h1>
        <div className="loc-head-meta">
          <OpenStatus status={openStatus(shop.hours, now)} fallback="Opening hours not published — please call" />
          {today && <span className="small muted tnum">Today {today}</span>}
        </div>
        <div className="page-head-actions">
          <button className="btn" onClick={() => openOrder(shop.slug)}>
            Order from {shop.name} <ArrowRight />
          </button>
          <a className="btn btn-line" href={directionsUrl(shop)} target="_blank" rel="noopener">
            Directions <ArrowUpRight />
          </a>
        </div>
      </header>

      <section className="container loc-body">
        <div className="loc-info">
          <div className="loc-block">
            <h2 className="label">Address</h2>
            <p className="loc-big">{fullAddress(shop)}</p>
            <CopyShare address={fullAddress(shop)} title={`Roni's ${shop.name}`} />
            <p className="loc-maps">
              <a className="link" href={directionsUrl(shop)} target="_blank" rel="noopener">
                Google Maps <ArrowUpRight />
              </a>
              <a className="link" href={appleMapsUrl(shop)} target="_blank" rel="noopener">
                Apple Maps <ArrowUpRight />
              </a>
            </p>
          </div>
          <div className="loc-block">
            <h2 className="label">Opening hours</h2>
            {shop.hours.length ? (
              <dl className="loc-hours">
                {hoursRows(shop.hours).map((r) => (
                  <div key={r.days}>
                    <dt>{r.days}</dt>
                    <dd className="tnum">{r.time}</dd>
                  </div>
                ))}
              </dl>
            ) : (
              <p>{shop.needsCheck}</p>
            )}
            <p className="small muted">From Roni's website, checked {LAST_CHECKED}. Holiday hours may differ.</p>
          </div>
          <div className="loc-block">
            <h2 className="label">Call</h2>
            <a className="loc-big loc-phone tnum" href={telHref(shop.phone)}>
              {shop.phone}
            </a>
          </div>
          <div className="loc-block">
            <h2 className="label">Order from {shop.name}</h2>
            <ul className="order-options">
              <li>
                <a className="order-option" href={ordering.online} target="_blank" rel="noopener">
                  <Bag />
                  <span>
                    <strong>Order online for collection</strong>
                    <span className="small">Roni's official online ordering.</span>
                  </span>
                  <ArrowUpRight className="order-option-go" />
                </a>
              </li>
              {shop.deliveroo && (
                <li>
                  <a className="order-option" href={shop.deliveroo} target="_blank" rel="noopener">
                    <Bike />
                    <span>
                      <strong>Delivery with Deliveroo</strong>
                      <span className="small">Roni's {shop.name} on Deliveroo.</span>
                    </span>
                    <ArrowUpRight className="order-option-go" />
                  </a>
                </li>
              )}
              <li>
                <a className="order-option" href={telHref(shop.phone)}>
                  <Phone />
                  <span>
                    <strong>Call the shop</strong>
                    <span className="small">For questions and last-minute orders.</span>
                  </span>
                  <ArrowRight className="order-option-go" />
                </a>
              </li>
            </ul>
          </div>
        </div>
        <aside className="loc-aside">
          <ShopMap active={shop.slug} />
          <Photo name="bagels" sizes="(min-width: 821px) 40vw, 100vw" className="loc-photo" />
        </aside>
      </section>

      <section className="container section loc-others" aria-labelledby="others-h">
        <header className="sec-head">
          <p className="label">
            <span>—</span>
            <span>Nearby</span>
          </p>
          <h2 id="others-h">
            Other <em>Roni's.</em>
          </h2>
        </header>
        <ul className="loc-other-list">
          {others.map((l) => (
            <li key={l.slug}>
              <Link to={`/locations/${l.slug}`}>
                <span className="serif">{l.name}</span>
                <span className="small muted">{fullAddress(l)}</span>
                <OpenStatus status={openStatus(l.hours, now)} fallback="Call for hours" />
                <ArrowRight className="loc-other-arrow" />
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}
