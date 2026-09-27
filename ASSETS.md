# Assets — what's temporary and how to replace it

No Roni's photography was available to this project, so **every food image is an original digital illustration** rendered from 3D models made for this site (`npm run render:assets`). They are labelled "Illustration" wherever they appear, and the footer says so too. None of them should be presented as a photo of a Roni's product.

## Current images (public/photos)

Each image exists at three widths (`-640`, `-1200`, `-2000`; portrait images top out at 1440px).

| Name | Used on | Replace with (real photography) |
| --- | --- | --- |
| `hero` | Home hero (desktop, wide) | Salmon & cream cheese bagel, low and close, food on the right, dark space on the left for the headline. |
| `hero-tall` | Home hero (phones, tall) | Same dish, portrait, dark space at the top. |
| `signature` | Home "The Roni's bagel" (full width) | The signature bagel with the counter or more bagels behind. |
| `bagel-salmon`, `bagel-saltbeef`, `bagel-cheddar`, `bagel-tuna` | Home menu (4:5), Menu page | Each filled bagel, same angle and surface so they swap cleanly. |
| `bagels` | Home menu, About, shop pages, Menu (bakery) | Plain, sesame and poppy bagels together. |
| `crust` | Home "Since 1989", About | A close-up of a bagel's crust, or an archive photo. |
| `carrot-cake` | Cakes page, Menu | Roni's carrot cake. |
| `platter` | Home menu, Catering page, Menu | A real mini bagel platter (25 minis). |
| `challah` | (spare) | Roni's plaited challah. |
| `public/og.jpg` (1200×630) | Social share preview (from `hero`) | A real photo of the salmon bagel or a shopfront. |

## How to swap in a photo

1. Export the photo at 640, 1200 and 2000px wide as WebP, named like the file it replaces (e.g. `hero-640.webp`, `hero-1200.webp`, `hero-2000.webp`), and put them in `public/photos/`.
2. In [`src/data/photos.ts`](src/data/photos.ts), set `illustration: false` for that image (the "Illustration" label disappears) and write an accurate `alt`.
3. If the crop needs moving, set `focus` (e.g. `"50% 40%"`) — it's the CSS `object-position`.
4. If the new photo has a different shape, update its entry in `src/data/photos.json` (width and height of each file).

## Wanted from Roni's

- Food photography: the four filled bagels, plain/sesame/poppy bagels, challah, carrot cake, a celebration cake, a platter.
- Shop photos: each of the six shopfronts (for the location pages), and the original West End Lane shop.
- Logo files (SVG) if Roni's has an official mark — the current wordmark is set in the site's headline font.
- Any archive material from 1989 for the About page.

## Fonts and icons

- Instrument Serif and Instrument Sans (SIL OFL), bundled via Fontsource — no Google Fonts requests.
- Icons are simple inline SVGs drawn for this project.
