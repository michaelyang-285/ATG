import {directoryPublic} from "@/lib/directory/public";
import { notFound } from "next/navigation";
import { publication, safeUrl, type Business } from "@/lib/publication";
export const revalidate = 60;
export default async function Page({ params }: { params: { slug: string } }) {
  const local = /^local-([a-f0-9-]{36})$/.exec(params.slug);
  const b = local ? (await directoryPublic(local[1]))[0] : await publication.fetch<Business | null>(
    '*[_type=="business" && slug.current==$slug][0]{name,category,neighborhood,summary,address,url}',
    { slug: params.slug },
  );
  if (!b) notFound();
  return (
    <main id="main" className="site-width page-content">
      <article className="prose">
        <p className="story-label">Owner-submitted listing</p>
        {b.logo && <img src={b.logo} alt="" width={90} height={90}/>}
        <h1>{b.name}</h1>
        <p>{[b.category,...(b.categories||[]),...(b.services||[])].filter(Boolean).join(" · ")}</p>
        <p className="lead-deck">{b.summary}</p>
        <p>{[b.address,b.neighborhood].filter(Boolean).join(" · ")}</p>
        {b.hours && <p>{b.hours}</p>}
        {b.publicPhone && <p>{b.publicPhone}</p>}
        {b.publicEmail && <p>{b.publicEmail}</p>}
        {safeUrl(b.booking) && <p><a href={b.booking}>Book an appointment</a></p>}
        {safeUrl(b.social) && <p><a href={b.social}>Social profile</a></p>}
        {b.gallery?.map((src:string)=><img key={src} src={src} alt={b.name+" work photo"} loading="lazy" width={320}/>)}
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
