import { locations } from "../data/business";
import { telHref } from "../lib/hours";
import { Phone } from "./Icons";

/** Every shop's phone number, as big tap targets. */
export default function CallGrid() {
  return (
    <ul className="call-grid">
      {locations.map((l) => (
        <li key={l.slug}>
          <a href={telHref(l.phone)}>
            <span className="serif">{l.name}</span>
            <span className="call-num tnum">
              <Phone />
              {l.phone}
            </span>
          </a>
        </li>
      ))}
    </ul>
  );
}
