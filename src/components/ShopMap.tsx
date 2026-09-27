import { locations, type Location } from "../data/business";

// Schematic map of north-west London. Positions are approximate — the Directions
// buttons always use the real address.
const B = { n: 51.602, s: 51.535, w: -0.24, e: -0.128 };
const W = 400,
  H = 340;
const LABEL: Record<string, { dx: number; dy: number; anchor: "start" | "end" | "middle" }> = {
  "west-hampstead": { dx: -14, dy: 16, anchor: "end" },
  "belsize-village": { dx: 14, dy: 18, anchor: "start" },
  hampstead: { dx: 14, dy: 0, anchor: "start" },
  "swains-lane": { dx: 14, dy: 4, anchor: "start" },
  "muswell-hill": { dx: -14, dy: 4, anchor: "end" },
  "brent-cross": { dx: 14, dy: 4, anchor: "start" },
};
const project = (l: Location) => ({
  x: 20 + ((l.approx.lng - B.w) / (B.e - B.w)) * (W - 40),
  y: 20 + ((B.n - l.approx.lat) / (B.n - B.s)) * (H - 40),
});

export default function ShopMap({ active, onPick }: { active?: string | null; onPick?: (slug: string) => void }) {
  return (
    <figure className="shop-map">
      <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label="Schematic map of the six Roni's bakeries in North London">
        <defs>
          <pattern id="map-grid" width="24" height="24" patternUnits="userSpaceOnUse" patternTransform="rotate(-12)">
            <path d="M0 12h24M12 0v24" className="map-grid" />
          </pattern>
        </defs>
        <rect width={W} height={H} fill="url(#map-grid)" />
        {/* Hampstead Heath, roughly placed as a landmark */}
        <path className="map-heath" d="M214 150c22-18 70-20 98-4 18 11 13 40-4 55-22 20-66 22-88 7-18-13-22-42-6-58Z" />
        <text className="map-area" x="236" y="186">
          Hampstead Heath
        </text>
        {locations.map((l, i) => {
          const p = project(l);
          const on = l.slug === active;
          const lab = LABEL[l.slug] ?? { dx: 14, dy: 4, anchor: "start" as const };
          return (
            <g key={l.slug} className={`map-pin${on ? " is-active" : ""}`} transform={`translate(${p.x.toFixed(1)} ${p.y.toFixed(1)})`} onClick={() => onPick?.(l.slug)}>
              <circle r={on ? 13 : 10} />
              <text className="map-num" y="4">
                {i + 1}
              </text>
              <text className="map-label" x={lab.dx} y={lab.dy} textAnchor={lab.anchor}>
                {l.name}
              </text>
            </g>
          );
        })}
      </svg>
      <figcaption className="small muted">Schematic map, not to scale</figcaption>
    </figure>
  );
}
