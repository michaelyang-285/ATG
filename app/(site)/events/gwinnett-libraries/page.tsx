import Link from "next/link";
import { FaqAccordion } from "@/components/FaqAccordion";
import { libraryWeek, libraryPath, libraryCalendar, dayLabel, jsonLd } from "@/lib/library-events";
import { eventPageMetadata } from "@/lib/event-metadata";
import "./library.css";

const title = "Gwinnett County Public Library Events";
export const metadata = eventPageMetadata(title,"Find upcoming Gwinnett library events by branch and audience, including toddler storytimes, kids’ programs and book clubs.",libraryPath);
const faq = [
  {question:"How do I find kids’ events at my library?",answer:"Pick a branch, select Kids under Audience, and apply the filters. Check each program’s age guidance for the best fit."},
  {question:"Which programs are right for my child’s age?",answer:"Read the age range and description together. A program in the library’s Ages 0–5 group may be designed specifically for toddlers or preschoolers."},
  {question:"How do I register for a library event?",answer:"Open the event, then follow the official library listing for registration requirements and availability."},
  {question:"Where can I check for schedule changes?",answer:"Check the official library listing before heading out. It has the latest schedule and registration status."}
];
const base="https://allthingsgwinnett.com";
export default async function Page({searchParams:q}:{searchParams:{branch?:string;audience?:string;week?:string}}) {
  const week=Math.min(52,Math.max(0,parseInt(q.week||"0",10)||0));
  const data: Awaited<ReturnType<typeof libraryWeek>> | null = await libraryWeek(week).catch(()=>null);
  const branches=Array.from(new Set<string>((data?.rows||[]).map(e=>e.branch).filter(Boolean).concat(q.branch?[q.branch]:[]))).sort();
  const rows=(data?.rows||[]).filter(e=>(!q.branch||e.branch===q.branch)&&(!q.audience||e.tags.includes(q.audience)));
  const groups=new Map<string,typeof rows>();
  for(const row of rows){
    const key=JSON.stringify([row.title,row.branch||row.id,row.description,row.ages]);
    const existing=groups.get(key);
    if(existing) existing.push(row); else groups.set(key,[row]);
  }
  const weekHref=(n:number)=>libraryPath+"?"+new URLSearchParams({week:String(n),...(q.branch?{branch:q.branch}:{}),...(q.audience?{audience:q.audience}:{})});
  const schema={"@context":"https://schema.org","@graph":[{"@type":"CollectionPage",name:title,url:base+libraryPath,mainEntity:{"@type":"ItemList",itemListElement:rows.map((e,i)=>({"@type":"ListItem",position:i+1,url:base+libraryPath+"/"+e.id,name:e.title}))}},{"@type":"BreadcrumbList",itemListElement:[["Events","/events"],[title,libraryPath]].map(([name,path],i)=>({"@type":"ListItem",position:i+1,name,item:base+path}))},{"@type":"FAQPage",mainEntity:faq.map(f=>({"@type":"Question",name:f.question,acceptedAnswer:{"@type":"Answer",text:f.answer}}))}]};
  return <main id="main" className="site-width page-content library-hub">
    <script type="application/ld+json" dangerouslySetInnerHTML={{__html:jsonLd(schema)}}/>
    <Link href="/events">‹ Events calendar</Link><h1>{title}</h1>
    <p>Find storytimes, workshops and book clubs at your Gwinnett library branch. All times are Eastern.</p>
    <form action={libraryPath}><input type="hidden" name="week" value={week}/>
      <label>Branch<select name="branch" defaultValue={q.branch||""}><option value="">All branches</option>{branches.map(b=><option key={b}>{b}</option>)}</select></label>
      <label>Audience<select name="audience" defaultValue={q.audience||""}><option value="">Everyone</option>{["Kids","Teens","Adults","All ages"].map(a=><option key={a}>{a}</option>)}</select></label>
      <button type="submit">Apply filters</button>{(q.branch||q.audience)&&<Link href={weekHref(week).split("?")[0]+"?week="+week}>Clear filters</Link>}
    </form>
    {data?<><nav aria-label="Library calendar week">{week>0&&<Link href={weekHref(week-1)}>‹ Previous week</Link>}<strong>{dayLabel(data.from)} – {dayLabel(data.to)}</strong>{data.hasNext&&<Link href={weekHref(week+1)}>Next week ›</Link>}</nav>
    {data.rows.some(e=>!e.branch||!e.ages.length)&&<p>Some listings have incomplete branch or audience information. Open the official listing to confirm details.</p>}
    {Array.from(groups.values()).map(([e,...more],i,all)=><section key={e.id}>{(!i||all[i-1][0].day!==e.day)&&<h2>{dayLabel(e.day)}</h2>}<article>
      <div>{e.time} · {e.branch||"See library for location"}</div><h3><Link href={libraryPath+"/"+e.id}>{e.title}</Link></h3>
      <p>{[...e.tags,...e.ages].join(" · ")}</p><p>{e.description}</p>
      {more.length>0&&<details><summary>View more dates ({more.length})</summary>{more.map(s=><p key={s.id}><Link href={libraryPath+"/"+s.id}>{dayLabel(s.day)} · {s.time}</Link></p>)}</details>}
    </article></section>)}{!rows.length&&<p>No matching listings for this week.</p>}
    {data.updated&&<small>Library feed updated {new Date(data.updated).toLocaleString("en-US",{timeZone:"America/New_York"})} Eastern.</small>}</>:<p>The library feed is temporarily unavailable.</p>}
    <p><a href={libraryCalendar} target="_blank" rel="noopener noreferrer">Open the official library calendar ↗</a></p>
    <h2>Frequently asked questions</h2><FaqAccordion items={faq}/>
  </main>;
}
