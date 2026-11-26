import Link from "next/link";
import { calendar, occurrencePath } from "@/lib/events";
import { localClock, shift, zone } from "@/lib/event-time";
import { calendarNotices } from "@/lib/gcps-calendar";
import { libraryFeed, libraryPath } from "@/lib/library-events";
import { DirectionIcon } from "./DirectionIcon";

type AgendaItem = { day: string; title: string; detail: string; href: string };
const clock = new Intl.DateTimeFormat("en-US", { timeZone: zone, hour: "numeric", minute: "2-digit" });
const month = new Intl.DateTimeFormat("en-US", { timeZone: "UTC", month: "short" });
const date = new Intl.DateTimeFormat("en-US", { timeZone: "UTC", month: "short", day: "numeric" });

async function localDates(local: string): Promise<AgendaItem[]> {
  const today = local.slice(0, 10);
  const school = calendarNotices(today, shift(today, 90)).filter(e => e.school).slice(0, 2).map(e => ({
    day: e.day, title: e.title, href: "/events/gcps",
    detail: e.end === e.day ? e.kind : e.kind + " · Through " + date.format(new Date(e.end)),
  }));
  const library = await libraryFeed().catch(() => null);
  const programs = (library?.events || []).filter(e => e.start >= local).slice(0, 2).map(e => ({
    day: e.day, title: e.title, detail: "Gwinnett County Public Library · " + e.time, href: libraryPath + "/" + e.id,
  }));
  return [...school, ...programs].sort((a, b) => a.day.localeCompare(b.day));
}

async function outingDates(now: number, today: string): Promise<AgendaItem[]> {
  const occurrences = await calendar(today, shift(today, 13));
  const seen = new Set<string>();
  return occurrences.filter(e => {
    const key = [e.title, e.venue || e.street, e.city || e.neighborhood].join("|").toLowerCase();
    if (e.outsideGwinnett || Date.parse(e.startsAt) < now || seen.has(key)) return false;
    seen.add(key);
    return true;
  }).slice(0, 4).map(e => ({
    day: e.day, title: e.title, href: occurrencePath(e),
    detail: [clock.format(new Date(e.startsAt)), e.venue, e.city || e.neighborhood].filter(Boolean).join(" · "),
  }));
}

export default async function SectionAgenda({ section }: { section: "things-to-do" | "local-life" }) {
  const now = Date.now(), local = localClock(now);
  const outings = section === "things-to-do";
  const picks = outings ? await outingDates(now, local.slice(0, 10)) : await localDates(local);
  return <section><h2>{outings ? "Coming up in Gwinnett" : "School & library dates"}</h2>
    {picks.length ? <ul className="sf-agenda">{picks.map(e => <li key={e.href + e.day + e.title}>
      <time dateTime={e.day}><small>{month.format(new Date(e.day))}</small><strong>{Number(e.day.slice(-2))}</strong></time>
      <div><h3><Link href={e.href}>{e.title}</Link></h3><p>{e.detail}</p></div>
    </li>)}</ul> : <p className="sf-note">No upcoming dates are listed for this period.</p>}
    <Link className="sf-action" href="/events">Full events calendar <DirectionIcon /></Link>
  </section>;
}
