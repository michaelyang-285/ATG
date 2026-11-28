import {publisher} from "./publisher";
import type { Metadata } from "next";

const site = "https://allthingsgwinnett.com";
const squareLogo = {
  url: site + "/brand/atg-avatar.png",
  width: 1024,
  height: 1024,
};

export const eventPublisher = publisher;

export const libraryShareImage = {
  url: site + "/social/gwinnett-library-events.jpg", width: 1200, height: 630,
  alt: "Gwinnett Library Events from All Things Gwinnett, illustrated in pixel art",
};

export function eventPageMetadata(title: string, description: string | undefined, path: string, image?: typeof libraryShareImage): Metadata {
  const preview = image ?? { ...squareLogo, alt: "All Things Gwinnett logo" };
  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: {
      type: "website",
      siteName: eventPublisher.name,
      title,
      description,
      url: path,
      images: [preview],
    },
    twitter: { card: image ? "summary_large_image" : "summary", title, description, images: [preview] },
  };
}

type EventPreview = {
  name: string;
  place: string;
  day: string;
  time: string;
  summary?: string;
  path: string;
  image?: string | null;
  imageAlt?: string;
  cancelled?: boolean;
};

// Shared by imported library sessions and individual calendar occurrences.
export function eventDetailMetadata(event: EventPreview): Metadata {
  const date = new Date(event.day + "T12:00:00Z").toLocaleDateString("en-US", {
    month: "short", day: "numeric", year: "numeric", timeZone: "UTC",
  });
  const name = (event.cancelled ? "Cancelled: " : "") + event.name.trim();
  const headline = event.place ? name + " at " + event.place : name;
  const title = headline + " | " + date;
  const schedule = [date, event.time].filter(Boolean).join(", ");
  const summary = event.summary?.trim().replace(/\s+/g, " ");
  const intro = headline + " (" + schedule + ").";
  const copy = [intro, summary].filter(Boolean).join(" ");
  const description = copy.length > 170 ? copy.slice(0, 169).replace(/\s+\S*$/, "").trimEnd() + "…" : copy;
  const image = {
    url: event.image || site + "/brand/og.png", width: 1200, height: 630,
    alt: event.image ? event.imageAlt || event.name : "All Things Gwinnett",
  };
  const social = { title: headline + " · " + date, description, images: [image] };
  return {
    title: { absolute: title }, description, alternates: { canonical: event.path },
    openGraph: { ...social, type: "website", siteName: eventPublisher.name, url: event.path },
    twitter: { ...social, card: "summary_large_image" },
  };
}
