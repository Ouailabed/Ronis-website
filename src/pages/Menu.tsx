import { useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Bag, Search } from "../components/Icons";
import RenderImage from "../components/RenderImage";
import { menu, menuCategories, type MenuCategory } from "../data/business";
import renders from "../data/renders";
import { useOrder } from "../lib/order";
import { useSeo } from "../lib/seo";

const ART: Partial<Record<MenuCategory, { img: { src: string; width: number; height: number }; alt: string }>> = {
  bagels: { img: renders["bagel-opened"], alt: "Illustration of a smoked salmon and cream cheese bagel" },
  bakery: { img: renders.challah, alt: "Illustration of a plaited challah" },
  cakes: { img: renders["carrot-cake"], alt: "Illustration of a carrot cake" },
  platters: { img: renders.platter, alt: "Illustration of a mini bagel platter" },
};

export default function Menu() {
  const { openOrder } = useOrder();
  const [params, setParams] = useSearchParams();
  const [query, setQuery] = useState("");
  const active = (params.get("category") as MenuCategory | null) ?? null;
  useSeo("Menu", "The Roni's menu: filled bagels, bagels, challah, breakfasts, cakes, salads, coffee and catering platters. Order online for collection from your nearest Roni's.");

  const q = query.trim().toLowerCase();
  const groups = useMemo(
    () =>
      menuCategories
        .filter((c) => !active || c.id === active)
        .map((c) => ({
          ...c,
          items: menu.filter((m) => m.category === c.id && (!q || `${m.name} ${m.description}`.toLowerCase().includes(q))),
        }))
        .filter((g) => g.items.length),
    [active, q],
  );
  const total = groups.reduce((n, g) => n + g.items.length, 0);

  const pick = (id: MenuCategory | null) => {
    const next = new URLSearchParams(params);
    if (id) next.set("category", id);
    else next.delete("category");
    setParams(next, { replace: true });
  };

  return (
    <>
      <section className="page-hero container">
        <p className="eyebrow">The menu</p>
        <h1>
          What's on <em>the counter.</em>
        </h1>
        <p className="lede">From the first bagel of the morning to platters for a crowd. Prices and availability vary by shop — you'll see them when you order.</p>
      </section>

      <div className="menu-tools container" role="search">
        <label className="menu-search">
          <Search />
          <span className="visually-hidden">Search the menu</span>
          <input type="search" placeholder="Search the menu — try “salmon” or “challah”" value={query} onChange={(e) => setQuery(e.target.value)} />
        </label>
        <div className="menu-filters" role="group" aria-label="Filter by category">
          <button className={!active ? "is-active" : ""} aria-pressed={!active} onClick={() => pick(null)}>
            Everything
          </button>
          {menuCategories.map((c) => (
            <button key={c.id} className={active === c.id ? "is-active" : ""} aria-pressed={active === c.id} onClick={() => pick(c.id)}>
              {c.label}
            </button>
          ))}
        </div>
        <p className="small menu-count" aria-live="polite">
          {total} {total === 1 ? "item" : "items"}
          {q && ` matching “${query.trim()}”`}
        </p>
      </div>

      <div className="container menu-groups">
        {groups.length === 0 && (
          <div className="menu-empty">
            <p>Nothing matches “{query.trim()}”.</p>
            <button className="btn btn-ghost btn-small" onClick={() => { setQuery(""); pick(null); }}>
              Show the whole menu
            </button>
          </div>
        )}
        {groups.map((g) => (
          <section key={g.id} id={g.id} className="menu-group" aria-labelledby={`${g.id}-h`}>
            <header className="menu-group-head">
              <div>
                <h2 id={`${g.id}-h`}>{g.label}</h2>
                <p className="small">{g.blurb}</p>
              </div>
              {ART[g.id] && (
                <div className="menu-group-art">
                  <RenderImage src={ART[g.id]!.img.src} width={ART[g.id]!.img.width} height={ART[g.id]!.img.height} alt={ART[g.id]!.alt} />
                </div>
              )}
            </header>
            <ul className="menu-items">
              {g.items.map((m) => (
                <li key={m.name} className={m.signature ? "is-signature" : undefined}>
                  <div className="menu-item-line">
                    <h3>{m.name}</h3>
                    {m.signature && <span className="chip">Roni's favourite</span>}
                    {m.price && (
                      <>
                        <span className="menu-dots" aria-hidden="true" />
                        <span className="menu-price">{m.price}</span>
                      </>
                    )}
                  </div>
                  <p>{m.description}</p>
                </li>
              ))}
            </ul>
            {g.id === "platters" && (
              <p className="small menu-note">
                Order platters at least 48 hours ahead. <Link to="/catering">Catering details</Link>
              </p>
            )}
          </section>
        ))}
      </div>

      <section className="container menu-cta">
        <div>
          <h2>
            Ready to <em>order?</em>
          </h2>
          <p className="lede">Choose your Roni's, then call the shop to order for collection or get delivery where available. Prices are confirmed by the shop.</p>
        </div>
        <div className="menu-cta-actions">
          <button className="btn" onClick={() => openOrder()}>
            <Bag />
            Order now
          </button>
          <Link className="btn btn-ghost" to="/locations">
            Find your Roni's
          </Link>
        </div>
      </section>
    </>
  );
}
