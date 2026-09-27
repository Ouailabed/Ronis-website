import { useCallback, useState } from "react";
import { locations, type Location } from "../data/business";

export type Nearby = { slug: string; km: number };

const toRad = (d: number) => (d * Math.PI) / 180;
/** Straight-line distance in km (good enough to rank six nearby shops). */
export function distanceKm(a: { lat: number; lng: number }, b: { lat: number; lng: number }) {
  const dLat = toRad(b.lat - a.lat), dLng = toRad(b.lng - a.lng);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 6371 * 2 * Math.asin(Math.sqrt(h));
}

export const formatKm = (km: number) => (km < 1 ? `${Math.round(km * 1000 / 50) * 50} m` : `${km.toFixed(km < 10 ? 1 : 0)} km`);

/** Asks the browser for the visitor's location (only when they tap the button) and ranks the shops. */
export function useNearest() {
  const [state, setState] = useState<{ status: "idle" | "locating" | "done" | "error"; ranked: Nearby[]; message?: string }>({ status: "idle", ranked: [] });
  const locate = useCallback(() => {
    if (!("geolocation" in navigator)) {
      setState({ status: "error", ranked: [], message: "Your browser can't share your location. Pick a bakery from the list instead." });
      return;
    }
    setState((s) => ({ ...s, status: "locating" }));
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const me = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        const ranked = locations.map((l: Location) => ({ slug: l.slug, km: distanceKm(me, l.approx) })).sort((a, b) => a.km - b.km);
        setState({ status: "done", ranked });
      },
      () => setState({ status: "error", ranked: [], message: "We couldn't get your location. Check your location permission, or pick a bakery from the list." }),
      { enableHighAccuracy: false, timeout: 10000, maximumAge: 300000 },
    );
  }, []);
  return { ...state, locate };
}
