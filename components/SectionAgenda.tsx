import Link from "next/link";
import { calendar, occurrencePath } from "@/lib/events";
import { localClock, shift, zone } from "@/lib/event-time";
import { DirectionIcon } from "./DirectionIcon";

const clock = new Intl.DateTimeFormat("en-US", { timeZone: zone, hour: "numeric", minute: "2-digit" });
const month = new Intl.DateTimeFormat("en-US", { timeZone: zone, month: "short" });

export default async function SectionAgenda({ section }: { section: "things-to-do" | "local-life" }) {
  const now = Date.now(), today = localClock(now).slice(0, 10);
  const outings = section === "things-to-do";
  const occurrences = await calendar(today, shift(today, outings ? 13 : 45));
  const seen = new Set<string>();
  const picks = occurrences.filter(e => {
    const deadline = outings ? e.startsAt : e.endsAt || e.startsAt;
    const key = outings ? [e.title, e.venue || e.street, e.city || e.neighborhood].join("|").toLowerCase() : e._id;
    if (e.outsideGwinnett || Date.parse(deadline) < now || seen.has(key)) return false;
    seen.add(key);
    return true;
  }).slice(0, 4);
  return <section><h2>{outings ? "Coming up in Gwinnett" : "Community calendar"}</h2>
    {picks.length ? <ul className="sf-agenda">{picks.map(e => <li key={occurrencePath(e)}>
      <time dateTime={e.startsAt}><small>{month.format(new Date(e.startsAt))}</small><strong>{Number(e.day.slice(-2))}</strong></time>
      <div><h3><Link href={occurrencePath(e)}>{e.title}</Link></h3>
        <p>{[e.day < today ? "Ongoing" : clock.format(new Date(e.startsAt)), e.venue, e.city || e.neighborhood].filter(Boolean).join(" · ")}</p></div>
    </li>)}</ul> : <p className="sf-note">No upcoming events are listed for this period.</p>}
    <Link className="sf-action" href="/events">Full events calendar <DirectionIcon /></Link>
  </section>;
}
