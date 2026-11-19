import IndependentProBadge from "@/components/IndependentProBadge";
import { defaultWeek } from "@/lib/directory/hours";
import OperatingHours from "@/components/OperatingHours";
import ListingCorrection from "@/components/ListingCorrection";
import DirectorySocialIcon from "@/components/DirectorySocialIcon";
import {networks} from "@/lib/directory/social";
import {notFound, permanentRedirect} from "next/navigation";
import ListingGallery from "@/components/ListingGallery";
import {directoryThumbnail} from "@/lib/directory/thumbnail";
import Link from "next/link";
import {publication,PUBLISHED,isGuide,storyHref,type Story,safeUrl} from "@/lib/publication";
import {getListing, listingPhoto, listingPath, listingSchema} from "@/lib/directory/profile";
import "../directory.css";
export const revalidate = 60;
type Props = {params:{slug:string}};
const sample = {
  _id:"sample", slug:"sample-coffee-profile", name:"Lantern & Oak Coffee",
  category:"Coffee", categories:["Cafés"], services:["Storefront","Pickup"],
  neighborhood:"Duluth",
  weeklyHours:defaultWeek().map(row => ({...row, open:row.day !== "Sunday", opens:"07:00", closes:"16:00"})),
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
  if (b.slug !== params.slug) permanentRedirect(listingPath(b.slug));
  const photo = demo ? sample.logo : listingPhoto(b);
  const listingKey = (b.source === "local" ? "local:" : "sanity:") + b._id;
  const coverage = demo ? [] : await publication.fetch<Story[]>(
    `*[${PUBLISHED} && $listingKey in relatedDirectoryListings] | order(publishedAt desc){_id,title,"slug":slug.current,format,"categories":categories[]->{title}}`,
    {listingKey}, {next:{revalidate:60}}
  );
  const website = safeUrl(b.url);
  const instagramWebsite = website && /^(?:[a-z0-9-]+\.)*(?:instagram\.com|instagr\.am)$/i.test(new URL(website).hostname.replace(/\.$/, ""));
  const destination = b.address?.trim() ? encodeURIComponent(b.address.trim()) : "";
  const phone = b.publicPhone?.trim();
  const phoneLabel = phone?.replace(/^(?:\+?1[ .-]?)?\(?(\d{3})\)?[ .-]?(\d{3})[ .-]?(\d{4})$/, "($1) $2-$3");
  const booking = safeUrl(b.booking);
  const otherSocial = safeUrl(b.social);
  const socials = networks.flatMap(n=>{
    const href = safeUrl(b[n.key]);
    return href ? [{...n,href}] : [];
  });
  const tags = Array.from(new Set([b.category,...(b.categories||[]),...(b.services||[])].filter(Boolean)));
  return <main id="main" className="site-width page-content atg-profile">
    {demo ? <p className="story-label">Sample profile · Fictional business</p> : <script type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify(listingSchema(b)).replace(/</g,"\\u003c")}}/>}
    <Link className="text-link" href="/directory">← Gwinnett directory</Link>
    <header className="listing-heading">
      {photo && <img src={photo === b.gallery?.[0] ? directoryThumbnail(photo) : photo} width="112" height="112" alt=""/>}
      <div><p className="story-label">{b.category || "Community directory"}</p>{b.providerType === "independent" && <IndependentProBadge />}<h1>{b.name}</h1>
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
      {!!b.gallery?.length && <ListingGallery name={b.name} photos={b.gallery} />}
    </section><aside><h2>Listing details</h2>
      {[[ "City or service area",b.neighborhood],["Address",b.address]].map(([label,value])=>value && <p key={label}><strong>{label}</strong><br/>{value}</p>)}
      <OperatingHours week={b.weeklyHours} legacy={b.hours} />
      {(phone || booking) && <section className="listing-contact">
        <h3>Contact info</h3>
        {phone && <a className="listing-phone" href={"tel:" + phone.replace(/[^+0-9]/g, "")}>
          <svg aria-hidden="true" focusable="false" width="18" height="18" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.8 19.8 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.8 19.8 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.69 2.79a2 2 0 0 1-.45 2.11L8.08 9.89a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.9.33 1.83.56 2.79.69A2 2 0 0 1 22 16.92Z"/>
          </svg>
          <span><span className="sr-only">Call </span>{phoneLabel}</span>
        </a>}
        {booking && <a className="text-link" href={booking}>Book an appointment ↗</a>}
      </section>}
      {otherSocial && <p><a className="text-link" href={otherSocial}>Other social profile ↗</a></p>}
      {destination && <section><h3>Get directions</h3><div className="profile-links">
        <a href={"https://www.google.com/maps/dir/?api=1&destination="+destination}>Google Maps ↗</a>
        <a href={"https://maps.apple.com/?daddr="+destination}>Apple Maps ↗</a>
      </div></section>}
      {socials.length>0 && <section><h3>Social profiles</h3><div className="profile-links">{socials.map(n=>
        <a key={n.key} href={n.href}><DirectorySocialIcon network={n.key}/>{n.label}</a>)}</div></section>}
      <ListingCorrection name={b.name} slug={b.slug} sample={demo} />
    </aside></div></main>;
}
