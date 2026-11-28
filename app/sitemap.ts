import {calendar,occurrencePath} from "@/lib/events";
import {localClock,shift} from "@/lib/event-time";
import {publication, PUBLISHED} from "@/lib/publication";
import {categoryInventory} from "@/lib/directory/category-inventory";
import type { MetadataRoute } from "next";
export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const {stories} = await publication.fetch<{
    stories: {slug: string; publishedAt: string}[];
  }>(`{
    "stories": *[${PUBLISHED}]{"slug":slug.current,publishedAt}
  }`, {}, {next: {revalidate: 60}});
  const {listings,slugs} = await categoryInventory();
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
      "/this-weekend",
      "/events/pokemon",
      "/events/gwinnett-libraries",
      "/directory",
      ...slugs.map(slug=>"/directory/category/"+slug),
      "/about","/advertise","/contact","/contribute",
    ].map((p) => ({ url: "https://allthingsgwinnett.com" + p })),
    ...stories.map((s) => ({
      url: "https://allthingsgwinnett.com/stories/" + encodeURIComponent(s.slug),
      lastModified: s.publishedAt,
    })),
    ...listings.map((b) => ({
      url:
        "https://allthingsgwinnett.com/directory/" + encodeURIComponent(b.slug),
    })),
  ];
}
