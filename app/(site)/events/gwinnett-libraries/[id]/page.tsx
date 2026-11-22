import Link from "next/link";
import { notFound } from "next/navigation";
import { libraryFeed,enrich,dayLabel,libraryPath,jsonLd } from "@/lib/library-events";
import "../library.css";

async function find(id:string){
  if(!/^\d+$/.test(id)) notFound();
  const event=(await libraryFeed()).events.find(e=>e.id===id);
  if(!event) notFound();
  return enrich(event);
}
export async function generateMetadata({params}:{params:{id:string}}){
  const e=await find(params.id);
  return {title:[e.title,e.branch,dayLabel(e.day)].filter(Boolean).join(" | "),description:e.description,alternates:{canonical:libraryPath+"/"+e.id}};
}
export default async function Page({params}:{params:{id:string}}){
  const e=await find(params.id);
  const offset=new Intl.DateTimeFormat("en-US",{timeZone:"America/New_York",timeZoneName:"shortOffset"}).formatToParts(new Date(e.day+"T16:00:00Z")).find(p=>p.type==="timeZoneName")?.value==="GMT-4"?"-04:00":"-05:00";
  const schema={"@context":"https://schema.org","@type":"Event",name:e.title,url:"https://allthingsgwinnett.com"+libraryPath+"/"+e.id,sameAs:e.url,startDate:e.start+offset,description:e.description,organizer:{"@type":"Organization",name:"Gwinnett County Public Library",url:"https://www.gwinnettpl.org/"},location:e.branch?{"@type":"Place",name:e.branch,address:e.address||undefined}:undefined,audience:e.ages.map(a=>({"@type":"Audience",audienceType:a}))};
  return <main id="main" className="site-width page-content library-hub"><script type="application/ld+json" dangerouslySetInnerHTML={{__html:jsonLd(schema)}}/>
    <Link href={libraryPath}>‹ Library events</Link><h1>{e.title}</h1><p><time dateTime={e.start+offset}>{dayLabel(e.day)}, {e.day.slice(0,4)} · {e.time} Eastern</time></p>
    <p><strong>{e.branch}</strong>{e.address&&<> · {e.address}</>}</p><p>{[...e.tags,...e.ages].join(" · ")}</p><p>{e.description}</p>
    <a href={e.url} target="_blank" rel="noopener noreferrer">Official event details and registration ↗</a></main>;
}
