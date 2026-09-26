# Roni's Bagel Bakery — Website

A fast, modern one-page website for Roni's Bagel Bakery: an animated 3D sesame bagel, the menu, cakes & platters, all six stores with directions, and "Order online" buttons throughout.

Built with [React](https://react.dev) + [Vite](https://vite.dev), [Three.js](https://threejs.org) for the 3D bagel, and the hero background from [ThreeUI Community](https://github.com/MengTo/threeui) (MIT).

---

## ✏️ Changing the text, menu, stores or hours

**Everything you'd normally want to change is in one file: [`src/content.js`](src/content.js).**

You can edit it directly on GitHub (open the file → pencil icon → edit → "Commit changes"). If the site is connected to Netlify or Vercel (see below), it updates by itself a minute later.

| To change…                    | Edit this in `src/content.js` |
| ----------------------------- | ----------------------------- |
| Tagline, intro, social links  | `business`                    |
| Scrolling words under the hero| `marquee`                     |
| Menu items, prices, tags      | `menu`                        |
| Cakes / platters section      | `occasions`                   |
| Store addresses, phones, hours| `stores`                      |
| "Our story" text and numbers  | `story`                       |

Tips:

- Keep the `"quotes"` and the commas at the end of lines.
- Leave something as `""` to hide it (e.g. `price: ""` shows no price).
- Lines marked `// TODO` still need checking — some addresses, phone numbers and opening hours were not publicly available.

### Adding photos

1. Put the photo in the `public/images/` folder (e.g. `public/images/salt-beef.jpg`). JPG or WebP, around 1200px wide is plenty.
2. In `src/content.js`, set the menu item's `image` to `"/images/salt-beef.jpg"`.

### Changing colours

The brand colours are at the top of [`src/styles.css`](src/styles.css) (`--crust`, `--espresso`, `--cream`…). Change them there and the whole site follows.

---

## 🧑‍💻 Running it on your computer

You need [Node.js](https://nodejs.org) 20 or newer.

```bash
npm install      # once
npm run dev      # opens a live preview at http://localhost:5173
npm run build    # makes the final website in the dist/ folder
```

## 🚀 Putting it online

The site is a plain static website, so it can be hosted free on any of these:

- **Netlify** — "Add new site → Import from GitHub", pick this repo. Build command `npm run build`, publish directory `dist`.
- **Vercel** — "New Project → Import" this repo. It detects Vite automatically.
- **Anywhere else** — run `npm run build` and upload the contents of `dist/`.

Then point `ronisonline.co.uk` at it from the host's "Domains" settings.

---

## Project layout

```
src/content.js              ← all words, menu, stores (edit this!)
src/styles.css              ← colours, fonts, layout
src/App.jsx                 ← the page sections
src/components/Bagel3D.jsx  ← the spinning 3D bagel
public/                     ← images and favicon
```

## Credits & licences

- Hero background: `RibbonFieldBackground` from ThreeUI Community by Design+Code — MIT licence.
- Three.js — MIT licence.
- Fonts: Instrument Serif and Onest via Google Fonts — SIL Open Font Licence.
