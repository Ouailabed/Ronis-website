# Assets — what's temporary and how to replace it

No Roni's photography was available to this project, so **every food image is an original digital illustration** rendered from the site's own 3D models (`npm run render:assets`). They are labelled "Illustration" wherever they appear, and the footer says so too. None of them should be presented as a photo of a Roni's product.

## Current visuals

| File (public/renders) | Used on | Replace with (real photography) |
| --- | --- | --- |
| `bagel-hero.webp` | Home hero still (shown before / instead of the 3D scene) | Keep: it matches the 3D bagel. Or a cut-out photo of a Roni's sesame bagel, 3/4 view. |
| `bagel-opened.webp`, `bagel-step-30/50/70.webp` | Reduced-motion / no-WebGL story sequence; Menu (filled bagels); social share image | Photo series of a Roni's smoked salmon & cream cheese bagel being assembled. |
| `bagels-trio.webp` | Home showcase "Bagels"; About; shop pages | Plain, sesame and poppy Roni's bagels, cut out or on paper. |
| `challah.webp` | Home showcase "Baked goods"; Menu (bakery) | Roni's plaited challah. |
| `carrot-cake.webp` | Home showcase "Cakes"; Cakes page; Menu | Roni's carrot cake and a bespoke celebration cake. |
| `platter.webp` | Home showcase and catering band; Catering page; Menu | A real Roni's mini bagel platter (25 minis). |
| `top-plain/sesame/poppy.webp` | Home finale (bagels you can throw) | Top-down cut-out photos of three bagels (transparent background). |
| `src/components/Shopfront.tsx` (SVG) | About page | A real photo of the West End Lane shop, ideally a 1989-era one. |

## How to swap in a photo

1. Add the file to `public/photos/` (WebP or AVIF, about 1600px wide; transparent PNG/WebP for cut-outs).
2. Point the component at it. The images are read from `src/data/renders.json` via `RenderImage`. For a real photo, pass `illustration={false}` so the "Illustration" label disappears:
   ```tsx
   <RenderImage src="/photos/platter.webp" width={1600} height={1100} alt="A Roni's mini bagel platter" illustration={false} />
   ```
3. Write a specific `alt` describing what's in the photo.

## Wanted from Roni's

- Food photography: bagels (plain, sesame, poppy), salmon & cream cheese, hot salt beef, challah, carrot cake, a celebration cake, platters.
- Shop photos: each of the six shopfronts (for the location pages), and the original West End Lane shop.
- Logo files (SVG) if Roni's has an official mark — the current wordmark is a placeholder in the site's own style.
- Any archive material from 1989 for the About page.

## Fonts and icons

- Fraunces and Instrument Sans (SIL OFL), bundled via Fontsource — no Google Fonts requests.
- Icons are simple inline SVGs drawn for this project.
