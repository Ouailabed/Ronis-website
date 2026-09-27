import { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { catering, locations, ordering } from "../data/business";
import { fullAddress, openStatus, telHref } from "../lib/hours";
import { lockScroll } from "../lib/motion";
import { useOrder } from "../lib/order";
import { useLondonNow } from "../lib/useLondonNow";
import { ArrowRight, ArrowUpRight, Bag, Bike, Calendar, Close, Phone } from "./Icons";
import OpenStatus from "./OpenStatus";

const REMEMBER_KEY = "ronis:last-shop";

/**
 * "Order now" — pick a shop first, then see the ways that shop can take an order.
 * Every option is a real destination: Roni's official ordering, Roni's own Deliveroo
 * listing for that shop, the shop's phone, or the catering page.
 */
export default function OrderDialog() {
  const { state, closeOrder, setSlug } = useOrder();
  const ref = useRef<HTMLDialogElement>(null);
  const now = useLondonNow();
  const shop = locations.find((l) => l.slug === state.slug) ?? null;

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (state.open && !dialog.open) {
      if (!state.slug) {
        try {
          const last = localStorage.getItem(REMEMBER_KEY);
          if (last && locations.some((l) => l.slug === last)) setSlug(last);
        } catch {
          /* storage unavailable — fine */
        }
      }
      dialog.showModal();
      lockScroll(true);
    } else if (!state.open && dialog.open) dialog.close();
    if (!state.open) lockScroll(false);
  }, [state.open]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!shop) return;
    try {
      localStorage.setItem(REMEMBER_KEY, shop.slug);
    } catch {
      /* ignore */
    }
  }, [shop]);

  return (
    <dialog
      ref={ref}
      className="order-dialog"
      aria-labelledby="order-title"
      onClose={closeOrder}
      onClick={(e) => {
        if (e.target === ref.current) closeOrder(); // click on the backdrop
      }}
    >
      <div className="order-sheet">
        <header className="order-head">
          <div>
            <p className="eyebrow">Order now</p>
            <h2 id="order-title">{shop ? `Roni's ${shop.name}` : "Which Roni's?"}</h2>
          </div>
          <button className="icon-btn" onClick={closeOrder} aria-label="Close">
            <Close />
          </button>
        </header>

        {!shop ? (
          <>
            <p className="small order-intro">Choose your shop to see how it can take your order.</p>
            <ul className="order-shops">
              {locations.map((l) => (
                <li key={l.slug}>
                  <button className="order-shop" onClick={() => setSlug(l.slug)}>
                    <span className="order-shop-name">{l.name}</span>
                    <span className="order-shop-addr">{fullAddress(l)}</span>
                    <OpenStatus status={openStatus(l.hours, now)} />
                    <ArrowRight className="order-shop-arrow" />
                  </button>
                </li>
              ))}
            </ul>
            <p className="order-foot small">
              Know what you want?{" "}
              <a href={ordering.online} target="_blank" rel="noopener" className="link-arrow">
                Go straight to Roni's online ordering <ArrowUpRight className="icon-inline" />
              </a>
            </p>
          </>
        ) : (
          <>
            <div className="order-shop-summary">
              <OpenStatus status={openStatus(shop.hours, now)} fallback={shop.needsCheck ? "Hours: please call the shop" : undefined} />
              <span className="small">{fullAddress(shop)}</span>
            </div>
            <ul className="order-options">
              <li>
                <a className="order-option" href={ordering.online} target="_blank" rel="noopener">
                  <Bag />
                  <span>
                    <strong>Order online for collection</strong>
                    <span className="small">Opens Roni's official online ordering on ronisonline.co.uk.</span>
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
                      <span className="small">Roni's {shop.name} on Deliveroo. Delivery area, menu and prices are set there.</span>
                    </span>
                    <ArrowUpRight className="order-option-go" />
                  </a>
                </li>
              )}
              <li>
                <a className="order-option" href={telHref(shop.phone)}>
                  <Phone />
                  <span>
                    <strong>Call {shop.phone}</strong>
                    <span className="small">Best for questions and last-minute orders.</span>
                  </span>
                  <ArrowRight className="order-option-go" />
                </a>
              </li>
              <li>
                <Link className="order-option" to="/catering" onClick={closeOrder}>
                  <Calendar />
                  <span>
                    <strong>Platters, catering & cakes</strong>
                    <span className="small">{catering.leadTimeText}</span>
                  </span>
                  <ArrowRight className="order-option-go" />
                </Link>
              </li>
            </ul>
            <button className="btn btn-ghost btn-small order-back" onClick={() => setSlug(null)}>
              Choose a different shop
            </button>
          </>
        )}
      </div>
    </dialog>
  );
}
