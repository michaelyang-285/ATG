import { eventDetailMetadata, libraryShareImage } from "@/lib/event-metadata";
import LibraryBreadcrumbs from "../../LibraryBreadcrumbs";
import { notFound, permanentRedirect } from "next/navigation";
import { libraryFeed,enrich,dayLabel,libraryPath,libraryEventPath } from "@/lib/library-events";
import { EventPage } from "../../../EventPage";
import styles from "../../../[slug]/event.module.css";

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
  return <EventPage title={e.title} schema={schema} description={e.description} organizer="Gwinnett County Public Library"
    navigation={<LibraryBreadcrumbs event={{ name: e.title, path: libraryEventPath(e) }} />}
    details={<>
      <div><dt>Date &amp; time</dt><dd>
        <time dateTime={e.start + offset}>{dayLabel(e.day)}, {e.day.slice(0,4)}</time>
        <span className={styles.hours}>{e.time}</span>
      </dd></div>
      {(e.branch || e.address) && <div><dt>Location</dt><dd>
        {e.branch && <strong>{e.branch}</strong>}
        {e.address && <>
          <span>{addressParts ? addressParts[1] : e.address}</span>
          {addressParts && <span>{addressParts[2]}, GA {addressParts[3]}</span>}
          <a className={styles.maps} href={"https://www.google.com/maps/search/?api=1&query=" + encodeURIComponent(e.address)} target="_blank" rel="noopener noreferrer">View on Google Maps <span aria-hidden="true">↗</span></a>
        </>}
      </dd></div>}
      {e.ages.length > 0 && <div><dt>Audience</dt><dd>{e.ages.join(", ")}</dd></div>}
    </>}
    actions={<a className="button button-orange" href={e.url} target="_blank" rel="noopener noreferrer">View official event details</a>}
  />;
}
