/** A few soft wisps of steam rising above the hero bagel (CSS-animated, decorative). */
export default function Steam() {
  return (
    <svg className="steam" viewBox="0 0 200 160" aria-hidden="true">
      <defs>
        <filter id="steam-blur" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="5" />
        </filter>
      </defs>
      <g filter="url(#steam-blur)" fill="none" stroke="#fff" strokeWidth="9" strokeLinecap="round">
        <path className="wisp w1" d="M60 150 C 45 120, 80 100, 62 70 S 70 30, 58 8" />
        <path className="wisp w2" d="M100 150 C 118 118, 84 96, 104 64 S 92 26, 106 4" />
        <path className="wisp w3" d="M140 150 C 126 124, 158 102, 140 74 S 150 36, 138 12" />
      </g>
    </svg>
  );
}
