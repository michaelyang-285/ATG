import { eventDetailMetadata, libraryShareImage } from "@/lib/event-metadata";
import LibraryBreadcrumbs from "../../LibraryBreadcrumbs";
import { notFound, permanentRedirect } from "next/navigation";
import { libraryFeed,enrich,dayLabel,libraryPath,libraryEventPath,jsonLd } from "@/lib/library-events";
import styles from "./event.module.css";

type Params = { id: string; event: string };

async function find(params: Params){
  const id = params.event.match(/-(\d+)$/)?.[1] || "";
  if(!/^\d+$/.test(id)) notFound();
  const event=(await libraryFeed()).events.find(e=>e.id===id);
  if(!event) notFound();
  const detail = await enrich(event);
  if (detail.branch && libraryEventPath(detail) !== libraryPath+"/"+params.id+"/"+params.event) permanentRedirect(libraryEventPath(detail));
  return detail;
}
export async function generateMetadata({params}:{params:Params}){
  const e=await find(params);
  return eventDetailMetadata({
    name: e.title, place: e.branch || "Gwinnett County Public Library", day: e.day,
    image: libraryShareImage.url, imageAlt: libraryShareImage.alt,
    time: e.time, summary: e.description, path: libraryEventPath(e),
  });
}
export default async function Page({params}:{params:Params}){
  const e=await find(params);
  const offset=new Intl.DateTimeFormat("en-US",{timeZone:"America/New_York",timeZoneName:"shortOffset"}).formatToParts(new Date(e.day+"T16:00:00Z")).find(p=>p.type==="timeZoneName")?.value==="GMT-4"?"-04:00":"-05:00";
  const addressParts = e.address.match(/^(.+),\s*([^,]+),\s*(?:GA|Georgia),?\s+(\d{5}(?:-\d{4})?)$/i);
  const address = addressParts ? {
    "@type": "PostalAddress", streetAddress: addressParts[1].trim(),
    addressLocality: addressParts[2].trim(), addressRegion: "GA",
    postalCode: addressParts[3], addressCountry: "US",
  } : e.address || undefined;
  const schema={"@context":"https://schema.org","@type":"Event",name:e.title,url:"https://allthingsgwinnett.com"+libraryEventPath(e),sameAs:e.url,startDate:e.start+offset,description:e.description,organizer:{"@type":"Organization",name:"Gwinnett County Public Library",url:"https://www.gwinnettpl.org/"},location:e.branch?{"@type":"Place",name:e.branch,address}:undefined,audience:e.ages.map(a=>({"@type":"Audience",audienceType:a}))};
  return <main id="main" className={styles.page}>
    <script type="application/ld+json" dangerouslySetInnerHTML={{__html:jsonLd(schema)}}/>
    <LibraryBreadcrumbs event={{ name: e.title, path: libraryEventPath(e) }} />
    <header className={styles.heading}>
      <p>{e.branch || "Gwinnett County Public Library"}</p>
      <h1>{e.title}</h1>
    </header>
    <div className={styles.layout}>
      <section className={styles.schedule} aria-label="Event schedule and location">
        <time dateTime={e.start+offset}><strong>{dayLabel(e.day)}, {e.day.slice(0,4)}</strong><span>{e.time}</span></time>
        {e.branch && <strong>{e.branch}</strong>}
        {e.address && <a href={"https://www.google.com/maps/search/?api=1&query="+encodeURIComponent(e.address)}>{e.address} ↗</a>}
      </section>
      <section className={styles.about}>
        <h2>About this event</h2>
        {e.description && <p>{e.description}</p>}
        {e.ages.length > 0 && <p><strong>Audience</strong> · {e.ages.join(", ")}</p>}
        <a className={styles.action} href={e.url}>View official event details ↗</a>
      </section>
    </div>
  </main>;
}
