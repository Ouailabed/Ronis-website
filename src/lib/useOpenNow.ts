import { locations } from "../data/business";
import { openStatus } from "./hours";
import { useLondonNow } from "./useLondonNow";

/** Which Roni's are open right now (London time), refreshed every 30 seconds. */
export function useOpenNow() {
  const now = useLondonNow();
  const open = locations.filter((l) => openStatus(l.hours, now)?.open);
  const summary =
    open.length === 0
      ? "All our bakeries are closed right now"
      : open.length === 1
        ? `Open now: Roni's ${open[0].name}`
        : `${open.length} bakeries open now`;
  return { now, open, summary };
}
