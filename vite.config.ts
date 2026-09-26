import { defineConfig, loadEnv, type Plugin } from "vite";
import react from "@vitejs/plugin-react";
import { brand, locations } from "./src/data/business";

/**
 * Puts local-business structured data (schema.org Bakery for each shop) and social
 * tags into the static HTML, so search engines see them without running JavaScript.
 * Set VITE_SITE_URL (e.g. https://www.ronisonline.co.uk) when deploying.
 */
function seoPlugin(siteUrl: string): Plugin {
  const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const expand = (spec: string) => {
    const idx = (d: string) => days.findIndex((x) => x.toLowerCase().startsWith(d.trim().toLowerCase().slice(0, 3)));
    return spec.split(",").flatMap((part) => {
      const [a, b] = part.split(/\s*[-–]\s*/).map(idx);
      if (b === undefined || b < 0) return [days[a]];
      const out: string[] = [];
      for (let d = a; ; d = (d + 1) % 7) {
        out.push(days[d]);
        if (d === b) break;
      }
      return out;
    });
  };
  const graph = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        name: brand.legalName,
        alternateName: "Roni's Bagel Bakery",
        url: siteUrl || brand.url,
        foundingDate: String(brand.founded),
        founder: { "@type": "Person", name: brand.founder },
        sameAs: [brand.instagram, brand.facebook],
      },
      ...locations.map((l) => ({
        "@type": "Bakery",
        name: `Roni's ${l.name}`,
        telephone: `+44 ${l.phone.replace(/^0/, "")}`,
        address: {
          "@type": "PostalAddress",
          streetAddress: l.street,
          addressLocality: l.locality,
          ...(l.postcode ? { postalCode: l.postcode } : {}),
          addressCountry: "GB",
        },
        ...(l.hours.length
          ? {
              openingHoursSpecification: l.hours.map((h) => ({
                "@type": "OpeningHoursSpecification",
                dayOfWeek: expand(h.days),
                opens: h.open,
                closes: h.close === "24:00" ? "23:59" : h.close,
              })),
            }
          : {}),
        ...(siteUrl ? { url: `${siteUrl}/locations/${l.slug}` } : {}),
      })),
    ],
  };
  const abs = (p: string) => (siteUrl ? `${siteUrl}${p}` : p);
  return {
    name: "ronis-seo",
    transformIndexHtml(html) {
      const tags = [
        `<meta property="og:site_name" content="Roni's Bagel Bakery" />`,
        `<meta property="og:type" content="website" />`,
        `<meta property="og:title" content="Roni's Bagel Bakery — Fresh bagels in North London since 1989" />`,
        `<meta property="og:description" content="Bagels and Jewish baked goods since 1989. Six North London bakeries, online ordering, platters and cakes." />`,
        `<meta property="og:image" content="${abs("/og.jpg")}" />`,
        `<meta property="og:image:width" content="1200" />`,
        `<meta property="og:image:height" content="630" />`,
        `<meta name="twitter:card" content="summary_large_image" />`,
        ...(siteUrl ? [`<link rel="canonical" href="${siteUrl}/" />`] : []),
        `<script type="application/ld+json">${JSON.stringify(graph)}</script>`,
      ];
      return html.replace("</head>", `    ${tags.join("\n    ")}\n  </head>`);
    },
  };
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "VITE_");
  const siteUrl = (env.VITE_SITE_URL ?? "").replace(/\/$/, "");
  return { plugins: [react(), seoPlugin(siteUrl)] };
});
