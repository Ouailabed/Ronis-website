import { Link } from "react-router-dom";
import { catering, locations, ordering } from "../../data/business";
import { useOrder } from "../../lib/order";
import { ArrowRight, ArrowUpRight } from "../Icons";

const deliveroo = locations.filter((l) => l.deliveroo).map((l) => l.name);

/** 05 — The conversion moment. One question, one enormous button, the real ways to order. */
export default function OrderBlock() {
  const { openOrder } = useOrder();
  return (
    <section className="order-block" aria-labelledby="order-title">
      <p className="label muted">
        <span className="tnum">03</span> — Order
      </p>
      <h2 id="order-title" className="order-title reveal-lines">
        <span className="line">
          <span>What are</span>
        </span>
        <span className="line" style={{ ["--i" as string]: 1 }}>
          <span>
            you <em>having?</em>
          </span>
        </span>
      </h2>
      <div className="order-grid">
        <button className="btn btn-blue btn-big order-main" onClick={() => openOrder()}>
          Order now <ArrowRight />
        </button>
        <ul className="order-routes">
          <li>
            <a href={ordering.online} target="_blank" rel="noopener">
              <span className="order-route-name display">Collect</span>
              <span className="small muted">Order online with Roni's, pick up from your shop.</span>
              <ArrowUpRight />
            </a>
          </li>
          <li>
            <button onClick={() => openOrder()}>
              <span className="order-route-name display">Delivery</span>
              <span className="small muted">
                On Deliveroo from {deliveroo.slice(0, -1).join(", ")} and {deliveroo.at(-1)}.
              </span>
              <ArrowRight />
            </button>
          </li>
          <li>
            <Link to="/catering">
              <span className="order-route-name display">Platters</span>
              <span className="small muted">{catering.leadTimeText}</span>
              <ArrowRight />
            </Link>
          </li>
        </ul>
      </div>
      <Link to="/menu" className="link order-menu">
        See the full menu <ArrowRight />
      </Link>
    </section>
  );
}
