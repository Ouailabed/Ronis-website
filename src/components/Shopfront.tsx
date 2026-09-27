/**
 * Illustrated Roni's shopfront in the shop's real colours: sage paintwork, painted
 * fascia lettering, bottle-green awning with blue-and-white stripes, and bagels in the window.
 * Decorative; replace with a photo of the shop when available (see ASSETS.md).
 */
export default function Shopfront() {
  const stripes = Array.from({ length: 16 }, (_, i) => i);
  const bagels: [number, number][] = [
    [96, 300], [140, 300], [184, 300], [228, 300], [118, 276], [162, 276], [206, 276], [140, 252], [184, 252],
  ];
  return (
    <figure className="shopfront">
      <svg viewBox="0 0 480 440" role="img" aria-label="Illustration of the Roni's shopfront: sage paintwork, a striped blue-and-white awning and bagels in the window">
        {/* brick wall behind */}
        <rect x="0" y="0" width="480" height="440" fill="#b9745a" />
        <g stroke="#a3614a" strokeWidth="2">
          {Array.from({ length: 22 }, (_, r) => (
            <path key={r} d={`M0 ${r * 20} H480`} />
          ))}
        </g>
        {/* shopfront body */}
        <rect x="24" y="36" width="432" height="404" fill="#8ba593" />
        {/* fascia with painted lettering */}
        <rect x="24" y="36" width="432" height="64" fill="#7c9784" />
        <rect x="34" y="44" width="412" height="48" rx="3" fill="none" stroke="#f4eee2" strokeOpacity="0.6" strokeWidth="1.5" />
        <text x="240" y="77" textAnchor="middle" fontFamily="Gloock, Georgia, serif" fontSize="20" letterSpacing="1.5" fill="#fbf8f1">
          RONI'S BAGEL BAKERY &amp; CAFE
        </text>
        {/* awning: blue & white stripes with a bottle-green valance */}
        <g className="awning-svg">
          {stripes.map((i) => (
            <rect key={i} x={24 + i * 27} y="100" width="27" height="40" fill={i % 2 ? "#fbf8f1" : "#2b4c93"} />
          ))}
          <path d={`M24 140 ${stripes.map(() => `q13.5 14 27 0`).join(" ")} V140 Z`} fill="#1d3a2f" />
          <rect x="24" y="138" width="432" height="6" fill="#1d3a2f" />
        </g>
        {/* shop window */}
        <rect x="52" y="176" width="232" height="190" fill="#d7e1d8" stroke="#56725f" strokeWidth="6" />
        <path d="M168 176 V366" stroke="#56725f" strokeWidth="4" />
        <rect x="60" y="322" width="216" height="10" fill="#e6d9bf" />
        {bagels.map(([x, y], i) => (
          <g key={i}>
            <ellipse cx={x} cy={y + 20} rx="20" ry="10" fill={i % 3 === 2 ? "#c08548" : "#9a5a24"} />
            <ellipse cx={x} cy={y + 19} rx="6" ry="3" fill="#d7e1d8" />
          </g>
        ))}
        {/* door */}
        <rect x="316" y="176" width="112" height="264" fill="#56725f" />
        <rect x="330" y="192" width="84" height="120" fill="#d7e1d8" stroke="#1d3a2f" strokeWidth="3" />
        <rect x="330" y="326" width="84" height="96" fill="none" stroke="#1d3a2f" strokeWidth="3" />
        <circle cx="404" cy="316" r="5" fill="#b88f4a" />
        {/* stall base */}
        <rect x="24" y="366" width="292" height="74" fill="#7c9784" />
        <rect x="40" y="382" width="260" height="42" fill="none" stroke="#56725f" strokeWidth="3" />
        {/* flower buckets outside */}
        {[340, 372, 404, 436].map((x, i) => (
          <g key={x}>
            <rect x={x - 12} y="408" width="24" height="32" fill="#2b4c93" />
            {[-8, 0, 8].map((dx, j) => (
              <circle key={j} cx={x + dx} cy={402 - (j % 2) * 6} r="7" fill={["#e8849b", "#f2c14e", "#f07b52", "#e8849b"][(i + j) % 4]} />
            ))}
          </g>
        ))}
      </svg>
      <figcaption className="render-note">Illustration</figcaption>
    </figure>
  );
}
