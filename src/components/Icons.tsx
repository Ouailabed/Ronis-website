// Small inline icons (stroke-based, inherit currentColor).
type P = { className?: string; title?: string };
const base = (path: React.ReactNode, { className, title }: P) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden={title ? undefined : true} role={title ? "img" : undefined}>
    {title && <title>{title}</title>}
    {path}
  </svg>
);
export const ArrowRight = (p: P) => base(<path d="M5 12h14M13 6l6 6-6 6" />, p);
export const ArrowUpRight = (p: P) => base(<path d="M7 17 17 7M9 7h8v8" />, p);
export const Pin = (p: P) => base(<><path d="M12 21s-7-6.2-7-11.5A7 7 0 0 1 19 9.5C19 14.8 12 21 12 21Z" /><circle cx="12" cy="9.5" r="2.5" /></>, p);
export const Phone = (p: P) => base(<path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2Z" />, p);
export const Clock = (p: P) => base(<><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></>, p);
export const Bag = (p: P) => base(<><path d="M6 8h12l-1 12H7L6 8Z" /><path d="M9 8V6a3 3 0 0 1 6 0v2" /></>, p);
export const Bike = (p: P) => base(<><circle cx="6" cy="17" r="3" /><circle cx="18" cy="17" r="3" /><path d="M6 17l4-7h5l3 7M10 10 8 6H5M14 6h3" /></>, p);
export const Menu = (p: P) => base(<path d="M4 7h16M4 12h16M4 17h10" />, p);
export const Close = (p: P) => base(<path d="M6 6l12 12M18 6 6 18" />, p);
export const Search = (p: P) => base(<><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></>, p);
export const Calendar = (p: P) => base(<><rect x="3.5" y="5" width="17" height="15" rx="2" /><path d="M3.5 10h17M8 3v4M16 3v4" /></>, p);
export const Instagram = (p: P) => base(<><rect x="3.5" y="3.5" width="17" height="17" rx="5" /><circle cx="12" cy="12" r="4" /><circle cx="17.3" cy="6.7" r="0.6" fill="currentColor" /></>, p);
export const Facebook = (p: P) => base(<path d="M14 8h3V4h-3a4 4 0 0 0-4 4v3H7v4h3v6h4v-6h3l1-4h-4V8Z" />, p);
export const ArrowLeft = (p: P) => base(<path d="M19 12H5M11 6l-6 6 6 6" />, p);
