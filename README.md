# Roni's Bagel Bakery — Website

A one-page website for Roni's Bagel Bakery with a printed-paper, North London deli feel — and a few things that make it feel alive:

- **A pile of bagels you can play with.** They tumble into the top of the page; visitors can grab and throw them (or tap them on a phone). Every bagel is drawn slightly differently, like the real thing.
- **A live strip** at the top that changes with the time in London ("Lunchtime — the hot salt beef is calling", and on Fridays: "don't forget your challah").
- **Live "Open now / Closed" status** on every shop, worked out from the opening hours.
- Hand-drawn underlines and notes, a menu board, and a till-receipt for cakes & platters.

Built with [React](https://react.dev) + [Vite](https://vite.dev). No heavy libraries; fonts are bundled with the site (no Google Fonts tracking).

---

## ✏️ Changing the text, menu, stores or hours

**Everything you'd normally want to change is in one file: [`src/content.js`](src/content.js).**

You can edit it directly on GitHub (open the file → pencil icon → edit → "Commit changes"). If the site is connected to Netlify or Vercel (see below), it updates by itself a minute later.

| To change…                    | Edit this in `src/content.js` |
| ----------------------------- | ----------------------------- |
| Intro text, social links, email | `business`                  |
| The red live strip messages     | `liveMessages`, `fridayMessage` |
| Menu items, prices, stickers, handwritten notes | `menu`      |
| Cakes / platters receipt        | `occasions`                 |
| Shop addresses, phones, **opening hours** | `stores`          |
| "Our story" text                | `story`                     |

Tips:

- Keep the `"quotes"` and the commas at the end of lines.
- Leave something as `""` to hide it (e.g. `price: ""` shows no price).
- Opening hours use 24-hour times, e.g. `{ days: "Mon-Fri", open: "07:00", close: "18:00" }`. Add one line per set of days. These drive the "Open now" badges, so keep them accurate.
- Lines marked `// TODO` still need checking — some addresses, phone numbers and opening hours were not publicly available.

### Changing colours

The brand colours are at the top of [`src/styles.css`](src/styles.css) (`--paper`, `--ink`, `--red`, `--mustard`). Change them there and the whole site follows.

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
src/components/BagelPit.jsx ← the bagels you can throw (physics)
src/lib/bagel.js            ← how each bagel is drawn
src/lib/time.js             ← London time, "Open now" logic
public/                     ← favicon
```

## Credits & licences

- Fonts: Fraunces, DM Mono and Caveat, bundled via Fontsource — SIL Open Font Licence.
