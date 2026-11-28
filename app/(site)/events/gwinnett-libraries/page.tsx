import LibraryFilters from "./LibraryFilters";
import Link from "next/link";
import { FaqAccordion } from "@/components/FaqAccordion";
import { libraryEventPath, libraryAgenda, libraryPath, libraryCalendar, jsonLd } from "@/lib/library-events";
import { eventPageMetadata } from "@/lib/event-metadata";
import "./library.css";

const title = "Gwinnett County Public Library Events";
export const metadata = eventPageMetadata(title,"Find upcoming Gwinnett library events by branch and audience, including toddler storytimes, kids’ programs and book clubs.",libraryPath);
const faq = [
  {question:"How do I find kids’ events at my library?",answer:"Pick a branch and select Kids under Audience. The listings update after each selection. Check each program’s age guidance for the best fit."},
  {question:"Which programs are right for my child’s age?",answer:"Read the age range and description together. A program in the library’s Ages 0–5 group may be designed specifically for toddlers or preschoolers."},
  {question:"How do I register for a library event?",answer:"Open the event, then follow the official library listing for registration requirements and availability."},
  {question:"Where can I check for schedule changes?",answer:"Check the official library listing before heading out. It has the latest schedule and registration status."}
];
const agendaDate = new Intl.DateTimeFormat("en-US", {
  weekday: "long", month: "long", day: "numeric", timeZone: "UTC",
});
const base="https://allthingsgwinnett.com";
export default async function Page({searchParams:q}:{searchParams:{branch?:string;audience?:string}}) {
  if (q.audience === "All ages") q = {...q, audience: ""};
  const data: Awaited<ReturnType<typeof libraryAgenda>> | null = await libraryAgenda().catch(()=>null);
  const branches=Array.from(new Set<string>((data?.rows||[]).map(e=>e.branch).filter(Boolean).concat(q.branch?[q.branch]:[]))).sort();
  const rows=(data?.rows||[]).filter(e=>(!q.branch||e.branch===q.branch)&&(!q.audience||e.tags.includes(q.audience)));
  const laterMonth = data && new Date(data.laterStart).toLocaleDateString("en-US",{month:"long",timeZone:"UTC"});
  const periods = data ? [
    {title:"This Week",events:rows.filter(e=>e.day<=data.thisEnd),empty:"No matching events this week."},
    {title:"Next Week",events:rows.filter(e=>e.day>data.thisEnd && e.day<=data.nextEnd),empty:"No matching events next week."},
    {title:"Later in "+laterMonth,events:rows.filter(e=>e.day>=data.laterStart),empty:"No matching events later in "+laterMonth+"."}
  ] : [];
  const schema={"@context":"https://schema.org","@graph":[{"@type":"CollectionPage",name:title,url:base+libraryPath,mainEntity:{"@type":"ItemList",itemListElement:rows.map((e,i)=>({"@type":"ListItem",position:i+1,url:base+libraryEventPath(e),name:e.title}))}},{"@type":"BreadcrumbList",itemListElement:[["Events","/events"],[title,libraryPath]].map(([name,path],i)=>({"@type":"ListItem",position:i+1,name,item:base+path}))},{"@type":"FAQPage",mainEntity:faq.map(f=>({"@type":"Question",name:f.question,acceptedAnswer:{"@type":"Answer",text:f.answer}}))}]};
  return <main id="main" className="site-width page-content library-hub">
    <script type="application/ld+json" dangerouslySetInnerHTML={{__html:jsonLd(schema)}}/>
    <Link href="/events">‹ Events calendar</Link><h1>{title}</h1>
    <p>Find storytimes, workshops and book clubs at your Gwinnett library branch. All times are Eastern.</p>
    <LibraryFilters key={JSON.stringify([q.branch,q.audience])} path={libraryPath} branches={branches} branch={q.branch||""} audience={q.audience||""}/>
    <p><strong>Before you go:</strong> Event dates and times can change, and our listings may lag behind the library’s updates. Check the <a href={libraryCalendar} target="_blank" rel="noopener noreferrer">official Gwinnett County Public Library calendar</a> for the latest schedule.</p>
    {data?<>
    {data.rows.some(e=>!e.branch||!e.ages.length)&&<p>Some listings have incomplete branch or audience information. Open the official listing to confirm details.</p>}
    {periods.map(({title,events,empty},index)=>{
      const days = new Map<string,typeof events>();
      for (const event of events) {
        const group = days.get(event.day);
        if (group) group.push(event); else days.set(event.day,[event]);
      }
      const list = Array.from(days,([day,sessions])=><div key={day} className="library-day">
        <h3><time dateTime={day}>{agendaDate.format(new Date(day + "T12:00:00Z"))}</time></h3>
        <ul>{sessions.map(e=><li key={e.id}><strong className="library-location">{e.branch||"Check library for location"}</strong>
          <Link href={libraryEventPath(e)}>{e.title}</Link>
          <time className="library-session-time" dateTime={e.start}>{e.time}</time>{e.ages.length>0&&<small>{e.ages.join(" · ")}</small>}</li>)}</ul>
      </div>);
      return <section key={title} className="library-period"><h2>{title}</h2>
        {!events.length?<p>{empty}</p>:index===2?<details><summary>Show {events.length} more {events.length===1?"event":"events"}</summary>{list}</details>:list}
      </section>;
    })}
    {data.updated&&<small>Library feed updated {new Date(data.updated).toLocaleString("en-US",{timeZone:"America/New_York"})} Eastern.</small>}</>:<p>The library feed is temporarily unavailable.</p>}
    <p><a href={libraryCalendar} target="_blank" rel="noopener noreferrer">Open the official library calendar ↗</a></p>
    <h2>Frequently asked questions</h2><FaqAccordion items={faq}/>
  </main>;
}
