import { Link } from "react-router-dom";
import { locations } from "../data/business";
import { openStatus } from "../lib/hours";
import { useLondonNow } from "../lib/useLondonNow";

/** "3 open now" — live count of Roni's bakeries open at this moment (London time). */
export default function OpenNowPill() {
  const now = useLondonNow();
  const open = locations.filter((l) => openStatus(l.hours, now)?.open).length;
  return (
    <Link to="/locations" className={`open-pill${open ? " is-open" : ""}`} aria-label={open ? `${open} Roni's bakeries open now — see locations` : "All Roni's bakeries are closed now — see opening times"}>
      <i aria-hidden="true" />
      {open ? `${open} open now` : "Closed now"}
    </Link>
  );
}
