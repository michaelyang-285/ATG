import { notFound } from "next/navigation";
import { publication, safeUrl, type Business } from "@/lib/publication";
export const revalidate = 60;
export default async function Page({ params }: { params: { slug: string } }) {
  const b = await publication.fetch<Business | null>(
    '*[_type=="business" && slug.current==$slug][0]{name,category,neighborhood,summary,address,url}',
    { slug: params.slug },
  );
  if (!b) notFound();
  return (
    <main id="main" className="site-width page-content">
      <article className="prose">
        <p className="story-label">Owner-submitted listing</p>
        <h1>{b.name}</h1>
        <p className="lead-deck">{b.summary}</p>
        <p>{b.address || b.neighborhood}</p>
        {safeUrl(b.url) && (
          <a href={safeUrl(b.url)!} className="text-link">
            Visit website <span aria-hidden="true">↗</span>
          </a>
        )}
        <p className="quiet">
          A directory listing is not an editorial endorsement.
        </p>
      </article>
    </main>
  );
}
