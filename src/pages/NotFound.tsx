import { Link } from "react-router-dom";
import { useSeo } from "../lib/seo";

export default function NotFound() {
  useSeo("Page not found", "This page doesn't exist. Find the Roni's menu, locations and ordering here.");
  return (
    <section className="page-hero container not-found">
      <p className="eyebrow">404</p>
      <h1>
        This page has <em>a hole in it.</em>
      </h1>
      <p className="lede">We couldn't find that page. Here's where to go instead:</p>
      <div className="hero-actions">
        <Link className="btn" to="/">
          Home
        </Link>
        <Link className="btn btn-ghost" to="/menu">
          Menu
        </Link>
        <Link className="btn btn-ghost" to="/locations">
          Locations
        </Link>
      </div>
    </section>
  );
}
