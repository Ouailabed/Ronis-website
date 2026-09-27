import { Link } from "react-router-dom";
import { ArrowUpRight, Facebook, Instagram, Phone, Pin } from "../components/Icons";
import { brand, catering, locations, ordering } from "../data/business";
import { fullAddress, telHref } from "../lib/hours";
import { useSeo } from "../lib/seo";

export default function Contact() {
  useSeo("Contact", "Contact Roni's Bagel Bakery: phone numbers and addresses for all six North London bakeries, catering questions and feedback.");
  return (
    <>
      <section className="page-hero container">
        <p className="eyebrow">Contact</p>
        <h1>
          Talk to <em>your Roni's.</em>
        </h1>
        <p className="lede">The quickest way to reach Roni's is to call the shop you're visiting or collecting from.</p>
      </section>

      <section className="container contact-grid">
        {locations.map((l) => (
          <article key={l.slug} className="contact-card">
            <h2>{l.name}</h2>
            <a className="contact-phone" href={telHref(l.phone)}>
              <Phone />
              {l.phone}
            </a>
            <p className="contact-addr">
              <Pin />
              {fullAddress(l)}
            </p>
            <Link to={`/locations/${l.slug}`} className="link-arrow">
              Hours & directions
            </Link>
          </article>
        ))}
      </section>

      <section className="container section contact-more">
        <div className="contact-block">
          <h2>Catering & cakes</h2>
          <p>{catering.leadTimeText} {catering.lastMinute}</p>
          <Link className="btn btn-small" to="/catering">
            Catering details
          </Link>
        </div>
        <div className="contact-block">
          <h2>Feedback</h2>
          <p>Roni's asks for your honest review — it's how they keep improving your next visit.</p>
          <a className="btn btn-ghost btn-small" href={ordering.review} target="_blank" rel="noopener">
            Leave a review <ArrowUpRight />
          </a>
        </div>
        <div className="contact-block">
          <h2>Follow Roni's</h2>
          <p>Roni's on social media.</p>
          <div className="contact-social">
            <a className="btn btn-ghost btn-small" href={brand.instagram} target="_blank" rel="noopener">
              <Instagram /> Instagram
            </a>
            <a className="btn btn-ghost btn-small" href={brand.facebook} target="_blank" rel="noopener">
              <Facebook /> Facebook
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
