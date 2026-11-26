import { chartFigures, StoryDataChart } from "@/components/StoryDataChart";
import { StoryFaq } from "@/components/StoryFaq";
import SchoolsFeature from "@/components/schools/SchoolsFeature";
import Link from "next/link";
import { GameEventTable } from "@/components/GameEventTable";
import { upcomingGameEvents } from "@/lib/events";
import { notFound } from "next/navigation";
import { PortableText } from "@portabletext/react";
import type { Metadata } from "next";
import {
  publication,
  PUBLISHED,
  STORY_FIELDS,
  storyLabel,
  formatDate,
  imageUrl,
  safeUrl,
  type Story,
} from "@/lib/publication";
import "@/styles/story-guide.css";
import { StoryCallout } from "@/components/StoryCallout";
import { StoryImage } from "@/components/Publication";
import { cache } from "react";
export const revalidate = 60;
const getStory = cache((slug: string) =>
  publication.fetch<Story | null>(
    `*[${PUBLISHED} && slug.current==$slug][0]{${STORY_FIELDS},seo,body[]{...,"imageUrl":asset->url,markDefs[]{...,"internalSlug":internal->slug.current}}}`,
    { slug },
    { next: { revalidate: 60 } },
  ),
);
export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const s = await getStory(params.slug);
  if (!s) return { title: "Story not found" };
  const seo = s.seo;
  const description = seo?.description || s.excerpt;
  const socialTitle = seo?.ogTitle || seo?.title || s.title;
  const socialDescription = seo?.ogDescription || description;
  const socialImage = imageUrl(seo?.ogImage, 1200, 630, "jpg");
  const image = socialImage || imageUrl(s.image);
  const images = image ? [{
    url: image,
    alt: socialImage ? seo?.ogImage?.alt : s.image?.alt,
    width: 1200,
    height: socialImage ? 630 : 675,
  }] : undefined;
  const path = `/stories/${encodeURIComponent(s.slug)}`;
  return {
    title: seo?.title ? { absolute: seo.title } : s.title,
    description,
    alternates: { canonical: path },
    openGraph: {
      type: "article",
      siteName: "All Things Gwinnett",
      title: socialTitle,
      description: socialDescription,
      url: path,
      publishedTime: s.publishedAt,
      images,
    },
    ...(seo && { twitter: { card: "summary_large_image", title: socialTitle, description: socialDescription, images } }),
  };
}
export default async function Page({ params }: { params: { slug: string } }) {
  const story = await getStory(params.slug);
  if (!story) notFound();
  if (story._id === "gcps-schools-since-2004") return <SchoolsFeature story={story} />;
  const topics = story.gameTopics || [];
  const hasCalendar = topics.length > 0 && story.body?.some(block => block._type === "upcomingGameEvents");
  const nextEvents = hasCalendar ? (await upcomingGameEvents(topics)).slice(0, 5) : [];
  const canonical = "https://allthingsgwinnett.com/stories/" + encodeURIComponent(story.slug);
  let inSources = false;
  const headingLogos = new Map<string, string>();
  const body = (story.body || []).filter((block, index, blocks) => {
    const heading = blocks[index - 1];
    if (block._type === "image" && block.besideHeading && block.imageUrl && !block.caption &&
        heading?._type === "block" && heading.style === "h3") {
      headingLogos.set(heading._key, block.imageUrl);
      return false;
    }
    return true;
  });
  const articleBody = body.map((block: any) => {
    if (block._type !== "block") return block;
    if (/^h[1-6]$/.test(block.style)) {
      const heading = (block.children || []).map((span: any) => span.text || "").join("").trim();
      inSources = /^(sources?|references|methods and sources|sources and methodology)[:.]?$/i.test(heading);
    }
    if ((!inSources && !/^source-\d+$/.test(block._key)) || !block.markDefs?.length) return block;
    return { ...block, markDefs: block.markDefs.map((mark: any) => ({ ...mark, sourceEntry: true })) };
  });
  const figureMetadata: Record<string, { description: string; period: string; variables: string[]; sources: string[] }> = story._id === "d74a7eb1-dd41-4b97-b316-ea5d72d3e60c" ? {
  "cityPop": {
    "description": "July 2025 population estimates for each municipality’s Gwinnett residents and unincorporated Gwinnett.",
    "period": "2025-07-01",
    "variables": [
      "Resident population"
    ],
    "sources": [
      "source-20"
    ]
  },
  "cityRace": {
    "description": "Counts and percentages by Hispanic origin and non-Hispanic race within the Gwinnett portion of each city.",
    "period": "2020-04-01",
    "variables": [
      "Resident population",
      "Population share by race and Hispanic origin"
    ],
    "sources": [
      "source-21"
    ]
  },
  "gw6": {
    "description": "Gwinnett County decennial population counts and the July 2025 population estimate.",
    "period": "1970/2025",
    "variables": [
      "Resident population"
    ],
    "sources": [
      "source-1",
      "source-2",
      "source-3"
    ]
  },
  "gw24": {
    "description": "Components of annual population change in Gwinnett County, measured in residents.",
    "period": "2024-07-01/2025-07-01",
    "variables": [
      "Net domestic and international migration",
      "Natural increase",
      "Residual adjustment"
    ],
    "sources": [
      "source-7"
    ]
  },
  "gw30": {
    "description": "Percentages of Gwinnett residents by race and Hispanic origin in 1990, 2010 and 2020.",
    "period": "1990/2020",
    "variables": [
      "Population share by race and Hispanic origin"
    ],
    "sources": [
      "source-9",
      "source-19"
    ]
  }
} : {};
  const datasets = (story.body || []).filter(block => figureMetadata[block._key]?.description && (
    block._type === "callout" || (block._type === "image" && chartFigures[block.asset?._ref])
  )).map(block => {
    const url = canonical + "#" + encodeURIComponent(block._key);
    const citations = (figureMetadata[block._key].sources as string[]).map(key =>
      story.body?.find(source => source._key === key)?.markDefs?.[0]?.href
    ).filter(Boolean);
    return {
      "@type": "Dataset",
      "@id": url,
      url,
      name: block.heading || chartFigures[block.asset._ref].title,
      description: figureMetadata[block._key].description,
      temporalCoverage: figureMetadata[block._key].period,
      spatialCoverage: { "@type": "Place", name: story.location },
      variableMeasured: figureMetadata[block._key].variables,
      citation: citations,
      isPartOf: { "@id": canonical },
    };
  });
  const structured = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "@id": canonical,
    ...(datasets.length > 0 && { hasPart: datasets }),
    headline: story.title,
    description: story.excerpt,
    mainEntityOfPage: canonical,
    datePublished: story.publishedAt,
    image: imageUrl(story.image) || undefined,
    author: story.author?.name ? { "@type": "Person", name: story.author.name } : undefined,
    publisher: { "@type": "Organization", name: "All Things Gwinnett", url: "https://allthingsgwinnett.com" },
  };
  return (
    <main id="main" className="site-width page-content">
      <article className="article">
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structured).replace(/</g, "\\u003c") }} />
        <header>
          <p className="story-label">{storyLabel(story)}</p>
          <h1>{story.title}</h1>
          {story.excerpt && <p className="lead-deck">{story.excerpt}</p>}
          <p className="byline">
            {story.author?.name && <>By {story.author.slug ? <a href={"/authors/"+encodeURIComponent(story.author.slug)}>{story.author.name}</a> : story.author.name} · </>}
            {story.publishedAt && (
              <time dateTime={story.publishedAt}>
                {formatDate(story.publishedAt)}
              </time>
            )}
          </p>
          <StoryImage story={story} priority />
          {story.image?.credit && (
            <p className="quiet">Photo: {story.image.credit}</p>
          )}
        </header>
        <div className="article-body">
          <PortableText
            value={articleBody}
            components={{
              block: {
                h3: ({ children, value }) => {
                  const logo = headingLogos.get(value._key);
                  return logo ? (
                    <h3 className="story-business-heading">
                      <img src={logo} alt="" loading="lazy" decoding="async" />
                      <span>{children}</span>
                    </h3>
                  ) : <h3>{children}</h3>;
                },
                normal: ({children,value}) => <p id={/^source-\d+$/.test(value._key) ? value._key : undefined}>{children}</p>,
              },
              marks: {
                link: ({ children, value }) => {
                  const anchor = (value?.href || "").replace(canonical, "");
                  if (/^#source-\d+$/.test(anchor)) return <sup><a href={anchor}>{children}</a></sup>;
                  if (/^#[\w-]+$/.test(anchor)) return <a style={value?.sourceEntry ? { fontSize: "0.875rem" } : undefined} href={anchor}>{children}</a>;
                  const href = value?.internalSlug
                    ? `/stories/${encodeURIComponent(value.internalSlug)}`
                    : safeUrl(value?.href);
                  return href ? <a style={value?.sourceEntry ? { fontSize: "0.875rem", overflowWrap: "anywhere" } : undefined} href={href} target={/^https?:/.test(href) ? "_blank" : undefined} rel="noopener noreferrer">{children}</a> : <>{children}</>;
                },
              },
              types: {
                faq: StoryFaq,
                upcomingGameEvents: ({ value }) => hasCalendar ? (
                  <section>
                    <h2>{value.heading || "Upcoming events"}</h2>
                    <GameEventTable events={nextEvents} caption="Next five events" />
                    {topics.includes("pokemon") && <p><Link className="button button-orange" href="/events/pokemon">See all Gwinnett Pokémon events</Link></p>}
                  </section>
                ) : null,
                image: ({ value }) =>
                  chartFigures[value.asset?._ref] ? <div id={figureMetadata[value._key] ? value._key : undefined}><StoryDataChart chart={chartFigures[value.asset._ref]} caption={value.caption} /></div> : value.imageUrl ? (
                    <figure>
                      <img src={value.imageUrl} alt={value.alt || ""} loading="lazy" decoding="async" />
                      {value.caption && (
                        <figcaption>{value.caption}</figcaption>
                      )}
                    </figure>
                  ) : null,
                pullQuote: ({ value }) => (
                  <blockquote>
                    {value.text}
                    {value.attribution && <cite> — {value.attribution}</cite>}
                  </blockquote>
                ),
                divider: () => <hr />,
                callout: ({ value }) => figureMetadata[value._key] ? <div id={value._key}><StoryCallout value={value} /></div> : <StoryCallout value={value} />,
                tldr: ({ value }) => (
                  <aside className="story-summary" aria-label="Article summary">
                    <h2>{value.heading || "TL;DR"}</h2>
                    <ul>
                      {value.points?.map((p: string) => (
                        <li key={p}>{p}</li>
                      ))}
                    </ul>
                  </aside>
                ),
                editorsNote: ({ value }) => (
                  <aside>
                    <h2>{value.title || "Editor’s note"}</h2>
                    <p>{value.body}</p>
                  </aside>
                ),
                correction: ({ value }) => (
                  <aside>
                    <h2>Correction</h2>
                    <p>{value.body}</p>
                  </aside>
                ),
              },
            }}
          />
        </div>
      <p><a className="text-link" href="https://www.facebook.com/groups/allthingsgwinnett">Discuss this story in the ATG Facebook group ↗</a></p>
      </article>
    </main>
  );
}
