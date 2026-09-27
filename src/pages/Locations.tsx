import { Link } from "react-router-dom";
import Visit from "../components/home/Visit";
import { ArrowRight } from "../components/Icons";
import { LAST_CHECKED, locations } from "../data/business";
import { fullAddress, hoursRows } from "../lib/hours";
import { useSeo } from "../lib/seo";
import { useOpenNow } from "../lib/useOpenNow";

export default function Locations() {
  const { open, summary } = useOpenNow();
  useSeo(
    "Locations",
    "Find your Roni's: West Hampstead, Belsize Village, Hampstead, Swains Lane, Muswell Hill and Brent Cross. Addresses, opening hours, directions and ordering.",
  );

  return (
    <>
      <header className="container page-head">
        <p className="label">
          <span>Roni's</span>
          <span>Locations</span>
        </p>
        <h1 className="reveal-lines">
          <span className="line">
            <span>Find your</span>
          </span>
          <span className="line" style={{ ["--i" as string]: 1 }}>
            <span>
              <em>Roni's.</em>
            </span>
          </span>
        </h1>
        <p className="lede">Six bakeries across North London.</p>
        <p className={`status page-live${open.length ? " is-open" : ""}`}>
          <i aria-hidden="true" />
          {summary}
        </p>
      </header>

      <Visit head={false} />

      <section className="container section hours-table-wrap" aria-labelledby="hours-h">
        <header className="sec-head">
          <p className="label">
            <span>—</span>
            <span>Opening hours</span>
          </p>
          <h2 id="hours-h">
            Every shop, <em>every day.</em>
          </h2>
        </header>
        <table className="hours-table">
          <thead>
            <tr>
              <th scope="col">Bakery</th>
              <th scope="col">Address</th>
              <th scope="col">Days</th>
              <th scope="col">Hours</th>
            </tr>
          </thead>
          <tbody>
            {locations.map((l) => {
              const rows = hoursRows(l.hours);
              return (
                <tr key={l.slug}>
                  <th scope="row">
                    <Link to={`/locations/${l.slug}`} className="serif">
                      {l.name}
                    </Link>
                  </th>
                  <td className="muted">{fullAddress(l)}</td>
                  {rows.length ? (
                    <>
                      <td>{rows.map((r) => r.days).join(", ")}</td>
                      <td className="tnum">{rows.map((r) => r.time).join(", ")}</td>
                    </>
                  ) : (
                    <td colSpan={2} className="muted">
                      Not published — please call {l.phone}
                    </td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
        <p className="small muted hours-note">
          Hours from Roni's website, checked {LAST_CHECKED}. Bank holiday hours can differ — if in doubt, call the shop.{" "}
          <Link className="link" to="/contact">
            All phone numbers <ArrowRight />
          </Link>
        </p>
      </section>
    </>
  );
}
