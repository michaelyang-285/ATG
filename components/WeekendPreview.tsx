import Link from "next/link";
import { weekend, weekendListings } from "@/lib/weekend";
import { dayLabel } from "@/lib/library-events";
import "./weekend.css";

export default async function WeekendPreview() {
  const {friday,sunday}=weekend();
  const {rows}=await weekendListings(friday,sunday);
  return <section className="atg-weekend weekend-preview">
    <p className="weekend-dates">{dayLabel(friday)} – {dayLabel(sunday)}</p>
    <h2><Link href="/this-weekend">This weekend in Gwinnett</Link></h2>
    <div className="weekend-picks">{rows.slice(0,3).map(e=><article key={e.href}><p>{e.sessions[0]}</p>
      <h3><Link href={e.href}>{e.title}</Link></h3><p>{[e.city || e.venue,e.price].filter(Boolean).join(" · ")}</p></article>)}</div>
    <Link className="text-link" href="/this-weekend">See the full weekend →</Link>
  </section>;
}