import { Link } from "react-router-dom";
import { useOrder } from "../../lib/order";
import { useOpenNow } from "../../lib/useOpenNow";
import { ArrowRight } from "../Icons";

export default function HungryCta() {
  const { openOrder } = useOrder();
  const { open, summary } = useOpenNow();
  return (
    <section className="cta on-blue" aria-labelledby="cta-title">
      <div className="container cta-inner">
        <h2 id="cta-title" className="cta-title reveal-lines">
          <span className="line">
            <span>Hungry?</span>
          </span>
          <span className="line" style={{ ["--i" as string]: 1 }}>
            <span>
              <em>Come get your bagel.</em>
            </span>
          </span>
        </h2>
        <div className="cta-side reveal">
          <p className={`status${open.length ? " is-open" : ""}`}>
            <i aria-hidden="true" />
            {summary}
          </p>
          <div className="cta-actions">
            <button className="btn btn-paper" onClick={() => openOrder()}>
              Order now <ArrowRight />
            </button>
            <Link className="btn btn-line" to="/locations">
              Get directions
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
