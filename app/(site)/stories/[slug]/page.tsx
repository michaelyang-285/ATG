import {publisher} from "@/lib/publisher";
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
  storyAuthor,
  imageUrl,
  safeUrl,
  type Story,
} from "@/lib/publication";
import "@/styles/story-guide.css";
import { RecruitDirectory, StoryCallout } from "@/components/StoryCallout";
import { StoryByline } from "@/components/StoryByline";
import { StoryImage } from "@/components/Publication";
import { cache } from "react";
import { tacoGuideSchema, type GuideRestaurant } from "@/lib/taco-guide-schema";
import {GuideMenu, MallGuideFigure} from "@/components/MallGuide";
const mallSlug = "gwinnett-place-mall-redevelopment";
const mallDraftId = "drafts.atg-gwinnett-place-mall-guide";
export const revalidate = 60;
const getStory = cache((slug: string) => {
  const previewMall = slug === mallSlug && process.env.VERCEL_ENV === "preview";
  const client = previewMall ? publication.withConfig({useCdn:false, perspective:"raw", token:process.env.SANITY_API_READ_TOKEN || process.env.SANITY_WRITE_TOKEN?.trim()}) : publication;
  const filter = previewMall ? "_id == $mallDraftId && _type == 'post'" : PUBLISHED;
  return client.fetch<(Story & {guideRestaurants?: GuideRestaurant[]}) | null>(
    `*[${filter} && slug.current==$slug][0]{${STORY_FIELDS},seo,_id == "atg-street-tacos-gwinnett" => {"guideRestaurants": *[_type == "business" && ("sanity:" + _id) in ^.relatedDirectoryListings]{name,address,"slug":slug.current}},body[]{...,"imageUrl":asset->url,markDefs[]{...,"internalSlug":internal->slug.current}}}`,
    { slug, mallDraftId },
    { next: { revalidate: 60 } },
  );
});
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
  const image = socialImage || imageUrl(s.image, 1200, 630, "jpg");
  const images = image ? [{
    url: image,
    alt: socialImage ? seo?.ogImage?.alt : s.image?.alt,
    width: 1200,
    height: 630,
  }] : undefined;
  const path = `/stories/${encodeURIComponent(s.slug)}`;
  return {
    title: seo?.title ? { absolute: seo.title } : s.title,
    description,
    alternates: { canonical: path },
    ...(s._id === mallDraftId && { robots: {index:false, follow:false} }),
    openGraph: {
      type: "article",
      siteName: "All Things Gwinnett",
      title: socialTitle,
      description: socialDescription,
      url: path,
      publishedTime: s.publishedAt,
      modifiedTime: s.updatedAt,
      images,
    },
    ...(seo && { twitter: { card: "summary_large_image", title: socialTitle, description: socialDescription, images } }),
  };
}
type GuideSpan = {text: string; marks?: string[]};
function RestaurantLinks({spans, marks}: {spans: GuideSpan[]; marks: { _key: string; href?: string }[]}) {
  const links = spans.flatMap(span => {
    const href = safeUrl(marks.find(mark => span.marks?.includes(mark._key))?.href);
    return href ? [{label: span.text.trim(), href}] : [];
  });
  const ratings = links.filter(link => /^(Google|Yelp)\b/.test(link.label));
  const actions = links.filter(link => !ratings.includes(link));
  return <div style={{fontSize:"1rem", marginBlock:"0.45rem"}}>
    {ratings.map(({label,href}) => {
      const [provider] = label.split(" ");
      const score = label.match(/([\d.]+)\/5/);
      const detail = score ? label.slice(label.indexOf(score[0]) + score[0].length).trim() : label.slice(provider.length).trim();
      return <div key={href} data-review-provider={provider} style={{maxWidth:"34rem",borderBottom:"1px solid #dedbd4"}}>
        <a href={href} aria-label={label} style={{display:"flex",flexWrap:"wrap",alignItems:"center",gap:"0.5rem",minHeight:44,paddingBlock:4,color:"inherit",textDecoration:"none"}}>
          <strong style={{minWidth:"3.75rem"}}>{provider}</strong>
          {score && <><span aria-hidden="true" style={{position:"relative",color:"#cac6bc",lineHeight:1,whiteSpace:"nowrap"}}>★★★★★<span style={{position:"absolute",inset:"0 auto 0 0",width:Number(score[1])*20+"%",overflow:"hidden",color:"#96600e"}}>★★★★★</span></span><b>{score[1]}/5</b></>}
          <small>{detail}</small>
        </a>
      </div>;
    })}
    <div style={{display:"flex",alignItems:"center",gap:"1rem",flexWrap:"wrap"}}>
      {actions.map(({href,label}) => {
        const icon = label==="🌐" ? "Website" : label==="ⓕ" ? "Facebook" : undefined;
        return <a key={href} href={href} title={icon} aria-label={icon} style={{display:"inline-flex",alignItems:"center",justifyContent:"center",minHeight:44,minWidth:icon?44:undefined,fontSize:"0.95rem"}}>
          {icon==="Website" ? <svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="12" cy="12" r="9"/><ellipse cx="12" cy="12" rx="4" ry="9"/><path d="M3 12h18"/></svg> : icon==="Facebook" ? <b aria-hidden="true">ⓕ</b> : label}
        </a>;
      })}
    </div>
  </div>;
}

function StorySummary({ value }: { value: { heading?: string; points?: string[] } }) {
  return (
    <aside className="story-summary" aria-label="Article summary">
      <h2>{value.heading || "TL;DR"}</h2>
      <ul>{value.points?.map(point => <li key={point}>{point}</li>)}</ul>
    </aside>
  );
}

export default async function Page({ params }: { params: { slug: string } }) {
  const story = await getStory(params.slug);
  if (!story) notFound();
  if (story._id === "gcps-schools-since-2004") return <SchoolsFeature story={story} />;
  const mallGuide = story.slug === mallSlug;
  const topics = story.gameTopics || [];
  const hasCalendar = topics.length > 0 && story.body?.some(block => block._type === "upcomingGameEvents");
  const nextEvents = hasCalendar ? (await upcomingGameEvents(topics)).slice(0, 5) : [];
  const canonical = "https://allthingsgwinnett.com/stories/" + encodeURIComponent(story.slug);
  let inSources = false;
  const isHolidayGuide = story._id === "atg-gwinnett-thanksgiving-holiday-hacks-2026";
  const headingLogos = new Map<string, string>();
  const body = (story.body || []).filter((block, index, blocks) => {
    const heading = blocks[index - 1];
    if (isHolidayGuide && block._type === "image" && block.imageUrl && !block.caption &&
        /\blogo\b/i.test(block.alt || "") && heading?._type === "block" && heading.style === "h3") {
      headingLogos.set(heading._key, block.imageUrl);
      return false;
    }
    return !(mallGuide && block._key === "hero-original");
  });
  const recruitTables = body.filter(block => block._type === "callout" && ["recruit-table-0", "recruit-table-1"].includes(block._key));
  const articleBody = body.map((block: any) => {
    if (block._type !== "block") return block;
    if (isHolidayGuide && block.style === "normal" &&
        block.markDefs?.some((mark: { href?: string }) => mark.href?.startsWith("https://www.google.com/maps"))) {
      return { ...block, children: block.children.map((span: { _type: string; text?: string; marks?: string[] }) =>
        span._type === "span" && !span.marks?.length && /^\d{3}-\d{3}-\d{4}$/.test(span.text || "")
          ? { ...span, _type: "directoryPhone" } : span) };
    }
    if (/^h[1-6]$/.test(block.style)) {
      const heading = (block.children || []).map((span: any) => span.text || "").join("").trim();
      inSources = /^(sources?|references|methods and sources|sources and methodology)[:.]?$/i.test(heading);
    }
    if ((!inSources && !/^source-\d+$/.test(block._key)) || !block.markDefs?.length) return block;
    return { ...block, markDefs: block.markDefs.map((mark: any) => ({ ...mark, sourceEntry: true })) };
  });
  const notesStart = story.guideRestaurants ? articleBody.findIndex(block =>
    block.style === "h2" && block.children?.some((span: GuideSpan) => span.text === "Sources and methodology")
  ) : -1;
  const mainBody = notesStart < 0 ? articleBody : articleBody.slice(0, notesStart);
  const leadSummary = (isHolidayGuide || mallGuide) && articleBody[0]?._type === "tldr" ? articleBody[0] : undefined;
  const figureMetadata: Record<string, { name?: string; creator?: string; description: string; period: string; variables: string[]; sources: string[] }> = story._id === "d74a7eb1-dd41-4b97-b316-ea5d72d3e60c" ? {
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
} : story._id === "acb4b18b-db6b-4fa1-a004-a4d373dca55b" ? {
  "recruit-table-0": {
    "name": "Gwinnett County Division I recruits, Class of 2027",
    "creator": "All Things Gwinnett",
    "description": "Gwinnett County high school athletes in the class of 2027 with documented Division I offers, commitments or signings, recruiting ratings and available state and national rankings.",
    "period": "2026-11-28",
    "variables": [
      "College decision",
      "Recruiting rating",
      "Georgia rank",
      "National rank"
    ],
    "sources": [
      "source-1",
      "source-3",
      "source-4",
      "source-5",
      "source-6",
      "source-7",
      "source-8"
    ]
  },
  "recruit-table-1": {
    "name": "Gwinnett County Division I prospects, Classes of 2028 through 2030",
    "creator": "All Things Gwinnett",
    "description": "Selected Gwinnett underclassmen with documented Division I offers or commitments, listed by class, school, sport, college and available ranking.",
    "period": "2026-11-28",
    "variables": [
      "Graduation class",
      "College offer or commitment",
      "Recruiting rating",
      "Georgia rank",
      "National rank"
    ],
    "sources": [
      "source-10",
      "source-11",
      "source-12",
      "source-13",
      "source-14",
      "source-16"
    ]
  },
  "national-counties": {
    "creator": "Gridpex",
    "description": "National ranks for the ten highest-ranked counties and two selected peers in Gridpex’s hometown-based, star-weighted football recruiting data from 2010 through 2026.",
    "period": "2010/2026",
    "variables": [
      "National county rank"
    ],
    "sources": [
      "source-19"
    ]
  },
  "alumni-table": {
    "creator": "All Things Gwinnett",
    "description": "Selected Gwinnett high school alumni by sport, position or event, high school and graduating year from 2000 through 2026.",
    "period": "2000/2026",
    "variables": [
      "Graduation year",
      "Sport",
      "Position or event",
      "High school"
    ],
    "sources": [
      "source-17",
      "source-20",
      "source-21"
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
    const recruitTable = recruitTables.find(table => table._key === block._key);
    const athletes = recruitTable && Array.isArray(recruitTable.body)
      ? recruitTable.body.slice(1).flatMap((row: { children?: { text?: string }[] }) => {
          const cells = row.children?.map(span => span.text || "").join("").split("\n");
          if (!cells?.[0]?.trim()) return [];
          const younger = block._key === "recruit-table-1";
          const [school, sport, status, college] = cells.slice(younger ? 2 : 1);
          const description = [school, younger ? cells[1] : "2027", sport, status, college].filter(Boolean).join(" · ");
          return [{ "@type": "Person", name: cells[0].trim(), description }];
        })
      : [];
    return {
      "@type": "Dataset",
      "@id": url,
      url,
      name: figureMetadata[block._key].name || block.heading || chartFigures[block.asset._ref].title,
      description: figureMetadata[block._key].description,
      temporalCoverage: figureMetadata[block._key].period,
      spatialCoverage: { "@type": "Place", name: block._key === "national-counties" ? "United States" : story.location },
      ...(athletes.length > 0 && { mainEntity: {
        "@type": "ItemList", "@id": url + "-list", name: figureMetadata[block._key].name,
        itemListOrder: "https://schema.org/ItemListUnordered", numberOfItems: athletes.length,
        itemListElement: athletes,
      } }),
      variableMeasured: figureMetadata[block._key].variables,
      citation: citations,
      ...(figureMetadata[block._key].creator && { creator: { "@type": "Organization", name: figureMetadata[block._key].creator } }),
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
    dateModified: story.updatedAt,
    image: imageUrl(story.image) || undefined,
    author: storyAuthor(story.author),
    publisher,
    ...(story.guideRestaurants && { ...tacoGuideSchema(canonical, story.title, body, story.guideRestaurants), "@id": canonical + "#article" }),
  };
  return (
    <main id="main" className="site-width page-content">
      <article className={mallGuide ? "article mall-guide" : "article"}>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structured).replace(/</g, "\\u003c") }} />
        <header>
          {story.guideRestaurants ? <nav aria-label="Breadcrumb" style={{display:"flex",flexWrap:"wrap",alignItems:"baseline",gap:"0.45rem",fontSize:"0.875rem",marginBottom:"1rem"}}><Link href="/">Home</Link><span aria-hidden="true">/</span><Link href="/food-drink">Food &amp; drink</Link><span aria-hidden="true">/</span><span aria-current="page">{story.title}</span></nav> : <p className="story-label">{storyLabel(story)}</p>}
          <h1>{story.title}</h1>
          {story.excerpt && <p className="lead-deck">{story.excerpt}</p>}
          <p className="byline"><StoryByline story={story} /></p>
          {leadSummary && <div className="article-body"><StorySummary value={leadSummary} /></div>}
          {mallGuide && story.image ? <figure><a href={imageUrl(story.image,1800,1000) || undefined}><img className="story-image" style={{objectFit:"contain",height:"auto"}} src={story.body?.find(b=>b._key==="hero-original")?.imageUrl || imageUrl(story.image) || undefined} alt={story.image.alt}/></a><figcaption>{story.image.caption}</figcaption></figure> : <StoryImage story={story} priority />}
          {story.image?.credit && (
            <p className="quiet">Photo: {story.image.credit}</p>
          )}
        </header>
        <div className="article-body">
          {mallGuide && <GuideMenu blocks={articleBody} />}
          <PortableText
            value={leadSummary ? mainBody.slice(1) : mainBody}
            components={{
              block: {
                h2: ({children,value}) => {
                  if (mallGuide) return <h2 id={value._key}>{children}</h2>;
                  const heading = value.children?.map(span => String(span.text || "")).join("") || "";
                  if (!story.guideRestaurants || !/^\d+\. /.test(heading) || !heading.includes(" | ")) return <h2>{children}</h2>;
                  const [name, detail] = heading.split(" | ");
                  return <h2>{name}<small style={{display:"block",fontSize:"1rem",fontWeight:500,marginTop:6}}>{detail}</small></h2>;
                },
                h3: ({ children, value }) => {
                  const logo = headingLogos.get(value._key);
                  return logo ? (
                    <h3 className="story-business-heading">
                      <img src={logo} alt="" loading="lazy" decoding="async" />
                      <span>{children}</span>
                    </h3>
                  ) : <h3>{children}</h3>;
                },
                normal: ({children,value}) => story.guideRestaurants && value.children?.some(s => /^Google ★|^Go to the Directory$/.test(String(s.text || "").trim()))
                  ? <RestaurantLinks spans={value.children.map(s => ({text:String(s.text || ""),marks:Array.isArray(s.marks) ? s.marks : []}))} marks={(value.markDefs || []).map(m => ({_key:m._key,href:typeof m.href === "string" ? m.href : undefined}))}/>
                  : <p id={/^source-\d+$/.test(value._key) ? value._key : undefined}>{children}</p>,
              },
              marks: {
                link: ({ children, value }) => {
                  const anchor = (value?.href || "").replace(canonical, "");
                  if (/^#source-\d+$/.test(anchor)) return <sup><a href={anchor}>{children}</a></sup>;
                  if (/^#[\w-]+$/.test(anchor)) return <a style={value?.sourceEntry ? { fontSize: "0.875rem" } : undefined} href={anchor}>{children}</a>;
                  if (mallGuide && /^\/(?![\/\\])/.test(value?.href || "")) return <Link href={value.href}>{children}</Link>;
                  const href = value?.internalSlug
                    ? `/stories/${encodeURIComponent(value.internalSlug)}`
                    : safeUrl(value?.href);
                  return href ? <a style={value?.sourceEntry ? { fontSize: "0.875rem", overflowWrap: "anywhere" } : undefined} href={href} target={/^https?:/.test(href) ? "_blank" : undefined} rel="noopener noreferrer">{children}</a> : <>{children}</>;
                },
              },
              types: {
                directoryPhone: ({ value }) => <a href={"tel:+1" + value.text.replace(/-/g, "")}>{value.text}</a>,
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
                callout: ({ value }) => mallGuide ? <MallGuideFigure value={value}/> : recruitTables.some(table => table._key === value._key)
                  ? (value._key === recruitTables[0]._key ? <RecruitDirectory tables={recruitTables} /> : null)
                  : figureMetadata[value._key] ? <div id={value._key}><StoryCallout value={value} /></div> : <StoryCallout value={value} />,
                tldr: StorySummary,
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
          {notesStart >= 0 && <section aria-label="Sources and methodology" style={{borderTop:"1px solid #d5d3ce",marginTop:"2rem",paddingTop:"1rem",color:"#494945"}}>
            <h2 style={{fontSize:"1rem",lineHeight:1.4,margin:"0 0 0.5rem"}}>Sources and methodology</h2>
            <ol style={{listStyle:"decimal",fontSize:"0.875rem",lineHeight:1.55,paddingLeft:"1.4rem",margin:0}}>
              {articleBody.slice(notesStart + 1).map(block => <li key={block._key} style={{fontSize:"inherit",margin:"0.35rem 0"}}>
                <PortableText value={block} components={{block:{normal:({children}) => <>{children}</>},marks:{link:({value,children}) => <a style={{fontSize:"inherit",textDecoration:"underline"}} href={safeUrl(value?.href) || undefined}>{children}</a>}}}/>
              </li>)}
            </ol>
          </section>}
        </div>
      <p><a className="text-link" href="https://www.facebook.com/groups/allthingsgwinnett">Discuss this story in the ATG Facebook group ↗</a></p>
      </article>
    </main>
  );
}
