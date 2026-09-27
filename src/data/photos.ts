import raw from "./photos.json";

/*
 * ============================================================================
 *  PHOTOGRAPHY — every food image on the site comes from this file.
 * ============================================================================
 *  The images in /public/photos are digital illustrations rendered from 3D
 *  models (scripts/render-assets.mjs), shown with an "Illustration" label.
 *
 *  To use real photography:
 *    1. Save the photo in /public/photos at three widths, named like the
 *       existing files (e.g. hero-640.webp, hero-1200.webp, hero-2000.webp),
 *       or point `sizes` below at your own files.
 *    2. Set `illustration: false` and write an accurate `alt`.
 *    3. Adjust `focus` (CSS object-position) if the crop needs moving.
 * ============================================================================
 */

type Size = { src: string; w: number; h: number };
export type PhotoKey = keyof typeof raw;
export type Photo = { sizes: Size[]; alt: string; illustration: boolean; focus?: string };

const base = import.meta.env.BASE_URL;

const meta: Record<PhotoKey, Omit<Photo, "sizes">> = {
  hero: { alt: "A sesame bagel filled with smoked salmon and cream cheese on striped deli paper", illustration: true, focus: "50% 42%" },
  "hero-tall": { alt: "A sesame bagel filled with smoked salmon and cream cheese on striped deli paper", illustration: true, focus: "50% 55%" },
  signature: { alt: "A smoked salmon and cream cheese bagel with more bagels behind it", illustration: true, focus: "45% 60%" },
  "bagel-salmon": { alt: "Smoked salmon and cream cheese in a sesame bagel", illustration: true },
  "bagel-saltbeef": { alt: "Salt beef with mustard and pickles in a sesame bagel", illustration: true },
  "bagel-cheddar": { alt: "Cheddar and tomato in a plain bagel", illustration: true },
  "bagel-tuna": { alt: "Tuna mix and cucumber in a poppy seed bagel", illustration: true },
  bagels: { alt: "Plain, sesame and poppy seed bagels on deli paper", illustration: true, focus: "50% 55%" },
  crust: { alt: "Close-up of a sesame bagel's crust", illustration: true, focus: "50% 72%" },
  challah: { alt: "A plaited challah loaf", illustration: true },
  "carrot-cake": { alt: "A carrot cake with cream cheese frosting, one slice cut", illustration: true },
  platter: { alt: "A round platter of filled mini bagels", illustration: true },
};

export const photos = Object.fromEntries(
  (Object.keys(raw) as PhotoKey[]).map((k) => [k, { ...meta[k], sizes: raw[k].map((s) => ({ ...s, src: base + s.src.replace(/^\//, "") })) }]),
) as Record<PhotoKey, Photo>;
