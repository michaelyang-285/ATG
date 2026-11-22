import { eventPageMetadata } from "@/lib/event-metadata";
import Link from "next/link";
import OngoingEvents from "@/components/OngoingEvents";
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

function DatedList({events,from}:{events:EventOccurrence[];from:string}) {
  const days=new Map<string,EventOccurrence[]>();
  for(const e of events){
    const day=e.day<from?from:e.day;
    const rows=days.get(day);
    if(rows) rows.push(e); else days.set(day,[e]);
  }
  return <>{Array.from(days,([day,rows])=><div className="agenda-day" key={day}>
    <h3><time dateTime={day}>{label(day,{weekday:"long",month:"long",day:"numeric"})}</time></h3>
    <ul>{rows.map(e=><li key={e._id+e.day}>
      <strong>{[cityOf(e),e.venue].filter(Boolean).join(" · ")}</strong>
      <Link href={occurrencePath(e)} prefetch={false}>{e.title}</Link>
      <span>{e.day<day?"Started "+label(e.day,{month:"short",day:"numeric"})+" · ":""}{clock.format(new Date(e.startsAt))}{e.endsAt && localClock(e.endsAt).slice(0,10)!==e.day && " through "+label(localClock(e.endsAt).slice(0,10),{month:"short",day:"numeric"})}{e.priceLabel && " · "+e.priceLabel}</span>
    </li>)}</ul></div>)}</>;
}

export default async function Page({searchParams:q}:{searchParams:{city?:string;date?:string;audience?:string}}){
  const today=localClock(Date.now()).slice(0,10);
  const date=q.date && validDay(q.date) && q.date>="1900-01-01" && q.date<="2100-12-31" ? q.date : "";
  const from=date||today, to=date||shift(today,365);
  const saturday=shift(today,6-new Date(today).getUTCDay()), nextEnd=shift(saturday,7);
  const all=await calendar(shift(from,-28),date?shift(date,28):to);
  const {daily,ongoing}=arrangeCalendar(all,from,to);
  const cities=Array.from(new Set(all.map(cityOf).concat(q.city||"").filter(Boolean))).sort();
  const match=(e:EventOccurrence)=>(!q.city||cityOf(e)===q.city)&&matchesAudience(e,q.audience||"");
  const dated=daily.filter(match);
  const runs=ongoing.map(run=>({...run,dates:run.dates.filter(match)})).filter(run=>run.dates.length);
  const periods=date?[{title:"Events on "+label(date,{month:"long",day:"numeric",year:"numeric"}),rows:dated}]:[
    {title:"This Week",rows:dated.filter(e=>e.day<=saturday)},
    {title:"Next Week",rows:dated.filter(e=>e.day>saturday&&e.day<=nextEnd)}];
  const months=new Map<string,EventOccurrence[]>();
  if(!date) for(const e of dated.filter(e=>e.day>nextEnd)){
    const key=e.day.slice(0,7),rows=months.get(key);
    if(rows) rows.push(e); else months.set(key,[e]);
  }
  return <main id="main" className="site-width page-content county-agenda">
    <header><h1>Gwinnett events</h1><p>Find something to do close to home.</p><Link className="button button-orange" href="/events/submit">Submit an event</Link></header>
    <EventFilters key={JSON.stringify([q.city,date,q.audience])} cities={cities} city={q.city||""} date={date} audience={q.audience||""}/>
    <nav aria-label="More calendars"><strong>More calendars</strong><Link href="/events/gwinnett-libraries">Library Events</Link><Link href="/events/gcps">GCPS School Calendar</Link><Link href="/events/pokemon">Pokémon Events</Link></nav>
    {periods.map(p=><section key={p.title}><h2>{p.title}</h2>{p.rows.length?<DatedList events={p.rows} from={from}/>:<p>No matching dated events.</p>}</section>)}
    <section id="ongoing-events"><h2>Ongoing Events</h2>{runs.length?<OngoingEvents runs={runs} view={date?"day":"period"}/>:<p>No matching ongoing events.</p>}</section>
    {!date&&<section><h2>Looking Ahead</h2>{months.size?Array.from(months,([month,events])=><details className="agenda-month" key={month}><summary>{label(month+"-01",{month:"long",year:"numeric"})} ({events.length})</summary><DatedList events={events} from={from}/></details>):<p>No later events listed.</p>}</section>}
    <p><a className="text-link" href={facebookGroup} target="_blank" rel="noopener noreferrer">Ask neighbors about upcoming events in the ATG Facebook group ↗</a></p>
  </main>;
}
