/**
 * Renders the 3D food models (src/three/photo.ts) to optimised "photographs" in public/photos.
 *   npm run render:assets                  -> all shots
 *   npm run render:assets -- photo-hero    -> just one
 *   PREVIEW=1 ... -> also writes PNG previews to scripts/.preview (not committed)
 * Needs Chromium (set CHROMIUM_PATH if it isn't at /opt/pw-browsers/chromium).
 */
import { spawn } from "node:child_process";
import { mkdir, writeFile } from "node:fs/promises";
import { chromium } from "playwright-core";
import sharp from "sharp";

// Each shot is rendered by src/three/photo.ts and saved at several widths for srcset.
// Replace any of them with a real photo of the same name (see ASSETS.md and src/data/photos.ts).
const PHOTO_WIDTHS = [640, 1200, 2000];
const SHOTS = {
  "photo-hero": { w: 2400, h: 1440, file: "hero" },
  "photo-hero-tall": { w: 1080, h: 1920, file: "hero-tall" },
  "photo-signature": { w: 2400, h: 1440, file: "signature" },
  "photo-salmon": { w: 1440, h: 1800, file: "bagel-salmon" },
  "photo-saltbeef": { w: 1440, h: 1800, file: "bagel-saltbeef" },
  "photo-cheddar": { w: 1440, h: 1800, file: "bagel-cheddar" },
  "photo-tuna": { w: 1440, h: 1800, file: "bagel-tuna" },
  "photo-bagels": { w: 2400, h: 1440, file: "bagels" },
  "photo-crust": { w: 1440, h: 1800, file: "crust" },
  "photo-challah": { w: 1440, h: 1800, file: "challah" },
  "photo-cake": { w: 1440, h: 1800, file: "carrot-cake" },
  "photo-platter": { w: 1440, h: 1800, file: "platter" },
};

const only = process.argv.slice(2);
const port = 5198;
const server = spawn("npx", ["vite", "--port", String(port), "--strictPort"], { stdio: "ignore", detached: true });
// wait until the dev server answers
for (let i = 0; i < 150; i += 1) {
  try {
    if ((await fetch(`http://localhost:${port}/`)).ok) break;
  } catch {}
  await new Promise((r) => setTimeout(r, 200));
}

const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH || "/opt/pw-browsers/chromium", args: ["--use-angle=swiftshader", "--enable-unsafe-swiftshader", "--ignore-gpu-blocklist"] });
await mkdir("public/photos", { recursive: true });
if (process.env.PREVIEW) await mkdir("scripts/.preview", { recursive: true });
try {
  for (const [name, s] of Object.entries(SHOTS)) {
    if (only.length && !only.includes(name)) continue;
    const page = await browser.newPage({ viewport: { width: s.w, height: s.h } });
    page.on("console", (m) => console.log(`  [${name}]`, m.text()));
    page.on("pageerror", (e) => console.error(`  [${name}] ERROR`, e.message));
    await page.goto(`http://localhost:${port}/studio?shot=${name}&w=${s.w}&h=${s.h}`);
    await page.waitForSelector("#studio[data-done=true]", { timeout: 180000 });
    const png = await page.locator("#studio").screenshot();
    if (process.env.PREVIEW) await sharp(png).toFile(`scripts/.preview/${name}.png`);
    for (const width of PHOTO_WIDTHS) {
      await sharp(png).resize({ width, withoutEnlargement: true }).webp({ quality: 80, effort: 6 }).toFile(`public/photos/${s.file}-${width}.webp`);
    }
    console.log(`✓ public/photos/${s.file}-{${PHOTO_WIDTHS}}.webp`);
    await page.close();
  }
  // social share image (JPEG: the most widely supported preview format)
  if (!only.length || only.includes("photo-hero")) {
    await sharp("public/photos/hero-2000.webp").resize({ width: 1200, height: 630, fit: "cover" }).jpeg({ quality: 84, mozjpeg: true }).toFile("public/og.jpg");
    console.log("✓ public/og.jpg");
  }

  // manifest of every file and its size, for srcset and width/height (no layout shift)
  const photos = {};
  for (const p of Object.values(SHOTS)) {
    const sizes = [];
    for (const w of PHOTO_WIDTHS) {
      const m = await sharp(`public/photos/${p.file}-${w}.webp`).metadata().catch(() => null);
      if (m && !sizes.some((x) => x.w === m.width)) sizes.push({ src: `/photos/${p.file}-${w}.webp`, w: m.width, h: m.height });
    }
    if (sizes.length) photos[p.file] = sizes;
  }
  await writeFile("src/data/photos.json", JSON.stringify(photos, null, 2) + "\n");
  console.log("✓ src/data/photos.json");
} finally {
  await browser.close();
  process.kill(-server.pid); // stop the dev server and its children
}
