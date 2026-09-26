import { useEffect, useState } from "react";
import { londonNow } from "./hours";

/** London time, refreshed every 30 seconds (drives "Open now" badges). */
export function useLondonNow() {
  const [now, setNow] = useState(() => londonNow());
  useEffect(() => {
    const id = window.setInterval(() => setNow(londonNow()), 30_000);
    return () => window.clearInterval(id);
  }, []);
  return now;
}
