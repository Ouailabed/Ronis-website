import { useState } from "react";
import { Link } from "react-router-dom";
import { menu } from "../../data/business";
import type { PhotoKey } from "../../data/photos";
import { useOrder } from "../../lib/order";
import { ArrowRight } from "../Icons";
import Photo from "../Photo";

const find = (name: string) => menu.find((m) => m.name === name)!;
const takeHome = menu.filter((m) => m.category === "bakery" && / bagels$/.test(m.name)).map((m) => m.name.replace(/ bagels$/, "").toLowerCase());

type Item = { name: string; short: string; description: string; photo: PhotoKey; favourite: boolean; price?: string; to: string };
const fromMenu = (name: string, short: string, photo: PhotoKey, to: string): Item => {
  const m = find(name);
  return { name: m.name, short, description: m.description, photo, favourite: Boolean(m.signature), price: m.price, to };
};

/** Real Roni's items only (src/data/business.ts), each paired with its picture. */
const ITEMS: Item[] = [
  fromMenu("Smoked salmon & cream cheese", "Salmon & cream cheese", "bagel-salmon", "/menu?category=bagels"),
  fromMenu("Hot salt beef", "Hot salt beef", "bagel-saltbeef", "/menu?category=bagels"),
  fromMenu("Tuna mix & cucumber", "Tuna & cucumber", "bagel-tuna", "/menu?category=bagels"),
  fromMenu("Cheddar & tomato", "Cheddar & tomato", "bagel-cheddar", "/menu?category=bagels"),
  {
    name: "Bagels to take home",
    short: "By the bag",
    description: `${takeHome.slice(0, -1).join(", ")} and ${takeHome.at(-1)} bagels, from the bakery counter.`.replace(/^./, (c) => c.toUpperCase()),
    photo: "bagels",
    favourite: false,
    to: "/menu?category=bakery",
  },
  fromMenu("Mini bagel platter", "Mini bagel platter", "platter", "/catering"),
  fromMenu("Carrot cake", "Carrot cake", "carrot-cake", "/cakes"),
];

/**
 * 03 — The bagels. A numbered list on one side, one big photograph on the other.
 * Pointing at (or tapping, or tabbing to) an item wipes its photo in over the last one
 * and swaps the name, description and price beneath it.
 */
export default function Bagels() {
  const { openOrder } = useOrder();
  const [state, setState] = useState({ active: 0, prev: -1 });
  const pick = (i: number) => setState((s) => (s.active === i ? s : { active: i, prev: s.active }));
  const item = ITEMS[state.active];

  return (
    <section className="bagels on-dark" id="bagels" aria-labelledby="bagels-title">
      <div className="bagels-head">
        <p className="label muted">
          <span className="tnum">02</span> — The bagels
        </p>
        <h2 id="bagels-title" className="reveal-lines">
          <span className="line">
            <span>What's on</span>
          </span>
          <span className="line" style={{ ["--i" as string]: 1 }}>
            <span>the counter</span>
          </span>
        </h2>
      </div>

      <div className="bagels-body">
        <ol className="bagels-list" aria-label="Choose an item to see it">
          {ITEMS.map((it, i) => (
            <li key={it.name}>
              <button
                className={`bagels-item${i === state.active ? " is-active" : ""}`}
                aria-pressed={i === state.active}
                onPointerEnter={(e) => e.pointerType === "mouse" && pick(i)}
                onFocus={() => pick(i)}
                onClick={() => pick(i)}
              >
                <span className="bagels-num label tnum">{String(i + 1).padStart(2, "0")}</span>
                <span className="bagels-name">{it.short}</span>
              </button>
            </li>
          ))}
        </ol>

        <div className="bagels-stage">
          <div className="bagels-frame">
            {ITEMS.map((it, i) => (
              <Photo
                key={it.name}
                name={it.photo}
                alt=""
                sizes="(min-width: 761px) 44vw, 100vw"
                note={i === state.active}
                className={`bagels-photo${i === state.active ? " is-active" : i === state.prev ? " is-prev" : ""}`}
              />
            ))}
            <span className="bagels-count label tnum" aria-hidden="true">
              {String(state.active + 1).padStart(2, "0")} / {String(ITEMS.length).padStart(2, "0")}
            </span>
          </div>
          <div className="bagels-detail" aria-live="polite" key={state.active}>
            <div className="bagels-detail-top">
              <h3 className="serif">{item.name}</h3>
              {item.price ? <span className="bagels-price display tnum">{item.price}</span> : item.favourite ? <span className="tag">Roni's favourite</span> : null}
            </div>
            <p className="muted">{item.description}</p>
            <div className="bagels-actions">
              <button className="btn btn-paper btn-sm" onClick={() => openOrder()}>
                Order <ArrowRight />
              </button>
              <Link to={item.to} className="link small">
                {item.price ? "Details" : "On the menu"} <ArrowRight />
              </Link>
              {!item.price && <span className="small muted">Prices vary by shop</span>}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
