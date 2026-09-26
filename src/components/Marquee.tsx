/** A scrolling band of words, repeated to fill the width. Decorative (hidden from screen readers). */
export default function Marquee({ items, className = "", speed = 28, reverse = false }: { items: string[]; className?: string; speed?: number; reverse?: boolean }) {
  const row = (
    <div className="marquee-track" style={{ animationDirection: reverse ? "reverse" : undefined }}>
      {items.map((t, i) => (
        <span key={i} className="marquee-item">
          {t}
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <circle cx="12" cy="12" r="8" fill="none" stroke="currentColor" strokeWidth="5" />
          </svg>
        </span>
      ))}
    </div>
  );
  return (
    <div className={`marquee ${className}`} style={{ "--speed": `${speed}s` } as React.CSSProperties} aria-hidden="true">
      {row}
      {row}
    </div>
  );
}
