/**
 * Renders the 3D food models to optimised still images in public/renders.
 *   npm run render:assets            -> all shots
 *   npm run render:assets -- hero    -> just one (writes to public/renders)
 *   PREVIEW=1 ... -> also writes PNG previews to scripts/.preview (not committed)
 * Needs Chromium (set CHROMIUM_PATH if it isn't at /opt/pw-browsers/chromium).
 */
import { spawn } from "node:child_process";
import { mkdir, readdir, writeFile } from "node:fs/promises";
import { chromium } from "playwright-core";
import sharp from "sharp";

const SHOTS = {
  hero: { w: 1400, h: 1200, out: [{ file: "bagel-hero", width: 1100 }] },
  opened: { w: 1400, h: 1200, out: [{ file: "bagel-opened", width: 1100 }] },
  trio: { w: 1600, h: 1100, out: [{ file: "bagels-trio", width: 1200 }] },
  challah: { w: 1600, h: 1000, out: [{ file: "challah", width: 1200 }] },
  cake: { w: 1500, h: 1200, out: [{ file: "carrot-cake", width: 1100 }] },
  platter: { w: 1600, h: 1200, out: [{ file: "platter", width: 1200 }] },
  "top-plain": { w: 700, h: 700, out: [{ file: "top-plain", width: 360 }] },
  "top-sesame": { w: 700, h: 700, out: [{ file: "top-sesame", width: 360 }] },
  "top-poppy": { w: 700, h: 700, out: [{ file: "top-poppy", width: 360 }] },
};
// progress frames for the reduced-motion / no-WebGL story sequence
for (const p of [0.3, 0.5, 0.7]) SHOTS[`progress-${p}`] = { w: 1400, h: 1200, p, shot: "progress", out: [{ file: `bagel-step-${Math.round(p * 100)}`, width: 900 }] };

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
await mkdir("public/renders", { recursive: true });
if (process.env.PREVIEW) await mkdir("scripts/.preview", { recursive: true });
try {
  for (const [name, s] of Object.entries(SHOTS)) {
    if (only.length && !only.includes(name)) continue;
    const page = await browser.newPage({ viewport: { width: s.w, height: s.h } });
    page.on("console", (m) => console.log(`  [${name}]`, m.text()));
    page.on("pageerror", (e) => console.error(`  [${name}] ERROR`, e.message));
    const shot = s.shot ?? name;
    await page.goto(`http://localhost:${port}/studio?shot=${shot}&w=${s.w}&h=${s.h}&p=${s.p ?? 0}`);
    await page.waitForSelector("#studio[data-done=true]", { timeout: 180000 });
    const png = await page.locator("#studio").screenshot({ omitBackground: true });
    if (process.env.PREVIEW) await sharp(png).toFile(`scripts/.preview/${name}.png`);
    for (const o of s.out) {
      const trimmed = await sharp(png)
        .trim({ threshold: 1 })
        .extend({ top: 32, bottom: 32, left: 32, right: 32, background: { r: 0, g: 0, b: 0, alpha: 0 } })
        .toBuffer();
      await sharp(trimmed).resize({ width: o.width, withoutEnlargement: true }).webp({ quality: 82, alphaQuality: 90, effort: 6 }).toFile(`public/renders/${o.file}.webp`);
      console.log(`✓ public/renders/${o.file}.webp`);
    }
    await page.close();
  }
  // size manifest used by the site for width/height attributes (no layout shift)
  const manifest = {};
  for (const f of (await readdir("public/renders")).filter((f) => f.endsWith(".webp")).sort()) {
    const m = await sharp(`public/renders/${f}`).metadata();
    manifest[f.replace(".webp", "")] = { src: `/renders/${f}`, width: m.width, height: m.height };
  }
  await writeFile("src/data/renders.json", JSON.stringify(manifest, null, 2) + "\n");
  console.log("✓ src/data/renders.json");
} finally {
  await browser.close();
  process.kill(-server.pid); // stop the dev server and its children
}
