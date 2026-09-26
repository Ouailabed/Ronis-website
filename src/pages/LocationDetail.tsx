import { Link, useParams } from "react-router-dom";
import { ArrowLeft, ArrowUpRight, Bag, Bike, Phone, Pin } from "../components/Icons";
import OpenStatus from "../components/OpenStatus";
import RenderImage from "../components/RenderImage";
import { LAST_CHECKED, locations, ordering } from "../data/business";
import renders from "../data/renders";
import { appleMapsUrl, directionsUrl, fullAddress, hoursRows, openStatus, telHref } from "../lib/hours";
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

  return (
    <>
      <section className="page-hero container loc-hero">
        <Link to="/locations" className="back-link">
          <ArrowLeft /> All locations
        </Link>
        <p className="eyebrow">{shop.opened ?? "Roni's bakery"}</p>
        <h1>
          Roni's <em>{shop.name}</em>
        </h1>
        <OpenStatus status={openStatus(shop.hours, now)} fallback="Opening hours not published — please call" />
      </section>

      <section className="container loc-detail">
        <div className="loc-panel">
          <h2 className="loc-panel-title">Visit</h2>
          <p className="loc-address">
            <Pin />
            <span>{fullAddress(shop)}</span>
          </p>
          <div className="loc-actions">
            <a className="btn" href={directionsUrl(shop)} target="_blank" rel="noopener">
              Google Maps directions <ArrowUpRight />
            </a>
            <a className="btn btn-ghost" href={appleMapsUrl(shop)} target="_blank" rel="noopener">
              Apple Maps <ArrowUpRight />
            </a>
          </div>
          <h2 className="loc-panel-title">Opening hours</h2>
          {shop.hours.length ? (
            <dl className="loc-hours loc-hours-big">
              {hoursRows(shop.hours).map((r) => (
                <div key={r.days}>
                  <dt>{r.days}</dt>
                  <dd>{r.time}</dd>
                </div>
              ))}
            </dl>
          ) : (
            <p>{shop.needsCheck}</p>
          )}
          <p className="small">From Roni's website, checked {LAST_CHECKED}. Holiday hours may differ.</p>
          <h2 className="loc-panel-title">Call</h2>
          <a className="loc-phone" href={telHref(shop.phone)}>
            <Phone />
            {shop.phone}
          </a>
        </div>

        <div className="loc-panel loc-order">
          <h2 className="loc-panel-title">Order from {shop.name}</h2>
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
                <ArrowUpRight className="order-option-go" />
              </a>
            </li>
          </ul>
          <button className="btn btn-ghost btn-small" onClick={() => openOrder(shop.slug)}>
            Open the order helper
          </button>
          <div className="loc-art">
            <RenderImage src={renders["bagels-trio"].src} width={renders["bagels-trio"].width} height={renders["bagels-trio"].height} alt="Illustration of three bagels: plain, sesame and poppy seed" />
          </div>
        </div>
      </section>

      <section className="container section loc-others">
        <h2 className="loc-cards-title">Other Roni's nearby</h2>
        <ul className="loc-other-list">
          {others.map((l) => (
            <li key={l.slug}>
              <Link to={`/locations/${l.slug}`}>
                <strong>{l.name}</strong>
                <span>{fullAddress(l)}</span>
                <OpenStatus status={openStatus(l.hours, now)} fallback="Call for hours" />
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}
