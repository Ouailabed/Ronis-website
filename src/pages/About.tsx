import { Link } from "react-router-dom";
import { ArrowRight } from "../components/Icons";
import Photo from "../components/Photo";
import { brand, locations, story } from "../data/business";
import { useSeo } from "../lib/seo";

export default function About() {
  useSeo("Our story", "Roni's Bagel Bakery was opened by Roni Avital in 1989 in West Hampstead, specialising in authentic bagels and Jewish baked goods with an artisan style.");
  return (
    <>
      <header className="container page-head">
        <p className="label">
          <span>Roni's</span>
          <span>Our story</span>
        </p>
        <h1 className="reveal-lines">
          <span className="line">
            <span>West Hampstead,</span>
          </span>
          <span className="line" style={{ ["--i" as string]: 1 }}>
            <span>
              <em>{brand.founded}.</em>
            </span>
          </span>
        </h1>
      </header>

      <Photo name="bagels" sizes="100vw" priority className="about-wide" />

      <section className="container section about-intro">
        <p className="about-lead serif reveal">{story.intro}</p>
        <blockquote className="heritage-quote about-quote reveal">
          <p>“{story.reputation}”</p>
          <cite className="label muted">In Roni's words, from ronisonline.co.uk</cite>
        </blockquote>
      </section>

      <section className="container section-tight" aria-labelledby="timeline-h">
        <header className="sec-head">
          <p className="label">
            <span>—</span>
            <span>Through the years</span>
          </p>
          <h2 id="timeline-h">
            From one shop <em>to six.</em>
          </h2>
        </header>
        <ol className="timeline">
          {story.timeline.map((t, i) => (
            <li key={t.year} className="reveal" style={{ ["--delay" as string]: `${i * 0.08}s` }}>
              <span className="timeline-year">{t.year}</span>
              <h3>{t.title}</h3>
              <p className="small muted">{t.text}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="container section about-bake">
        <Photo name="crust" sizes="(min-width: 821px) 40vw, 100vw" className="about-bake-photo reveal-photo" />
        <div>
          <p className="label muted">What we bake</p>
          <h2>
            Bagels and <em>Jewish baked goods.</em>
          </h2>
          <p className="lede">Fresh hot bagels, breads, pastries and cakes, alongside breakfasts, salads and coffee in the cafés — and platters and cakes for any occasion.</p>
          <div className="page-head-actions">
            <Link className="btn" to="/menu">
              See the menu <ArrowRight />
            </Link>
            <Link className="btn btn-line" to="/locations">
              Visit a bakery
            </Link>
          </div>
          <ul className="about-shops">
            {locations.map((l) => (
              <li key={l.slug}>
                <Link to={`/locations/${l.slug}`} className="link">
                  {l.name} <ArrowRight />
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </>
  );
}
