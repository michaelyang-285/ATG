import {calendar,occurrencePath} from "@/lib/events";
import {localClock,shift} from "@/lib/event-time";
import {publication} from "@/lib/publication";
import {directoryPublic} from "@/lib/directory/public";
import type { MetadataRoute } from "next";
import { getPublication, storyHref } from "@/lib/publication";
export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const { stories, businesses } = await getPublication();
  const today=localClock(Date.now()).slice(0,10);
  const [events,authors]=await Promise.all([calendar(today,shift(today,365)),publication.fetch<string[]>(' *[_type=="author" && defined(slug.current)].slug.current')]);
  return [
    ...events.map(e=>({url:"https://allthingsgwinnett.com"+occurrencePath(e)})),
    ...authors.map(s=>({url:"https://allthingsgwinnett.com/authors/"+encodeURIComponent(s)})),
    ...[
      "",
      "/food-drink",
      "/things-to-do",
      "/local-life",
      "/guides",
      "/events",
      "/events/pokemon",
      "/directory",
      "/about","/advertise","/contact","/contribute",
    ].map((p) => ({ url: "https://allthingsgwinnett.com" + p })),
    ...stories.map((s) => ({
      url: "https://allthingsgwinnett.com" + storyHref(s),
      lastModified: s.publishedAt,
    })),
    ...[...businesses,...await directoryPublic()].map((b) => ({
      url:
        "https://allthingsgwinnett.com/directory/" + encodeURIComponent(b.slug),
    })),
  ];
}
