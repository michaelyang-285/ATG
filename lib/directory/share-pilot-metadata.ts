import type {Metadata} from "next";
import examples from "./share-pilot.json";

export const pilotEnabled = process.env.VERCEL_ENV === "preview" || process.env.NODE_ENV === "development";
export const pilotCard = (slug: string) => `/directory-share-cards/${encodeURIComponent(slug)}.jpg`;

export function pilotMetadata(slug: string): Metadata | undefined {
  if (!pilotEnabled) return;
  const entry = examples.find(example => example.slug === slug);
  if (!entry) return;

  const previewOrigin = process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000";
  const path = `/directory/${encodeURIComponent(slug)}`;
  const image = {
    url: new URL(pilotCard(slug), previewOrigin).href,
    width: 1200, height: 630, type: "image/jpeg",
    alt: `${entry.name}, ${entry.specialty}, ${entry.location}. All Things Gwinnett directory.`,
  };
  return {
    title: {absolute: entry.seoTitle}, description: entry.seoDescription,
    robots: {index: false, follow: false},
    alternates: {canonical: `https://allthingsgwinnett.com${path}`},
    openGraph: {
      type: "website", siteName: "All Things Gwinnett", locale: "en_US",
      url: new URL(path, previewOrigin).href, title: entry.ogTitle, description: entry.ogDescription, images: [image],
    },
    twitter: {card: "summary_large_image", title: entry.ogTitle, description: entry.ogDescription, images: [image]},
  };
}
