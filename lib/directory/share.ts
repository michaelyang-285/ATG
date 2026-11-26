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
const compact = (s?: string | null) => (s || "").replace(/\s+/g, " ").trim();

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

const sentences = new Intl.Segmenter("en", {granularity: "sentence"});

function listingCopy(b: Business, card: DirectoryCard, place: string) {
  const title = !b.category || card.name.toLowerCase().includes(card.label.toLowerCase())
    ? `${card.name} ${place}` : `${card.name} | ${card.label} ${place}`;
  const intro = `Find ${card.name} ${place}.`;
  const details = Array.from(new Set([...(b.services || []), ...(b.categories || [])]))
    .map(s => compact(s)).filter(s => s && s !== b.category && s !== card.label).slice(0, 3);
  const localDetail = b.address ? `The listed address is ${compact(b.address)}.` : "";
  const serviceDetail = details.length ? `Listed specialties include ${details.join(", ")}.` : "";
  const lines = Array.from(sentences.segment(compact(b.summary)), part => part.segment.trim())
    .filter(s => s.length >= 12 && s.length <= 160 && !/^(?:call|text|tel)\b/i.test(s));
  const first = lines[0] || "";
  const second = lines[1] || "";
  const excerpt = first && second && (first + " " + second).length <= 160 ? first + " " + second : first;
  // With just one useful sentence, give social the original wording and search the listing context.
  const singleDetail = first && !second && !serviceDetail && !localDetail;
  const description = singleDetail && (intro + " " + first).length <= 165
    ? intro + " " + first : excerpt || [intro, serviceDetail || localDetail].filter(Boolean).join(" ");
  const ogTitle = `${card.name} | ${card.location}`;
  const ogDescription = [second, serviceDetail, localDetail, first].find(s => s && s !== description)
    || first || `Find ${card.name} in the All Things Gwinnett business directory.`;
  return {seoTitle: title, seoDescription: description, ogTitle, ogDescription};
}

export function directoryPreview(b: Business) {
  const entry = readHighlight(b);
  const card = directoryCard(b);
  const copy = entry?.seoTitle && entry.seoDescription && entry.ogTitle && entry.ogDescription
    ? entry : {...listingCopy(b, card, locationFor(b).phrase), ...entry};
  return {card, seoTitle: copy.seoTitle, seoDescription: copy.seoDescription,
    ogTitle: copy.ogTitle, ogDescription: copy.ogDescription};
}

export function directoryMetadata(b: Business): Metadata {
  const {card, seoTitle: title, seoDescription: description, ogTitle, ogDescription} = directoryPreview(b);
  const path = "/directory/" + encodeURIComponent(b.slug);
  const production = "https://allthingsgwinnett.com";
  const origin = process.env.VERCEL_ENV === "preview" && process.env.VERCEL_URL
    ? "https://" + process.env.VERCEL_URL : production;
  const key = createHash("sha256").update("snes-directory-v1:" + JSON.stringify(card)).digest("hex").slice(0, 16);
  const image = {url: origin + path + "/share-image?v=" + key, width: 1200, height: 630, type: "image/png",
    alt: `${card.name}, ${card.location}. ${card.label} in SNES-style pixel art. All Things Gwinnett.`};
  return {title: {absolute: title}, description, alternates: {canonical: production + path},
    openGraph: {type: "website", siteName: "All Things Gwinnett", locale: "en_US",
      url: origin + path, title: ogTitle, description: ogDescription, images: [image]},
    twitter: {card: "summary_large_image", title: ogTitle, description: ogDescription, images: [image]}};
}
