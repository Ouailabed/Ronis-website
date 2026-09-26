// Hand-drawn marks. They "draw themselves" when scrolled into view (see .draw in styles.css).
export function Underline({ className = "" }) {
  return (
    <svg className={`scribble underline ${className}`} viewBox="0 0 300 24" preserveAspectRatio="none" aria-hidden="true">
      <path pathLength="1" d="M4 15 C 60 6, 130 20, 190 11 S 270 7, 296 13" />
      <path pathLength="1" d="M30 21 C 90 14, 170 22, 250 16" />
    </svg>
  );
}

export function Circle({ className = "" }) {
  return (
    <svg className={`scribble circle ${className}`} viewBox="0 0 200 90" preserveAspectRatio="none" aria-hidden="true">
      <path pathLength="1" d="M150 12 C 110 -2, 30 4, 10 38 C -6 70, 70 90, 130 82 C 190 74, 206 42, 176 20 C 160 8, 120 6, 96 10" />
    </svg>
  );
}

export function Arrow({ className = "" }) {
  return (
    <svg className={`scribble arrow ${className}`} viewBox="0 0 120 90" aria-hidden="true">
      <path pathLength="1" d="M8 10 C 40 4, 88 16, 92 58 C 93 68, 92 74, 90 80" />
      <path pathLength="1" d="M74 64 L 90 82 L 106 62" />
    </svg>
  );
}
