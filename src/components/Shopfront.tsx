/** Illustrated bakery shopfront (decorative). Not a depiction of a specific Roni's shop. */
export default function Shopfront() {
  const stripes = Array.from({ length: 12 }, (_, i) => i);
  return (
    <figure className="shopfront">
      <svg viewBox="0 0 480 420" role="img" aria-label="Illustration of a bakery shopfront with a striped awning and bagels in the window">
        <rect x="20" y="40" width="440" height="370" rx="6" fill="#fbf7ee" stroke="#1d3a5f" strokeWidth="4" />
        <rect x="20" y="40" width="440" height="70" fill="#1d3a5f" />
        <text x="240" y="88" textAnchor="middle" fontFamily="Fraunces Variable, Georgia, serif" fontSize="40" fontWeight="700" fill="#fbf7ee">
          Roni's
        </text>
        <g className="awning">
          {stripes.map((i) => (
            <path key={i} d={`M${20 + i * 36.67} 110 h36.67 v44 q-18.33 16 -36.67 0 Z`} fill={i % 2 ? "#fbf7ee" : "#c8873a"} stroke="#1d3a5f" strokeWidth="2" />
          ))}
        </g>
        <rect x="46" y="186" width="250" height="176" rx="4" fill="#d9e2ee" stroke="#1d3a5f" strokeWidth="4" />
        <path d="M46 300 h250" stroke="#1d3a5f" strokeWidth="3" />
        {/* bagels stacked in the window */}
        {[[90, 286], [140, 286], [190, 286], [240, 286], [115, 258], [165, 258], [215, 258], [140, 232], [190, 232]].map(([x, y], i) => (
          <g key={i}>
            <ellipse cx={x} cy={y} rx="24" ry="12" fill={i % 3 === 2 ? "#b77a3c" : "#9a5a24"} stroke="#5e3514" strokeWidth="2" />
            <ellipse cx={x} cy={y - 1} rx="7" ry="3.5" fill="#d9e2ee" stroke="#5e3514" strokeWidth="1.5" />
          </g>
        ))}
        <rect x="320" y="186" width="114" height="224" rx="4" fill="#1d3a5f" />
        <rect x="334" y="202" width="86" height="92" rx="3" fill="#d9e2ee" />
        <circle cx="410" cy="330" r="5" fill="#c8873a" />
        <rect x="60" y="316" width="220" height="30" rx="4" fill="#fbf7ee" />
        <text x="170" y="337" textAnchor="middle" fontFamily="Instrument Sans Variable, sans-serif" fontSize="14" fontWeight="700" fill="#1d3a5f" letterSpacing="3">
          BAGEL BAKERY
        </text>
        <path d="M0 410 h480" stroke="#1d3a5f" strokeWidth="4" />
      </svg>
      <figcaption className="render-note">Illustration</figcaption>
    </figure>
  );
}
