import { useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import OrderBlock from "../components/home/OrderBlock";
import { ArrowRight, Search } from "../components/Icons";
import Photo from "../components/Photo";
import { menu, menuCategories, type MenuCategory } from "../data/business";
import type { PhotoKey } from "../data/photos";
import { useSeo } from "../lib/seo";

const ART: Partial<Record<MenuCategory, PhotoKey>> = {
  bagels: "bagel-salmon",
  bakery: "bagels",
  cakes: "carrot-cake",
  platters: "platter",
};

export default function Menu() {
  const [params, setParams] = useSearchParams();
  const [query, setQuery] = useState("");
  const active = (params.get("category") as MenuCategory | null) ?? null;
  useSeo("Menu", "The Roni's menu: filled bagels, bagels, challah, breakfasts, cakes, salads, coffee and catering platters. Order online for collection from your nearest Roni's.");

  const q = query.trim().toLowerCase();
  const groups = useMemo(
    () =>
      menuCategories
        .filter((c) => !active || c.id === active)
        .map((c) => ({ ...c, items: menu.filter((m) => m.category === c.id && (!q || `${m.name} ${m.description}`.toLowerCase().includes(q))) }))
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
      <header className="container page-head">
        <p className="label">
          <span>Roni's</span>
          <span>The menu</span>
        </p>
        <h1 className="reveal-lines">
          <span className="line">
            <span>What's on</span>
          </span>
          <span className="line" style={{ ["--i" as string]: 1 }}>
            <span>
              <em>the counter.</em>
            </span>
          </span>
        </h1>
        <p className="lede">From the first bagel of the morning to platters for a crowd. Prices vary by shop — you'll see them when you order.</p>
      </header>

      <div className="menu-tools">
        <div className="container menu-tools-inner" role="search">
          <label className="menu-search">
            <Search />
            <span className="visually-hidden">Search the menu</span>
            <input type="search" placeholder="Search — try “salmon” or “challah”" value={query} onChange={(e) => setQuery(e.target.value)} />
          </label>
          <div className="chips" role="group" aria-label="Filter by category">
            <button className={`chip${!active ? " is-active" : ""}`} aria-pressed={!active} onClick={() => pick(null)}>
              Everything
            </button>
            {menuCategories.map((c) => (
              <button key={c.id} className={`chip${active === c.id ? " is-active" : ""}`} aria-pressed={active === c.id} onClick={() => pick(c.id)}>
                {c.label}
              </button>
            ))}
          </div>
          <p className="small muted menu-count" aria-live="polite">
            {total} {total === 1 ? "item" : "items"}
            {q && ` matching “${query.trim()}”`}
          </p>
        </div>
      </div>

      <div className="container menu-groups">
        {groups.length === 0 && (
          <div className="menu-empty">
            <p className="h3">Nothing matches “{query.trim()}”.</p>
            <button
              className="btn btn-line btn-sm"
              onClick={() => {
                setQuery("");
                pick(null);
              }}
            >
              Show the whole menu
            </button>
          </div>
        )}
        {groups.map((g, gi) => (
          <section key={g.id} id={g.id} className="menu-group" aria-labelledby={`${g.id}-h`}>
            <div className="menu-group-side">
              <p className="label muted tnum">{String(menuCategories.findIndex((c) => c.id === g.id) + 1).padStart(2, "0")}</p>
              <h2 id={`${g.id}-h`} className="menu-group-title">
                {g.label}
              </h2>
              <p className="small muted">{g.blurb}</p>
              {ART[g.id] && <Photo name={ART[g.id]!} sizes="(min-width: 821px) 30vw, 100vw" className={`menu-group-photo${gi < 1 ? "" : " reveal-photo"}`} alt="" />}
            </div>
            <ul className="menu-list">
              {g.items.map((m) => (
                <li key={m.name}>
                  <div className="menu-line">
                    <h3 className="serif">{m.name}</h3>
                    {m.price && (
                      <>
                        <span className="menu-dots" aria-hidden="true" />
                        <span className="menu-price tnum">{m.price}</span>
                      </>
                    )}
                  </div>
                  <p className="muted">{m.description}</p>
                  {m.signature && <span className="tag">Roni's favourite</span>}
                </li>
              ))}
              {g.id === "platters" && (
                <li className="menu-list-note">
                  <p className="small">
                    Order platters at least 48 hours ahead.{" "}
                    <Link className="link" to="/catering">
                      Catering details <ArrowRight />
                    </Link>
                  </p>
                </li>
              )}
            </ul>
          </section>
        ))}
      </div>

      <OrderBlock />
    </>
  );
}
