import DirectorySocialIcon from "@/components/DirectorySocialIcon";
import {networks} from "@/lib/directory/social";
import {notFound} from "next/navigation";
import Link from "next/link";
import {publication,PUBLISHED,isGuide,storyHref,type Story,safeUrl} from "@/lib/publication";
import {getListing, listingPhoto, listingPath, listingSchema} from "@/lib/directory/profile";
import "../directory.css";
export const revalidate = 60;
type Props = {params:{slug:string}};
const sample = {
  _id:"sample", slug:"sample-coffee-profile", name:"Lantern & Oak Coffee",
  category:"Coffee", categories:["Cafés"], services:["Storefront","Pickup"],
  neighborhood:"Duluth", hours:"Monday–Saturday, 7 am–4 pm",
  summary:"Espresso, cold brew, and rotating pastries in downtown Duluth. Stop in for a morning pour-over or pick up a latte on your way to work.",
  address:"Duluth Town Green, Duluth, GA", url:"https://example.com",
  instagram:"https://www.instagram.com/",facebook:"https://www.facebook.com/",tiktok:"https://www.tiktok.com/",
  logo:"/directory/lantern-oak.svg",
  gallery:[
    "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=1000&q=85",
    "https://images.unsplash.com/photo-1541167760496-1628856ab772?auto=format&fit=crop&w=1000&q=85"
  ],
  publicPhone:"(770) 555-0142"
};
function isSample(slug:string) {
  return process.env.VERCEL_ENV === "preview" && slug === sample.slug;
}
export async function generateMetadata({params}:Props) {
  if (isSample(params.slug)) return {title:"Sample coffee shop profile",robots:{index:false,follow:false}};
  const b = await getListing(params.slug);
  if (!b) notFound();
  const title = [b.name,b.category,b.neighborhood || "Gwinnett County"].filter(Boolean).join(" · ");
  const description = b.summary?.slice(0,160) || "Explore "+b.name+" in the Gwinnett directory.";
  const path = listingPath(b.slug);
  return {title,description,alternates:{canonical:path},openGraph:{title,description,url:path,images:[listingPhoto(b)||"/brand/og.png"]}};
}
export default async function Page({params}:Props) {
  const demo = isSample(params.slug);
  const b: Awaited<ReturnType<typeof getListing>> = demo ? sample : await getListing(params.slug);
  if (!b) notFound();
  const photo = demo ? sample.logo : listingPhoto(b);
  const listingKey = (b.slug === "local-"+b._id ? "local:" : "sanity:") + b._id;
  const coverage = demo ? [] : await publication.fetch<Story[]>(
    `*[${PUBLISHED} && $listingKey in relatedDirectoryListings] | order(publishedAt desc){_id,title,"slug":slug.current,format,"categories":categories[]->{title}}`,
    {listingKey}, {next:{revalidate:60}}
  );
  const website = safeUrl(b.url);
  const instagramWebsite = website && /^(?:[a-z0-9-]+\.)*(?:instagram\.com|instagr\.am)$/i.test(new URL(website).hostname.replace(/\.$/, ""));
  const destination = b.address?.trim() ? encodeURIComponent(b.address.trim()) : "";
  const socials = networks.flatMap(n=>{
    const href = safeUrl(b[n.key]);
    return href ? [{...n,href}] : [];
  });
  const tags = Array.from(new Set([b.category,...(b.categories||[]),...(b.services||[])].filter(Boolean)));
  return <main id="main" className="site-width page-content atg-profile">
    {demo ? <p className="story-label">Sample profile · Fictional business</p> : <script type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify(listingSchema(b)).replace(/</g,"\\u003c")}}/>}
    <Link className="text-link" href="/directory">← Gwinnett directory</Link>
    <header className="listing-heading">
      {photo && <img src={photo} width="112" height="112" alt=""/>}
      <div><p className="story-label">{b.category || "Community directory"}</p><h1>{b.name}</h1>
      {b.neighborhood && <p>{b.neighborhood}</p>}{website && <a className="button button-orange" href={website}>{instagramWebsite ? "Go to Instagram" : "Visit website"} <span aria-hidden="true">↗</span></a>}</div>
    </header>
    <div className="listing-columns"><section><h2>About {b.name}</h2><p className="listing-summary">{b.summary}</p>
      <div className="listing-tags">{tags.map(tag=><span key={tag}>{tag}</span>)}</div>
      {coverage.length>0 && <section className="directory-coverage"><h2>On All Things Gwinnett</h2>
        <ul>{coverage.map(piece=><li key={piece._id}><Link href={storyHref(piece)}>
          <span>{isGuide(piece) ? "Featured in an ATG Guide" : "Mentioned on ATG"}</span>
          <strong>{piece.title}</strong>
        </Link></li>)}</ul>
      </section>}
      {b.gallery?.map((src,index)=><img className="listing-photo" key={src} src={src} alt={demo ? ["Café interior","Freshly poured latte"][index] : b.name+" work photo"} loading="lazy"/>)}
    </section><aside><h2>Listing details</h2>
      {[[ "City or service area",b.neighborhood],["Address",b.address],["Hours",b.hours]].map(([label,value])=>value && <p key={label}><strong>{label}</strong><br/>{value}</p>)}
      {b.publicPhone && <p><a href={"tel:"+b.publicPhone.replace(/[^+0-9]/g,"")}>{b.publicPhone}</a></p>}
      {b.publicEmail && <p><a href={"mailto:"+b.publicEmail}>{b.publicEmail}</a></p>}
      {[[b.booking,"Book an appointment"],[b.social,"Other social profile"]].map(([url,label])=>safeUrl(url) && <p key={label}><a className="text-link" href={safeUrl(url)!}>{label} ↗</a></p>)}
      {destination && <section><h3>Get directions</h3><div className="profile-links">
        <a href={"https://www.google.com/maps/dir/?api=1&destination="+destination}>Google Maps ↗</a>
        <a href={"https://maps.apple.com/?daddr="+destination}>Apple Maps ↗</a>
      </div></section>}
      {socials.length>0 && <section><h3>Social profiles</h3><div className="profile-links">{socials.map(n=>
        <a key={n.key} href={n.href}><DirectorySocialIcon network={n.key}/>{n.label}</a>)}</div></section>}
    </aside></div></main>;
}
