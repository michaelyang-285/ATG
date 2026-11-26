import {createHash} from "node:crypto";
import type {Metadata} from "next";
import type {Business} from "@/lib/publication";
import {categoryStyle} from "./share-categories";
import highlights from "./share-highlights.json";

type Highlight = {
  primary: string; evidence?: string; style: string; line: string; shortName?: string; showStreet?: boolean;
  seoTitle?: string; seoDescription?: string; ogTitle?: string; ogDescription?: string;
};
const curated: Record<string,Highlight> = highlights;
const compact = (s: string = "") => s.replace(/\s+/g, " ").trim();

function locationFor(b: Business) {
  const addressCity = b.address?.match(/,\s*([^,]+),\s*(?:GA|Georgia)\b(?:\s+\d{5}(?:-\d{4})?)?\s*$/i)?.[1].trim();
  if (addressCity) return {label: addressCity + ", GA", phrase: "in " + addressCity};
  const areas = (b.neighborhood || "").split(",").map(s => s.trim()).filter(Boolean);
  if (!areas.length) return {label: "Gwinnett County", phrase: "in Gwinnett County"};
  if (areas.length > 2 || areas.some(a => /^(?:all of )?gwinnett(?: county)?$/i.test(a))) {
    return {label: "Serving Gwinnett County", phrase: "serving Gwinnett County"};
  }
  const area = areas.join(" & ");
  return {label: "Serving " + area, phrase: "serving " + area};
}

function legacyFoodStyle(b: Business) {
  if (b.category?.toLowerCase() !== "food") return;
  if (/\bbakery\b/i.test(b.name)) return "Bakers";
  if (/supermarket|farmers.? market|grocery/i.test(b.name)) return "Grocery market";
  const style = b.name.match(/\b(diner|steakhouse|bistro|buffet|tavern)\b/i)?.[1];
  return style?.toLowerCase().replace(/^./, c => c.toUpperCase());
}

function readHighlight(b: Business) {
  const entry = Object.prototype.hasOwnProperty.call(curated, b.slug) ? curated[b.slug] : undefined;
  if (entry?.primary !== b.category) return;
  if (entry?.evidence && !b.summary?.toLowerCase().includes(entry.evidence.toLowerCase())) return;
  return entry;
}

export function directoryCard(b: Business) {
  const entry = readHighlight(b);
  const style = categoryStyle(b.category, entry?.style || legacyFoodStyle(b));
  const location = locationFor(b);
  const street = compact(b.address?.split(",")[0]);
  const secondary = Array.from(new Set([...(b.categories || []), ...(b.services || [])]))
    .filter(tag => tag && tag !== b.category && tag !== style.label).slice(0, 2).join(" · ");
  let detail = entry?.line || street || secondary;
  if (entry?.showStreet && street) detail = street + " · " + entry.line;
  return {name: compact(entry?.shortName || b.name), ...style, location: location.label, detail: compact(detail)};
}

export type DirectoryCard = ReturnType<typeof directoryCard>;

function searchSummary(b: Business, fallback: string) {
  const summary = compact(b.summary);
  if (!summary) return fallback;
  if (summary.length <= 165) return summary;
  const sentence = summary.match(/^.{12,165}?[.!?](?=\s|$)/)?.[0];
  return sentence || fallback;
}

export function directoryMetadata(b: Business): Metadata {
  const entry = readHighlight(b);
  const card = directoryCard(b);
  const location = locationFor(b);
  const path = "/directory/" + encodeURIComponent(b.slug);
  const production = "https://allthingsgwinnett.com";
  const origin = process.env.VERCEL_ENV === "preview" && process.env.VERCEL_URL
    ? "https://" + process.env.VERCEL_URL : production;
  const key = createHash("sha256").update("snes-directory-v1:" + JSON.stringify(card)).digest("hex").slice(0, 16);
  const image = {url: origin + path + "/share-image?v=" + key, width: 1200, height: 630, type: "image/png",
    alt: `${card.name}, ${card.location}. ${card.label} in SNES-style pixel art. All Things Gwinnett.`};
  const categoryInName = b.name.toLowerCase().includes(card.label.toLowerCase());
  const title = entry?.seoTitle || (categoryInName ? b.name : b.name + " | " + card.label) + " " + location.phrase;
  const short = card.detail ? `${card.name} ${location.phrase}. ${card.detail}.`
    : `Find ${card.name} ${location.phrase} in the All Things Gwinnett directory.`;
  const description = entry?.seoDescription || searchSummary(b, short);
  const ogTitle = entry?.ogTitle || card.name + " " + location.phrase;
  const ogDescription = entry?.ogDescription || searchSummary(b, short);
  return {title: {absolute: title}, description, alternates: {canonical: production + path},
    openGraph: {type: "website", siteName: "All Things Gwinnett", locale: "en_US",
      url: origin + path, title: ogTitle, description: ogDescription, images: [image]},
    twitter: {card: "summary_large_image", title: ogTitle, description: ogDescription, images: [image]}};
}
