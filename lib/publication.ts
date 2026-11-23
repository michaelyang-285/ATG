import { createClient } from "next-sanity";
import imageUrlBuilder from "@sanity/image-url";
import { cache } from "react";

export const publication = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || "xnm5c645",
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || "production",
  apiVersion: "2026-02-01",
  useCdn: true,
  perspective: "published",
});
export type Story = {
  _id: string;
  title: string;
  slug: string;
  excerpt?: string;
  seo?: {
    title?: string;
    description?: string;
    ogTitle?: string;
    ogDescription?: string;
    ogImage?: Story["image"];
  };
  section?: string;
  format?: string;
  topic?: string;
  gameTopics?: string[];
  location?: string;
  publishedAt?: string;
  image?: any;
  categories?: { title: string; slug: string }[];
  author?: { name: string; slug?: string };
  body?: any[];
};
export type Business = {
  premium?:boolean;
  deal?:import("./directory/deal").DirectoryDeal;
  providerType?: "independent" | "organization";
  _id: string;
  name: string;
  slug: string;
  category?: string;
  categories?: string[];
  services?: string[];
  logo?: string;
  neighborhood?: string;
  summary?: string;
  address?: string;
  url?: string;
  image?: any;
};
export type LocalEvent = {
  _id: string;
  title: string;
  slug: string;
  startsAt: string;
  endsAt?: string;
  venue?: string;
  neighborhood?: string;
  summary?: string;
  priceLabel?: string;
  url?: string;
};
export type Settings = {
  featuredPost?: Story;
  sidebarPosts?: Story[];
  featuredGuides?: Story[];
  newsletterUrl?: string;
};
export const STORY_FIELDS = `_id,title,"slug":slug.current,excerpt,section,format,topic,gameTopics,location,publishedAt,"image":mainImage,"categories":categories[]->{title,"slug":slug.current},"author":author->{name,"slug":slug.current}`;
export const PUBLISHED = `_type == "post" && defined(slug.current) && !(_id in path("drafts.**")) && hideFromSearch != true && defined(publishedAt) && publishedAt <= now()`;
export const getPublication = cache(async () => {
  const result = await publication.fetch<{
    stories: Story[];
    settings: Settings | null;
    businesses: Business[];
    events: LocalEvent[];
  }>(
    `{
    "stories": *[${PUBLISHED}] | order(publishedAt desc)[0...100]{${STORY_FIELDS}},
    "settings": *[_type == "siteSettings"][0]{newsletterUrl,featuredPost->{${STORY_FIELDS},hideFromSearch},sidebarPosts[]->{${STORY_FIELDS},hideFromSearch},featuredGuides[]->{${STORY_FIELDS},hideFromSearch}},
    "businesses": *[_type == "business" && defined(slug.current)] | order(name asc)[0...100]{_id,name,"slug":slug.current,category,neighborhood,summary,address,url,image},
    "events": *[_type == "event" && defined(slug.current) && coalesce(endsAt,startsAt) >= now()] | order(startsAt asc)[0...50]{_id,title,"slug":slug.current,startsAt,endsAt,venue,neighborhood,summary,priceLabel,url}
  }`,
    {},
    { next: { revalidate: 60 } },
  );
  const ids = new Set(result.stories.map((s) => s._id));
  const settings = result.settings || {};
  if (settings.featuredPost && !ids.has(settings.featuredPost._id))
    settings.featuredPost = undefined;
  settings.sidebarPosts = settings.sidebarPosts?.filter((s) => ids.has(s._id));
  settings.featuredGuides = settings.featuredGuides?.filter((s) =>
    ids.has(s._id),
  );
  return { ...result, settings };
});
export function sectionOf(story: Story) {
  if (story.section) return story.section;
  const cats = (story.categories || [])
    .map((c) => `${c.slug} ${c.title}`)
    .join(" ")
    .toLowerCase();
  return /food|eat|restaurant|drink/.test(cats)
    ? "food-drink"
    : /event|art|culture|thing/.test(cats)
      ? "things-to-do"
      : "local-life";
}
export function isGuide(s: Story) {
  return (
    s.format === "guide" || s.categories?.some((c) => /guide/i.test(c.title))
  );
}
export const sections = [
  { slug: "food-drink", label: "Food & drink" },
  { slug: "things-to-do", label: "Things to do" },
  { slug: "local-life", label: "Local life" },
];
export function storyLabel(s: Story) {
  return sections.find((x) => x.slug === sectionOf(s))?.label || "Local life";
}
export function storyHref(s: Story) {
  return `/stories/${encodeURIComponent(s.slug)}`;
}
export function imageUrl(image: any, width = 1200, height = 675, format?: "jpg") {
  if (!image?.asset) return null;
  const builder = imageUrlBuilder(publication).image(image).width(width).height(height).fit("crop");
  return (format ? builder.format(format) : builder.auto("format")).url();
}
export function safeUrl(value?: string) {
  if (!value) return null;
  try {
    const u = new URL(value);
    return ["http:", "https:"].includes(u.protocol) ? u.toString() : null;
  } catch {
    return null;
  }
}
export function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "America/New_York",
  }).format(new Date(value));
}
