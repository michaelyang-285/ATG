import { eventPageMetadata } from "@/lib/event-metadata";
import Link from "next/link";
import { arrangeCalendar } from "@/lib/calendar-runs";
import { calendar, occurrencePath, type EventOccurrence } from "@/lib/events";
import { localClock, shift, validDay, zone } from "@/lib/event-time";
import { facebookGroup } from "@/lib/gwinnett";
import "@/components/community.css";
import EventFilters from "./EventFilters";
import "./agenda.css";
export const metadata = eventPageMetadata(
  "Gwinnett County Events Calendar",
  "Find upcoming and ongoing Gwinnett County events by city, date and audience, or submit a community event.",
  "/events",
);
function label(day: string, options: Intl.DateTimeFormatOptions) {
  return new Intl.DateTimeFormat("en-US", {
    ...options,
    timeZone: "UTC",
  }).format(new Date(day));
}
const clock = new Intl.DateTimeFormat("en-US",{timeZone:zone,hour:"numeric",minute:"2-digit"});
const cityOf = (e:EventOccurrence)=>(e.city || e.neighborhood || "").trim();

function matchesAudience(e:EventOccurrence, audience:string) {
  if (!audience) return true;
  const description = [e.title,e.summary,...(e.eventFormats||[])].join(" ");
  const all = /\ball[- ]ages\b|\ball ages welcome\b/i.test(description);
  if (audience==="Kids") return all || /\b(kids?|children|families|family-friendly|preschoolers?|toddlers?)\b/i.test(description);
  if (audience==="Teens") return all || /\b(teens?|teenagers?|high school students)\b/i.test(description);
  if (audience==="Adults") return all || /\b(adults?|18\+|21\+)/i.test(description);
  return audience==="All ages" && all;
}

type AgendaEvent = EventOccurrence & { sessions?: EventOccurrence[]; multiple?: boolean };
function DatedList({events,from}:{events:AgendaEvent[];from:string}) {
  const days=new Map<string,AgendaEvent[]>();
  for(const e of events){
    const day=e.day<from?from:e.day;
    const rows=days.get(day);
    if(rows) rows.push(e); else days.set(day,[e]);
  }
  return <>{Array.from(days,([day,rows])=><div className="agenda-day" key={day}>
    <h3><time dateTime={day}>{label(day,{weekday:"long",month:"long",day:"numeric"})}</time></h3>
    <ul>{rows.map(e=><li key={e._id+e.day}>
      <strong>{[cityOf(e),e.venue].filter(Boolean).join(" · ")}</strong>
      <div><Link href={occurrencePath(e)} prefetch={false}>{e.title}</Link>
        {e.multiple ? <small className="agenda-flair">Multiple dates</small> : e.endsAt && localClock(e.endsAt).slice(0,10)>e.day ? <small className="agenda-flair">Multi-day</small> : null}</div>
      <span>{e.day<day?"Started "+label(e.day,{month:"short",day:"numeric"})+" · ":""}{clock.format(new Date(e.startsAt))}{e.endsAt && localClock(e.endsAt).slice(0,10)!==e.day && " through "+label(localClock(e.endsAt).slice(0,10),{month:"short",day:"numeric"})}{e.priceLabel && " · "+e.priceLabel}</span>
      {e.sessions && e.sessions.length>1 && <details className="agenda-sessions"><summary>View dates ({e.sessions.length})</summary>
        {e.sessions.map(session=><p key={session._id+session.startsAt}><Link href={occurrencePath(session)} prefetch={false}>{label(session.day,{weekday:"short",month:"short",day:"numeric"})} · {clock.format(new Date(session.startsAt))}</Link></p>)}
      </details>}
    </li>)}</ul></div>)}</>;
}

export default async function Page({searchParams:q}:{searchParams:{city?:string;date?:string;audience?:string}}){
  if (q.audience === "All ages") q = {...q, audience: ""};
  const today=localClock(Date.now()).slice(0,10);
  const date=q.date && validDay(q.date) && q.date>="1900-01-01" && q.date<="2100-12-31" ? q.date : "";
  const from=date||today, to=date||shift(today,365);
  const saturday=shift(today,6-new Date(today).getUTCDay()), nextEnd=shift(saturday,7);
  const all=await calendar(shift(from,-28),date?shift(date,28):to);
  const {daily,ongoing}=arrangeCalendar(all,from,to);
  const cities=Array.from(new Set(all.map(cityOf).concat(q.city||"").filter(Boolean))).sort();
  const match=(e:EventOccurrence)=>(!q.city||cityOf(e)===q.city)&&matchesAudience(e,q.audience||"");
  
  const dated: AgendaEvent[] = daily.filter(match);
  for (const run of ongoing) {
    const sessions = run.dates.filter(match);
    if (sessions.length) dated.push({...sessions[0],sessions,multiple:sessions.length>1 || !sessions[0].endsAt || localClock(sessions[0].endsAt).slice(0,10)===sessions[0].day});
  }
  dated.sort((a,b)=>Date.parse(a.startsAt)-Date.parse(b.startsAt));
  const periods=date?[{title:"Events on "+label(date,{month:"long",day:"numeric",year:"numeric"}),rows:dated}]:[
    {title:"This Week",rows:dated.filter(e=>e.day<=saturday)},
    {title:"Next Week",rows:dated.filter(e=>e.day>saturday&&e.day<=nextEnd)}];
  const months=new Map<string,AgendaEvent[]>();
  if(!date) for(const e of dated.filter(e=>e.day>nextEnd)){
    const key=e.day.slice(0,7),rows=months.get(key);
    if(rows) rows.push(e); else months.set(key,[e]);
  }
  return <main id="main" className="site-width page-content county-agenda">
    <header><h1>Gwinnett events</h1><p>Find something to do close to home.</p><Link className="button button-orange" href="/events/submit">Submit an event</Link></header>
    <EventFilters key={JSON.stringify([q.city,date,q.audience])} cities={cities} city={q.city||""} date={date} audience={q.audience||""}/>
    <nav aria-label="More calendars"><strong>More calendars</strong><Link href="/events/gwinnett-libraries">Library Events</Link><Link href="/events/gcps">GCPS School Calendar</Link><Link href="/events/pokemon">Pokémon Events</Link></nav>
    {periods.map(p=><section key={p.title}><h2>{p.title}</h2>{p.rows.length?<DatedList events={p.rows} from={from}/>:<p>No matching events.</p>}</section>)}
    {!date&&<section><h2>Looking Ahead</h2>{months.size?Array.from(months,([month,events])=><details className="agenda-month" key={month}><summary>{label(month+"-01",{month:"long",year:"numeric"})} ({events.length})</summary><DatedList events={events} from={from}/></details>):<p>No later events listed.</p>}</section>}
    <p><a className="text-link" href={facebookGroup} target="_blank" rel="noopener noreferrer">Ask neighbors about upcoming events in the ATG Facebook group ↗</a></p>
    <nav aria-label="Explore more event calendars" className="agenda-calendar-ctas">
      {[
        {href:"/events/pokemon",title:"Pokémon events",description:"Trade nights, tournaments and local league play.",icon:"cards"},
        {href:"/events/gcps",title:"GCPS school calendar",description:"School breaks, digital learning days and early dismissals.",icon:"calendar"},
        {href:"/events/gwinnett-libraries",title:"Gwinnett library events",description:"Find storytimes and workshops at your branch.",icon:"books"},
      ].map(({href,title,description,icon})=><Link key={href} href={href} className={"calendar-destination "+icon}>
        <span className="destination-icon" aria-hidden="true"><svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
          {icon==="cards"?<><path d="m7 4-4 1 3 15 3-1"/><rect x="9" y="3" width="12" height="17" rx="2"/><path d="m15 8 2.5 3.5-2.5 3.5-2.5-3.5z"/></>:icon==="calendar"?<><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M7 3v4m10-4v4M3 10h18m-13 5 2 2 5-5"/></>:<><path d="M12 6C9 4 5 4 2 5v14c4-1 7-1 10 1 3-2 6-2 10-1V5c-3-1-7-1-10 1Zm0 0v14"/></>}
        </svg></span>
        <span className="destination-copy"><strong>{title}</strong><span>{description}</span></span>
        <span className="destination-arrow" aria-hidden="true">→</span>
      </Link>)}
    </nav>
  </main>;
}
