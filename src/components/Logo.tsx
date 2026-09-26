/** Roni's wordmark with a small bagel ring as the mark. */
export default function Logo({ light = false }: { light?: boolean }) {
  return (
    <span className={`logo${light ? " logo-light" : ""}`}>
      <svg className="logo-mark" viewBox="0 0 40 40" aria-hidden="true">
        <circle cx="20" cy="20" r="15" fill="none" stroke="currentColor" strokeWidth="7.5" />
        <g fill="var(--logo-seed, #f6eedf)">
          <ellipse cx="13" cy="10.5" rx="1.6" ry="0.8" transform="rotate(30 13 10.5)" />
          <ellipse cx="27" cy="9.8" rx="1.6" ry="0.8" transform="rotate(-25 27 9.8)" />
          <ellipse cx="31" cy="23" rx="1.6" ry="0.8" transform="rotate(80 31 23)" />
          <ellipse cx="9" cy="25" rx="1.6" ry="0.8" transform="rotate(-70 9 25)" />
          <ellipse cx="21" cy="33" rx="1.6" ry="0.8" transform="rotate(5 21 33)" />
        </g>
      </svg>
      <span className="logo-text">
        <span className="logo-name">Roni's</span>
        <span className="logo-sub">Bagel Bakery · 1989</span>
      </span>
    </span>
  );
}
