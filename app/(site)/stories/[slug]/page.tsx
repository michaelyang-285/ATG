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
    `*[${PUBLISHED} && slug.current==$slug][0]{${STORY_FIELDS},body[]{...,"imageUrl":asset->url,markDefs[]{...,"internalSlug":internal->slug.current}}}`,
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
  return s
    ? {
        title: s.title,
        description: s.excerpt,
        alternates: { canonical: `/stories/${encodeURIComponent(s.slug)}` },
        openGraph: {
          type: "article",
          title: s.title,
          description: s.excerpt,
          url: `/stories/${encodeURIComponent(s.slug)}`,
          publishedTime: s.publishedAt,
          images: imageUrl(s.image) ? [{ url: imageUrl(s.image)!, alt: s.image?.alt }] : undefined,
        },
      }
    : { title: "Story not found" };
}
export default async function Page({ params }: { params: { slug: string } }) {
  const story = await getStory(params.slug);
  if (!story) notFound();
  const canonical = "https://allthingsgwinnett.com/stories/" + encodeURIComponent(story.slug);
  const structured = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
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
            value={story.body || []}
            components={{
              marks: {
                link: ({ children, value }) => {
                  const href = value?.internalSlug
                    ? `/stories/${encodeURIComponent(value.internalSlug)}`
                    : safeUrl(value?.href);
                  return href ? <a href={href}>{children}</a> : <>{children}</>;
                },
              },
              types: {
                image: ({ value }) =>
                  value.imageUrl ? (
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
                callout: ({ value }) => <StoryCallout value={value} />,
                tldr: ({ value }) => (
                  <aside>
                    <h2>{value.heading || "At a glance"}</h2>
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
