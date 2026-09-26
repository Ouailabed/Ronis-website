import { Link } from "react-router-dom";
import { ArrowRight } from "../components/Icons";
import RenderImage from "../components/RenderImage";
import Shopfront from "../components/Shopfront";
import { brand, locations, story } from "../data/business";
import renders from "../data/renders";
import { useSeo } from "../lib/seo";

export default function About() {
  useSeo("Our story", "Roni's Bagel Bakery was opened by Roni Avital in 1989 in West Hampstead, specialising in authentic bagels and Jewish baked goods with an artisan style.");
  return (
    <>
      <section className="page-hero container about-hero">
        <p className="eyebrow">Our story</p>
        <h1>
          West Hampstead, <em>{brand.founded}.</em>
        </h1>
        <p className="lede">{story.intro}</p>
      </section>

      <section className="container about-intro">
        <Shopfront />
        <div className="about-intro-copy">
          <blockquote className="about-quote">
            <p>“{story.reputation}”</p>
            <cite>From Roni's own story, ronisonline.co.uk</cite>
          </blockquote>
        </div>
      </section>

      <section className="container section">
        <h2 className="timeline-title">
          From one shop <em>to six.</em>
        </h2>
        <ol className="timeline">
          {story.timeline.map((t) => (
            <li key={t.year} className="reveal">
              <span className="timeline-year">{t.year}</span>
              <div>
                <h3>{t.title}</h3>
                <p>{t.text}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      <section className="about-band">
        <div className="container about-band-grid">
          <div>
            <p className="eyebrow">What we bake</p>
            <h2>
              Bagels and <em>Jewish baked goods.</em>
            </h2>
            <p className="lede">Fresh hot bagels, breads, pastries and cakes, alongside breakfasts, salads and coffee in the cafés — and platters and cakes for any occasion.</p>
            <div className="hero-actions">
              <Link className="btn" to="/menu">
                See the menu
              </Link>
              <Link className="btn btn-ghost" to="/locations">
                Visit a bakery
              </Link>
            </div>
          </div>
          <RenderImage src={renders["bagels-trio"].src} width={renders["bagels-trio"].width} height={renders["bagels-trio"].height} alt="Illustration of a plain, a sesame and a poppy seed bagel" />
        </div>
      </section>

      <section className="container section about-shops">
        <h2 className="loc-cards-title">The bakeries today</h2>
        <ul className="about-shop-list">
          {locations.map((l) => (
            <li key={l.slug}>
              <Link to={`/locations/${l.slug}`}>
                {l.name} <ArrowRight className="icon-inline" />
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}
