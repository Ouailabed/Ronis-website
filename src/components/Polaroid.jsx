import { useState } from "react";

// A taped-up instant photo with a handwritten caption.
// Hides itself if the image is missing, so the page never shows a broken picture.
export default function Polaroid({ src, caption, className = "", loading = "lazy" }) {
  const [failed, setFailed] = useState(false);
  if (!src || failed) return null;
  return (
    <figure className={`polaroid ${className}`}>
      <span className="tape" aria-hidden="true" />
      <img src={src} alt={caption || ""} loading={loading} decoding="async" onError={() => setFailed(true)} />
      {caption && <figcaption className="hand">{caption}</figcaption>}
    </figure>
  );
}
