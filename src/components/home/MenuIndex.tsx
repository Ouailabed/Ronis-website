import { useState } from "react";
import { Link } from "react-router-dom";
import { menu, menuCategories, type MenuItem } from "../../data/business";
import type { PhotoKey } from "../../data/photos";
import { ArrowRight } from "../Icons";
import Photo from "../Photo";

const item = (name: string) => menu.find((m) => m.name === name)!;
const bakery = menu.filter((m) => m.category === "bakery" && /bagels$/.test(m.name));

/** The home page menu: real items only, each with its own picture. */
const ROWS: { key: string; name: string; description: string; photo: PhotoKey; tag?: string; price?: string; to: string }[] = [
  ...(["Smoked salmon & cream cheese", "Hot salt beef", "Cheddar & tomato", "Tuna mix & cucumber"] as const).map((n) => {
    const m: MenuItem = item(n);
    return {
      key: n,
      name: m.name,
      description: m.description,
      tag: m.signature ? "Roni's favourite" : undefined,
      photo: (
        { "Smoked salmon & cream cheese": "bagel-salmon", "Hot salt beef": "bagel-saltbeef", "Cheddar & tomato": "bagel-cheddar", "Tuna mix & cucumber": "bagel-tuna" } as const
      )[n],
      to: "/menu?category=bagels",
    };
  }),
  {
    key: "bakery",
    name: "Bagels to take home",
    description: `${bakery
      .map((b) => b.name.replace(/ bagels$/, "").toLowerCase())
      .join(", ")
      .replace(/, ([^,]*)$/, " and $1")
      .replace(/^./, (c) => c.toUpperCase())}, fresh from the bakery counter.`,
    photo: "bagels",
    to: "/menu?category=bakery",
  },
  (() => {
    const m = item("Mini bagel platter");
    return { key: m.name, name: m.name, description: m.description, photo: "platter" as const, price: m.price, to: "/catering" };
  })(),
];

export default function MenuIndex() {
  const [active, setActive] = useState(0);
  return (
    <section className="section menu-index" id="menu" aria-labelledby="menu-title">
      <div className="container">
        <header className="sec-head">
          <p className="label">
            <span>02</span>
            <span>The menu</span>
          </p>
          <h2 id="menu-title" className="reveal-lines">
            <span className="line">
              <span>What to eat</span>
            </span>
            <span className="line" style={{ ["--i" as string]: 1 }}>
              <span>
                <em>at Roni's.</em>
              </span>
            </span>
          </h2>
        </header>

        <div className="menu-index-body">
          <ol className="menu-rows">
            {ROWS.map((r, i) => (
              <li key={r.key} className={`menu-row${i === active ? " is-active" : ""}`} onPointerEnter={() => setActive(i)}>
                <Photo name={r.photo} sizes="100vw" className="menu-row-photo" alt="" />
                <Link to={r.to} className="menu-row-link" onFocus={() => setActive(i)}>
                  <span className="menu-row-num label tnum">{String(i + 1).padStart(2, "0")}</span>
                  <span className="menu-row-name serif">{r.name}</span>
                  <span className="menu-row-desc">{r.description}</span>
                  <span className="menu-row-meta">
                    {r.tag && <span className="tag">{r.tag}</span>}
                    {r.price && <span className="menu-row-price tnum">{r.price}</span>}
                  </span>
                  <ArrowRight className="menu-row-arrow" />
                </Link>
              </li>
            ))}
          </ol>

          <div className="menu-stage" aria-hidden="true">
            <div className="menu-stage-frame">
              {ROWS.map((r, i) => (
                <Photo
                  key={r.key}
                  name={r.photo}
                  sizes="(min-width: 821px) 40vw, 1px"
                  alt=""
                  className={`menu-stage-photo${i === active ? " is-active" : ""}`}
                  note={i === active}
                />
              ))}
            </div>
            <p className="menu-stage-caption label tnum">
              {String(active + 1).padStart(2, "0")} / {String(ROWS.length).padStart(2, "0")} — {ROWS[active].name}
            </p>
          </div>
        </div>

        <div className="menu-index-foot">
          <p className="small muted">Prices vary by shop and are shown when you order.</p>
          <nav className="menu-index-more" aria-label="More from the menu">
            {menuCategories
              .filter((c) => c.id !== "bagels")
              .map((c) => (
                <Link key={c.id} to={c.id === "platters" ? "/catering" : c.id === "cakes" ? "/cakes" : `/menu?category=${c.id}`}>
                  {c.label}
                </Link>
              ))}
            <Link to="/menu" className="link">
              Full menu <ArrowRight />
            </Link>
          </nav>
        </div>
      </div>
    </section>
  );
}
