import { useEffect } from "react";
import { brand, type Location } from "../data/business";
import { fullAddress, openingHoursSpec } from "./hours";

const SITE = "Roni's Bagel Bakery";

function setMeta(selector: string, attr: "name" | "property", key: string, content: string) {
  let el = document.head.querySelector<HTMLMetaElement>(selector);
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.content = content;
}

/** Sets the page title, description, social tags and optional JSON-LD for the current route. */
export function useSeo(title: string, description: string, jsonLd?: object | object[]) {
  useEffect(() => {
    const full = title ? `${title} — ${SITE}` : `${SITE} — Fresh bagels in North London since 1989`;
    document.title = full;
    setMeta('meta[name="description"]', "name", "description", description);
    setMeta('meta[property="og:title"]', "property", "og:title", full);
    setMeta('meta[property="og:description"]', "property", "og:description", description);
    let script = document.getElementById("route-jsonld");
    if (jsonLd) {
      if (!script) {
        script = document.createElement("script");
        script.id = "route-jsonld";
        script.setAttribute("type", "application/ld+json");
        document.head.appendChild(script);
      }
      script.textContent = JSON.stringify(jsonLd);
    } else script?.remove();
  }, [title, description, jsonLd]);
}

export function bakeryJsonLd(l: Location) {
  return {
    "@context": "https://schema.org",
    "@type": "Bakery",
    name: `Roni's ${l.name}`,
    parentOrganization: { "@type": "Organization", name: brand.legalName, url: brand.url },
    telephone: `+44 ${l.phone.replace(/^0/, "")}`,
    address: {
      "@type": "PostalAddress",
      streetAddress: l.street,
      addressLocality: l.locality,
      ...(l.postcode ? { postalCode: l.postcode } : {}),
      addressCountry: "GB",
    },
    ...(l.hours.length ? { openingHoursSpecification: openingHoursSpec(l.hours) } : {}),
    servesCuisine: ["Bagels", "Jewish bakery", "Café"],
    url: `${window.location.origin}/locations/${l.slug}`,
    hasMap: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`Roni's ${fullAddress(l)}`)}`,
  };
}
