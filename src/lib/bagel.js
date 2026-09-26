// Draws illustrated bagels (top view) onto canvases. Each one is a little
// lopsided and uniquely seeded, like the real thing.

export const VARIANTS = ["plain", "sesame", "poppy"];

export function rng(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const INK = "#2a1a12";

function wobblyPath(ctx, cx, cy, radius, wobble) {
  const n = wobble.length;
  const pt = (i) => {
    const a = (i / n) * Math.PI * 2;
    const r = radius * (1 + wobble[i % n]);
    return [cx + Math.cos(a) * r, cy + Math.sin(a) * r];
  };
  ctx.beginPath();
  const [sx, sy] = pt(0), [nx, ny] = pt(1);
  ctx.moveTo((sx + nx) / 2, (sy + ny) / 2);
  for (let i = 1; i <= n; i += 1) {
    const [x, y] = pt(i), [x2, y2] = pt(i + 1);
    ctx.quadraticCurveTo(x, y, (x + x2) / 2, (y + y2) / 2);
  }
  ctx.closePath();
}

/**
 * Renders one bagel into a new canvas.
 * @param {number} radius  outer radius in CSS pixels
 * @param {string} variant "plain" | "sesame" | "poppy"
 * @param {number} seed    any integer — same seed, same bagel
 * @param {number} scale   device pixel ratio
 */
export function renderBagel(radius, variant, seed, scale = 2) {
  const rand = rng(seed * 9973 + 17);
  const pad = Math.max(2, radius * 0.08);
  const size = Math.ceil((radius + pad) * 2 * scale);
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = size;
  const ctx = canvas.getContext("2d");
  ctx.scale(scale, scale);
  const c = radius + pad;
  const R = radius * 0.94;
  const holeR = R * (0.26 + rand() * 0.06);
  const outer = Array.from({ length: 14 }, () => (rand() - 0.5) * 0.07);
  const inner = Array.from({ length: 9 }, () => (rand() - 0.5) * 0.12);
  const hx = c + (rand() - 0.5) * R * 0.08, hy = c + (rand() - 0.5) * R * 0.08;
  const toast = rand() * 0.25; // some are a bit darker than others

  // body
  wobblyPath(ctx, c, c, R, outer);
  const body = ctx.createRadialGradient(hx, hy, holeR * 0.8, c, c, R * 1.02);
  body.addColorStop(0, "#f1cf95");
  body.addColorStop(0.28, mix("#e0a453", "#b8702a", toast));
  body.addColorStop(0.62, mix("#c9853a", "#9c5720", toast));
  body.addColorStop(1, mix("#8f4f1d", "#6e3812", toast));
  ctx.fillStyle = body;
  ctx.fill();

  // soft highlight — the shine of the boiled crust
  ctx.save();
  ctx.clip();
  const shine = ctx.createRadialGradient(c - R * 0.35, c - R * 0.4, 0, c - R * 0.35, c - R * 0.4, R * 0.75);
  shine.addColorStop(0, "rgba(255,236,200,0.55)");
  shine.addColorStop(1, "rgba(255,236,200,0)");
  ctx.fillStyle = shine;
  ctx.fillRect(0, 0, c * 2, c * 2);
  // little blisters
  for (let i = 0; i < 14; i += 1) {
    const a = rand() * Math.PI * 2, d = holeR + (R - holeR) * (0.2 + rand() * 0.7);
    ctx.fillStyle = `rgba(${rand() > 0.5 ? "255,225,170" : "110,55,20"},${0.12 + rand() * 0.15})`;
    ctx.beginPath();
    ctx.arc(c + Math.cos(a) * d, c + Math.sin(a) * d, R * (0.02 + rand() * 0.04), 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();

  // toppings
  const seedCount = variant === "plain" ? 0 : Math.round(R * (variant === "poppy" ? 5 : 1.6));
  for (let i = 0; i < seedCount; i += 1) {
    const a = rand() * Math.PI * 2;
    const d = holeR * 1.25 + (R * 0.9 - holeR * 1.25) * Math.sqrt(rand());
    const x = c + Math.cos(a) * d, y = c + Math.sin(a) * d;
    if (variant === "sesame") {
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(rand() * Math.PI);
      ctx.beginPath();
      ctx.ellipse(0, 0, Math.max(1.6, R * 0.055), Math.max(0.9, R * 0.028), 0, 0, Math.PI * 2);
      ctx.fillStyle = rand() > 0.3 ? "#fbefd2" : "#f0d9a6";
      ctx.fill();
      ctx.lineWidth = 0.6;
      ctx.strokeStyle = "rgba(90,50,20,0.45)";
      ctx.stroke();
      ctx.restore();
    } else {
      ctx.beginPath();
      ctx.arc(x, y, Math.max(0.8, R * (0.012 + rand() * 0.012)), 0, Math.PI * 2);
      ctx.fillStyle = rand() > 0.15 ? "#23222c" : "#4a4658";
      ctx.fill();
    }
  }

  // hole (punched out) + inner shadow
  ctx.save();
  wobblyPath(ctx, hx, hy, holeR, inner);
  ctx.globalCompositeOperation = "destination-out";
  ctx.fill();
  ctx.restore();
  wobblyPath(ctx, hx, hy, holeR, inner);
  ctx.lineWidth = Math.max(2, R * 0.07);
  ctx.strokeStyle = "rgba(90,45,15,0.35)";
  ctx.stroke();

  // ink outline — gives the illustrated, printed look
  const line = Math.max(1.4, R * 0.035);
  ctx.lineWidth = line;
  ctx.strokeStyle = INK;
  wobblyPath(ctx, c, c, R, outer);
  ctx.stroke();
  wobblyPath(ctx, hx, hy, holeR, inner);
  ctx.stroke();

  return canvas;
}

function mix(a, b, t) {
  const pa = parseInt(a.slice(1), 16), pb = parseInt(b.slice(1), 16);
  const ch = (p, s) => (p >> s) & 255;
  const out = [16, 8, 0].map((s) => Math.round(ch(pa, s) + (ch(pb, s) - ch(pa, s)) * t));
  return `rgb(${out.join(",")})`;
}
