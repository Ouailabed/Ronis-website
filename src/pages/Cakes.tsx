import { Link } from "react-router-dom";
import CallGrid from "../components/CallGrid";
import { ArrowRight, ArrowUpRight } from "../components/Icons";
import Photo from "../components/Photo";
import { catering, ordering } from "../data/business";
import { useSeo } from "../lib/seo";

export default function Cakes() {
  useSeo("Cakes", "Cakes from Roni's: homemade carrot cake and bespoke cakes for any occasion, ordered online and collected in store.");
  return (
    <>
      <header className="container page-head page-split">
        <div>
          <p className="label">
            <span>Roni's</span>
            <span>Cakes</span>
          </p>
          <h1 className="reveal-lines">
            <span className="line">
              <span>Cakes for</span>
            </span>
            <span className="line" style={{ ["--i" as string]: 1 }}>
              <span>
                <em>any occasion.</em>
              </span>
            </span>
          </h1>
          <p className="lede">Homemade cakes from the Roni's counter, and bespoke cakes made to order for birthdays, celebrations and get-togethers — collected from your chosen shop.</p>
          <div className="page-head-actions">
            <a className="btn" href={ordering.occasions} target="_blank" rel="noopener">
              Order a cake <ArrowUpRight />
            </a>
            <Link className="btn btn-line" to="/menu?category=cakes">
              Cakes on the menu
            </Link>
          </div>
        </div>
        <Photo name="carrot-cake" sizes="(min-width: 821px) 45vw, 100vw" priority className="page-split-photo" />
      </header>

      <section className="container section-tight">
        <ol className="steps">
          <li>
            <p className="label muted">At the counter</p>
            <h2 className="h3">Carrot cake</h2>
            <p className="muted">A Roni's favourite, alongside homemade biscuits and pastries made from scratch and preservative free.</p>
            <Link to="/menu?category=cakes" className="link">
              See the menu <ArrowRight />
            </Link>
          </li>
          <li>
            <p className="label muted">Made to order</p>
            <h2 className="h3">Bespoke celebration cakes</h2>
            <p className="muted">Order through Roni's “Order for Any Occasion” page and collect in store. For timings on a bespoke cake, check when you order or call your shop.</p>
            <a className="link" href={ordering.occasions} target="_blank" rel="noopener">
              Order for any occasion <ArrowUpRight />
            </a>
          </li>
          <li>
            <p className="label muted">For a crowd</p>
            <h2 className="h3">Mini desserts</h2>
            <p className="muted">A selection of signature mini desserts is available with catering orders. {catering.leadTimeText}</p>
            <Link to="/catering" className="link">
              Catering &amp; platters <ArrowRight />
            </Link>
          </li>
        </ol>
      </section>

      <section className="container section" aria-labelledby="call-h">
        <header className="sec-head">
          <p className="label">
            <span>—</span>
            <span>Questions</span>
          </p>
          <h2 id="call-h">
            Questions about <em>a cake?</em>
          </h2>
          <p className="sec-intro muted">Call the shop you'd like to collect from.</p>
        </header>
        <CallGrid />
      </section>
    </>
  );
}
