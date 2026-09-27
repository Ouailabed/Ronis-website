# Roni's Bagel Bakery — website

A website for **Roni's Bagel Bakery** (North London, since 1989), designed like an editorial food magazine: big food photography, a clear menu, six shops with live opening times, and ordering that goes straight to Roni's real channels.

Built with **Vite + React + TypeScript + React Router**, with GSAP for a few scroll effects. No backend: it's a static site that links to Roni's real ordering destinations.

---

## Run it

Requires Node.js 20+.

```bash
npm install
npm run dev            # local dev server → http://localhost:5173
npm run build          # type-check + production build → dist/
npm run preview        # serve the production build → http://localhost:4173
npm run test:e2e       # end-to-end + axe accessibility checks against the build (needs Chromium)
npm run render:assets  # re-render the food illustrations into public/photos
```

`test:e2e` and `render:assets` use Chromium through `playwright-core`. If Chromium isn't at `/opt/pw-browsers/chromium`, set `CHROMIUM_PATH=/path/to/chrome`.

## What's on the site

| Page | What it answers |
| --- | --- |
| **Home** (`/`) | *What is Roni's?* (hero) → *Why care?* (since 1989, in Roni's own words) → *What do I eat?* (numbered menu; hover swaps the photo) → the signature bagel → *Where, and is it open?* (six shops, live status, map, directions) → *How do I order?* |
| **Menu** (`/menu`) | Every item, filter by category (synced to `?category=`), search. |
| **Locations** (`/locations`, `/locations/:slug`) | Live *Open now / Closed · opens 7am* (London time), nearest shop, schematic map, hours table, directions, call, order options per shop. |
| **Catering** (`/catering`) | 48-hour lead time, platter planner (guests → platters → guide price), event planner with a calendar reminder. |
| **Cakes**, **About**, **Contact** | Verified copy only; contact is by phone per shop (no fake forms). |
| **Order** (header, everywhere) | A drawer that asks *which Roni's* first, then shows that shop's real options: Roni's online ordering, that shop's own Deliveroo listing (where one exists), its phone number, and catering. |

## Editing business details

**All facts live in [`src/data/business.ts`](src/data/business.ts)** — locations, hours, phone numbers, ordering links, menu, catering and story. Pages, the order drawer, structured data (SEO) and "Open now" badges all read from it.

- Hours use 24-hour times: `{ days: "Mon-Sun", open: "07:00", close: "20:00" }`. `close: "24:00"` means midnight.
- Leave `hours: []` if a shop's hours aren't confirmed — the site says "please call" instead of guessing.
- `deliveroo: ""` hides the delivery option for that shop.
- `approx` coordinates are only for the schematic map, never for navigation.

[`VERIFICATION.md`](VERIFICATION.md) lists where each fact came from and what still needs confirming.

## Images

There are no Roni's photographs in this repo yet. Every food image is a **digital illustration rendered from 3D models made for this project**, labelled "Illustration" on the page. All images are listed in [`src/data/photos.ts`](src/data/photos.ts) — replacing one with a real photo is a file swap. See [`ASSETS.md`](ASSETS.md).

## Design

Paper, deep black and one accent — the blue of Roni's awning. Instrument Serif for headlines, Instrument Sans for everything else. Motion is restrained and always optional. See [`DESIGN.md`](DESIGN.md) for the system, the motion rules, and which ThreeUI ideas were used (and which weren't).

## Deploying

It's a static single-page app.

- **Vercel:** import the repo; `vercel.json` handles routes.
- **Netlify:** build `npm run build`, publish `dist` (`public/_redirects` handles routes).
- Set **`VITE_SITE_URL`** (e.g. `https://www.ronisonline.co.uk`) at build time so social previews and canonical URLs are absolute.
- Structured data (schema.org `Bakery`) for every shop is written into the static HTML at build time.

## Project layout

```
src/data/business.ts        ← every business fact (edit here)
src/data/photos.ts          ← every food image: file, alt text, crop, "illustration" flag
src/pages/                  ← Home, Menu, Locations, LocationDetail, Catering, Cakes, About, Contact
src/components/home/        ← the home page sections (Hero, Heritage, MenuIndex, Signature, ShopsIndex, HungryCta)
src/components/             ← Header, Footer, OrderDialog, Photo, ShopMap, planners…
src/styles/                 ← base (tokens, type, buttons, motion), layout, home, pages
src/three/                  ← 3D food models and the offline photo studio (dev only, not shipped)
scripts/render-assets.mjs   ← renders the food illustrations to public/photos/*.webp
tests/e2e.mjs               ← end-to-end checks
```

## Credits

Fonts: Instrument Serif and Instrument Sans (SIL Open Font Licence), self-hosted via Fontsource. Motion: GSAP. All food illustrations are original renders made for this project with three.js (MIT).
