import type { MetadataRoute } from "next";
import { getPublication, storyHref } from "@/lib/publication";
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const { stories, businesses } = await getPublication();
  return [
    ...[
      "",
      "/food-drink",
      "/things-to-do",
      "/local-life",
      "/guides",
      "/events",
      "/directory",
      "/about",
    ].map((p) => ({ url: "https://allthingsgwinnett.com" + p })),
    ...stories.map((s) => ({
      url: "https://allthingsgwinnett.com" + storyHref(s),
      lastModified: s.publishedAt,
    })),
    ...businesses.map((b) => ({
      url:
        "https://allthingsgwinnett.com/directory/" + encodeURIComponent(b.slug),
    })),
  ];
}
