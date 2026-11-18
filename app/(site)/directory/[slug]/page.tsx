import {notFound} from "next/navigation";
import Link from "next/link";
import {safeUrl} from "@/lib/publication";
import {getListing, listingPhoto, listingPath, listingSchema} from "@/lib/directory/profile";
import "../directory.css";
export const revalidate = 60;
type Props = {params:{slug:string}};
export async function generateMetadata({params}:Props) {
  const b = await getListing(params.slug);
  if (!b) notFound();
  const title = [b.name,b.category,b.neighborhood || "Gwinnett County"].filter(Boolean).join(" · ");
  const description = b.summary?.slice(0,160) || "Explore "+b.name+" in the Gwinnett directory.";
  const path = listingPath(b.slug);
  return {title,description,alternates:{canonical:path},openGraph:{title,description,url:path,images:[listingPhoto(b)||"/brand/og.png"]}};
}
export default async function Page({params}:Props) {
  const b = await getListing(params.slug);
  if (!b) notFound();
  const photo = listingPhoto(b);
  const tags = Array.from(new Set([b.category,...(b.categories||[]),...(b.services||[])].filter(Boolean)));
  return <main id="main" className="site-width page-content atg-profile">
    <script type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify(listingSchema(b)).replace(/</g,"\\u003c")}}/>
    <Link className="text-link" href="/directory">← Gwinnett directory</Link>
    <header className="listing-heading">
      {photo && <img src={photo} width="112" height="112" alt=""/>}
      <div><p className="story-label">{b.category || "Community directory"}</p><h1>{b.name}</h1>
      {b.neighborhood && <p>{b.neighborhood}</p>}</div>
    </header>
    <div className="listing-columns"><section><h2>About {b.name}</h2><p className="listing-summary">{b.summary}</p>
      <div className="listing-tags">{tags.map(tag=><span key={tag}>{tag}</span>)}</div>
      {b.gallery?.map(src=><img className="listing-photo" key={src} src={src} alt={b.name+" work photo"} loading="lazy"/>)}
    </section><aside><h2>Listing details</h2>
      {[[ "City or service area",b.neighborhood],["Address",b.address],["Hours",b.hours]].map(([label,value])=>value && <p key={label}><strong>{label}</strong><br/>{value}</p>)}
      {b.publicPhone && <p><a href={"tel:"+b.publicPhone.replace(/[^+0-9]/g,"")}>{b.publicPhone}</a></p>}
      {b.publicEmail && <p><a href={"mailto:"+b.publicEmail}>{b.publicEmail}</a></p>}
      {[[b.url,"Visit website"],[b.booking,"Book an appointment"],[b.social,"Social profile"]].map(([url,label])=>safeUrl(url) && <p key={label}><a className="text-link" href={safeUrl(url)!}>{label} ↗</a></p>)}
    </aside></div></main>;
}
