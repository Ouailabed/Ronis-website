import { useEffect, useRef, useState } from "react";
import type { Map as LeafletMap, Marker } from "leaflet";
import "leaflet/dist/leaflet.css";
import { locations } from "../data/business";
import { directionsUrl, fullAddress } from "../lib/hours";

type Props = {
  /** highlighted shop */
  selected?: string;
  /** called when a pin is clicked */
  onSelect?: (slug: string) => void;
  /** only show these shops (default: all six) */
  only?: string[];
  className?: string;
};

const esc = (t: string) => t.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]!);

/**
 * A real street map (OpenStreetMap data, CARTO tiles) with a numbered pin per Roni's.
 * Leaflet is only downloaded when the map scrolls into view. The page never depends on
 * it: every shop's address and Directions link are always in the list next to it.
 */
export default function ShopsMap({ selected, onSelect, only, className = "" }: Props) {
  const host = useRef<HTMLDivElement>(null);
  const map = useRef<LeafletMap | null>(null);
  const markers = useRef<Record<string, Marker>>({});
  const onSelectRef = useRef(onSelect);
  onSelectRef.current = onSelect;
  const [state, setState] = useState<"idle" | "ready" | "error">("idle");
  const shops = locations.filter((l) => !only || only.includes(l.slug));

  useEffect(() => {
    const el = host.current;
    if (!el) return;
    let cancelled = false;
    const start = async () => {
      try {
        const { default: L } = await import("leaflet");
        if (cancelled || map.current) return;
        const coarse = window.matchMedia("(pointer: coarse)").matches;
        const m = L.map(el, {
          scrollWheelZoom: false, // never hijack page scrolling
          dragging: !coarse, // on phones one finger scrolls the page, not the map
          tapHold: false,
          zoomControl: true,
          attributionControl: true,
        });
        L.tileLayer("https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png", {
          subdomains: "abcd",
          maxZoom: 19,
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
        }).addTo(m);
        m.attributionControl.setPrefix('<a href="https://leafletjs.com">Leaflet</a>');
        const pin = (n: number) =>
          L.divIcon({ className: "shop-pin", html: `<span><b>${n}</b></span>`, iconSize: [34, 34], iconAnchor: [17, 34], popupAnchor: [0, -30] });
        shops.forEach((l) => {
          const n = locations.indexOf(l) + 1;
          const mk = L.marker([l.approx.lat, l.approx.lng], { icon: pin(n), title: `Roni's ${l.name}`, keyboard: true, riseOnHover: true })
            .addTo(m)
            .bindPopup(
              `<strong>Roni's ${esc(l.name)}</strong><br>${esc(fullAddress(l))}<br><a href="${esc(directionsUrl(l))}" target="_blank" rel="noopener">Directions ↗</a>`,
            );
          mk.on("click", () => onSelectRef.current?.(l.slug));
          markers.current[l.slug] = mk;
        });
        if (shops.length === 1) m.setView([shops[0].approx.lat, shops[0].approx.lng], 15);
        else m.fitBounds(L.latLngBounds(shops.map((l) => [l.approx.lat, l.approx.lng] as [number, number])), { padding: [36, 36] });
        map.current = m;
        requestAnimationFrame(() => m.invalidateSize());
        setState("ready");
      } catch {
        if (!cancelled) setState("error");
      }
    };
    // load when the map is about to come into view
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          io.disconnect();
          start();
        }
      },
      { rootMargin: "300px" },
    );
    io.observe(el);
    return () => {
      cancelled = true;
      io.disconnect();
      map.current?.remove();
      map.current = null;
      markers.current = {};
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // highlight the selected shop and bring it into view
  useEffect(() => {
    if (state !== "ready" || !map.current) return;
    Object.entries(markers.current).forEach(([slug, mk]) => mk.getElement()?.classList.toggle("is-active", slug === selected));
    const shop = locations.find((l) => l.slug === selected);
    // only move the map if the chosen pin is out of view
    if (shop && shops.length > 1 && !map.current.getBounds().pad(-0.1).contains([shop.approx.lat, shop.approx.lng])) {
      map.current.panTo([shop.approx.lat, shop.approx.lng], { animate: true });
    }
  }, [selected, state, shops.length]);

  return (
    <div className={`shops-map ${className}`}>
      <div ref={host} className="shops-map-canvas" role="region" aria-label="Map of Roni's bakeries in North London" />
      {state === "error" && <p className="shops-map-fallback small">The map couldn't load. Every address and Directions link is listed alongside.</p>}
    </div>
  );
}
