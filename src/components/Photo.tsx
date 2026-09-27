import type { CSSProperties } from "react";
import { photos, type PhotoKey } from "../data/photos";

type Props = {
  name: PhotoKey;
  /** the `sizes` attribute: how wide the image is shown, so the browser picks the right file */
  sizes: string;
  /** a different crop for another screen shape, e.g. a tall version for phones */
  art?: { media: string; name: PhotoKey };
  alt?: string;
  className?: string;
  priority?: boolean;
  /** show the "Illustration" label (on by default for illustrations) */
  note?: boolean;
  style?: CSSProperties;
};

const srcSet = (name: PhotoKey) => photos[name].sizes.map((s) => `${s.src} ${s.w}w`).join(", ");

/**
 * A food photograph from src/data/photos.ts, with responsive sources and the
 * "Illustration" label while the images are renders rather than real photos.
 */
export default function Photo({ name, sizes, art, alt, className = "", priority = false, note = true, style }: Props) {
  const p = photos[name];
  const largest = p.sizes[p.sizes.length - 1];
  return (
    <figure className={`photo ${className}`} style={style}>
      <picture>
        {art && <source media={art.media} srcSet={srcSet(art.name)} sizes={sizes} />}
        <img
          src={(p.sizes[1] ?? largest).src}
          srcSet={srcSet(name)}
          sizes={sizes}
          width={largest.w}
          height={largest.h}
          alt={alt ?? p.alt}
          loading={priority ? "eager" : "lazy"}
          fetchPriority={priority ? "high" : undefined}
          decoding="async"
          style={p.focus ? { objectPosition: p.focus } : undefined}
        />
      </picture>
      {note && p.illustration && <figcaption className="photo-note">Illustration</figcaption>}
    </figure>
  );
}
