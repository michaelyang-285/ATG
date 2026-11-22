import Link from "next/link";
import { Suspense } from "react";
import { weekend, weekendListings } from "@/lib/weekend";
import { forecast } from "@/lib/weekend-weather";
import { shift } from "@/lib/event-time";
import { dayLabel } from "@/lib/library-events";
import { cities } from "@/lib/gwinnett";
import { eventPageMetadata } from "@/lib/event-metadata";
import "@/components/weekend.css";

export const metadata=eventPageMetadata("This Weekend in Gwinnett","Plan Friday through Sunday with local events, free and family-friendly picks, and the weekend forecast.","/this-weekend");

async function Weather({city,friday}:{city:string;friday:string}) {
  const {location,periods,link}=await forecast(city);
  return <aside className="weekend-weather"><h2>Weekend weather in {location}</h2>
    <div className="weekend-picks">{[0,1,2].map(i=>{
      const date=shift(friday,i), day=periods.find(p=>p.day===date && p.isDaytime), night=periods.find(p=>p.day===date && !p.isDaytime);
      return <div key={date}><strong>{dayLabel(date)}</strong><p>{[day && "High "+day.temperature+"°F", night && "Low "+night.temperature+"°F"].filter(Boolean).join(" · ") || "Forecast unavailable"}</p>
        <p>{day?.shortForecast || night?.shortForecast}{day?.probabilityOfPrecipitation?.value!=null && " · "+day.probabilityOfPrecipitation.value+"% rain chance"}</p></div>;
    })}</div><a className="text-link" href={link} target="_blank" rel="noopener noreferrer">National Weather Service forecast ↗</a></aside>;
}

export default async function WeekendPage({searchParams}:{searchParams:{city?:string;free?:string;family?:string}}) {
  const {friday,sunday}=weekend();
  const city=cities.includes(searchParams.city || "") ? searchParams.city! : "";
  const {rows,incomplete}=await weekendListings(friday,sunday);
  const visible=rows.filter(e=>(!city || city===e.city) && (searchParams.free!=="1" || e.free) && (searchParams.family!=="1" || e.family));
  return <main id="main" className="site-width page-content atg-weekend">
    <header><p className="weekend-dates">{dayLabel(friday)} – {dayLabel(sunday)}</p><h1>This weekend in Gwinnett</h1></header>
    <form action="/this-weekend" className="weekend-filters"><label>City <select name="city" defaultValue={city}><option value="">All of Gwinnett</option>{cities.map(c=><option key={c}>{c}</option>)}</select></label>
      <label><input type="checkbox" name="free" value="1" defaultChecked={searchParams.free==="1"}/> Free</label>
      <label><input type="checkbox" name="family" value="1" defaultChecked={searchParams.family==="1"}/> Family-friendly</label>
      <button className="button button-ink">Apply filters</button>{(city || searchParams.free || searchParams.family) && <Link href="/this-weekend">Clear filters</Link>}</form>
    <Suspense fallback={<p>Loading the weekend forecast…</p>}><Weather city={city} friday={friday}/></Suspense>
    <section><h2>What’s on this weekend</h2>{incomplete && <p>Some calendar listings are temporarily unavailable.</p>}
    {visible.map(e=><article key={e.href} className="weekend-listing"><div><p className="weekend-dates">{e.sessions.join(" / ")}</p><h3><Link href={e.href}>{e.title}</Link></h3>
      <p>{[e.venue,e.city,e.price].filter(Boolean).join(" · ")}</p></div></article>)}
    {!visible.length && <p>No matching events for this weekend. <Link href="/events">Browse the events calendar</Link>.</p>}</section>
  </main>;
}