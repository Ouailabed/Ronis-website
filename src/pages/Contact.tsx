import { Link } from "react-router-dom";
import { ArrowRight, ArrowUpRight, Facebook, Instagram } from "../components/Icons";
import { brand, catering, locations, ordering } from "../data/business";
import { fullAddress, telHref } from "../lib/hours";
import { useSeo } from "../lib/seo";

export default function Contact() {
  useSeo("Contact", "Contact Roni's Bagel Bakery: phone numbers and addresses for all six North London bakeries, catering questions and feedback.");
  return (
    <>
      <header className="container page-head">
        <p className="label">
          <span>Roni's</span>
          <span>Contact</span>
        </p>
        <h1 className="reveal-lines">
          <span className="line">
            <span>Talk to</span>
          </span>
          <span className="line" style={{ ["--i" as string]: 1 }}>
            <span>
              <em>your Roni's.</em>
            </span>
          </span>
        </h1>
        <p className="lede">The quickest way to reach Roni's is to call the shop you're visiting or collecting from.</p>
      </header>

      <section className="container">
        <ul className="contact-list">
          {locations.map((l, i) => (
            <li key={l.slug}>
              <span className="label muted tnum">{String(i + 1).padStart(2, "0")}</span>
              <h2 className="serif contact-name">{l.name}</h2>
              <a className="contact-phone tnum" href={telHref(l.phone)} aria-label={`Call Roni's ${l.name} on ${l.phone}`}>
                {l.phone}
              </a>
              <p className="small muted">{fullAddress(l)}</p>
              <Link to={`/locations/${l.slug}`} className="link small">
                Hours &amp; directions <ArrowRight />
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section className="container section">
        <ol className="steps">
          <li>
            <p className="label muted">Catering &amp; cakes</p>
            <h2 className="h3">Planning ahead?</h2>
            <p className="muted">
              {catering.leadTimeText} {catering.lastMinute}
            </p>
            <Link className="link" to="/catering">
              Catering details <ArrowRight />
            </Link>
          </li>
          <li>
            <p className="label muted">Feedback</p>
            <h2 className="h3">Tell Roni's</h2>
            <p className="muted">Roni's asks for your honest review — it's how they keep improving your next visit.</p>
            <a className="link" href={ordering.review} target="_blank" rel="noopener">
              Leave a review <ArrowUpRight />
            </a>
          </li>
          <li>
            <p className="label muted">Follow</p>
            <h2 className="h3">Roni's online</h2>
            <p className="muted">News and bakes from the shops.</p>
            <p className="contact-social">
              <a className="link" href={brand.instagram} target="_blank" rel="noopener">
                <Instagram /> Instagram
              </a>
              <a className="link" href={brand.facebook} target="_blank" rel="noopener">
                <Facebook /> Facebook
              </a>
            </p>
          </li>
        </ol>
      </section>
    </>
  );
}
