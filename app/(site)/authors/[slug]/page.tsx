import { cache } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import DirectorySocialIcon from "@/components/DirectorySocialIcon";
import { networks } from "@/lib/directory/social";
import { publication, PUBLISHED, imageUrl, safeUrl, formatDate, storyHref, type Story } from "@/lib/publication";
import "./author.css";

type Author = {
  name: string;
  bio?: string;
  role?: string;
  location?: string;
  image?: Story["image"];
  socials?: { _key?: string; platform?: string; url?: string }[];
  stories: Story[];
};

export const revalidate = 60;
const load = cache((slug: string) =>
  publication.fetch<Author | null>(
    `*[_type == "author" && slug.current == $slug][0]{
      name, bio, role, location, image, socials,
      "stories": *[${PUBLISHED} && author._ref == ^._id]
        | order(publishedAt desc, _id asc){_id, title, "slug": slug.current, excerpt, publishedAt, "image": mainImage}
    }`,
    { slug },
    { next: { revalidate: 60 } },
  ),
);

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const author = await load(params.slug);
  return author
    ? {
        title: author.name + " | Contributors",
        description: author.bio?.slice(0, 160),
        alternates: { canonical: "/authors/" + encodeURIComponent(params.slug) },
      }
    : {};
}

export default async function Page({ params }: { params: { slug: string } }) {
  const author = await load(params.slug);
  if (!author) notFound();
  const portrait = imageUrl(author.image, 480, 480);
  const details = [author.role, author.location].filter(Boolean).join(" · ");
  const links = (author.socials || []).flatMap((social) => {
    const href = safeUrl(social?.url);
    if (!href) return [];
    const host = new URL(href).hostname.toLowerCase();
    const network = networks.find(({ hosts }) =>
      hosts.some((domain) => host === domain || host.endsWith("." + domain)),
    );
    const platform = social.platform?.trim();
    const label = network?.label || (platform && platform.toLowerCase() !== "website" ? platform : "Website");
    return [{ key: social._key || href, href, network, label }];
  });

  return (
    <main id="main" className="site-width page-content">
      <header className={portrait ? "author-intro has-portrait" : "author-intro"}>
        {portrait && (
          <img className="author-portrait" src={portrait} alt={author.image?.alt || author.name} width={192} height={192} />
        )}
        <div className="author-identity">
          <h1>{author.name}</h1>
          {details && <p className="story-label">{details}</p>}
        </div>
        {author.bio && <div className="author-bio">{author.bio}</div>}
        {links.length > 0 && (
          <ul className="author-socials" aria-label={`Links for ${author.name}`}>
            {links.map(({ key, href, network, label }) => (
              <li key={key}>
                <a href={href} rel="me" aria-label={`${author.name} · ${label}`} title={label}>
                  {network ? <DirectorySocialIcon network={network.key} /> : (
                    <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" width="20" height="20">
                      <circle cx="12" cy="12" r="9" />
                      <ellipse cx="12" cy="12" rx="4" ry="9" />
                      <path d="M3 12h18" />
                    </svg>
                  )}
                </a>
              </li>
            ))}
          </ul>
        )}
      </header>

      <section className="author-articles" aria-labelledby="author-articles-title">
        <h2 id="author-articles-title">Articles by {author.name}</h2>
        {author.stories.length ? (
          <ul>
            {author.stories.map((story) => {
              const thumbnail = imageUrl(story.image, 640, 360);
              return (
                <li key={story._id}>
                  <Link className="author-story" href={storyHref(story)} aria-labelledby={`title-${story._id}`}>
                    {thumbnail && <img src={thumbnail} alt="" width={240} height={135} loading="lazy" />}
                    <div>
                      {story.publishedAt && <time dateTime={story.publishedAt}>{formatDate(story.publishedAt)}</time>}
                      <h3 id={`title-${story._id}`}>{story.title}</h3>
                      {story.excerpt && <p>{story.excerpt}</p>}
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
        ) : <p className="author-empty">No published articles yet.</p>}
      </section>
    </main>
  );
}
