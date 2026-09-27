import { Link } from "react-router-dom";
import { story } from "../../data/business";
import { ArrowRight } from "../Icons";
import Photo from "../Photo";

/** Where Roni's comes from — Roni's own words and dates only. */
export default function Heritage() {
  return (
    <section className="section heritage" id="since-1989" aria-labelledby="heritage-title">
      <div className="container">
        <header className="sec-head">
          <p className="label">
            <span>01</span>
            <span>Since 1989</span>
          </p>
          <h2 id="heritage-title" className="reveal-lines">
            <span className="line">
              <span>A West Hampstead bakery,</span>
            </span>
            <span className="line" style={{ ["--i" as string]: 1 }}>
              <span>
                <em>since 1989.</em>
              </span>
            </span>
          </h2>
        </header>

        <div className="heritage-body">
          <Photo name="crust" sizes="(min-width: 821px) 38vw, 100vw" className="heritage-photo reveal-photo" />
          <div className="heritage-copy">
            <p className="heritage-intro reveal">{story.intro}</p>
            <blockquote className="heritage-quote reveal" style={{ ["--delay" as string]: "0.1s" }}>
              <p>“{story.reputation}”</p>
              <cite className="label muted">In Roni's words</cite>
            </blockquote>
            <Link className="link reveal" to="/about">
              Our story <ArrowRight />
            </Link>
          </div>
        </div>

        <ol className="timeline" aria-label="Roni's through the years">
          {story.timeline.map((t, i) => (
            <li key={t.year} className="reveal" style={{ ["--delay" as string]: `${i * 0.08}s` }}>
              <span className="timeline-year">{t.year}</span>
              <h3>{t.title}</h3>
              <p className="small muted">{t.text}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
