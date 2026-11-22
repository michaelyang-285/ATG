import { calendar, occurrencePath } from "./events";
import { localClock, shift, zone } from "./event-time";
import { dayLabel, enrich, libraryFeed, libraryPath } from "./library-events";
import { cities } from "./gwinnett";

export function weekend(now = Date.now()) {
  const today = localClock(now).slice(0, 10);
  const weekday = new Date(today).getUTCDay() || 7;
  const friday = shift(today, 5 - weekday);
  return { friday, sunday: shift(friday, 2) };
}

type Pick = { title: string; href: string; city: string; venue: string; price: string; free: boolean; family: boolean; sessions: string[]; start: string };
const clock = new Intl.DateTimeFormat("en-US", { timeZone: zone, hour: "numeric", minute: "2-digit" });

export async function weekendListings(friday: string, sunday: string) {
  const [events, library] = await Promise.allSettled([calendar(friday, sunday), libraryFeed()]);
  const rows = new Map<string, Pick>();
  for (const e of events.status === "fulfilled" ? events.value : []) {
    if (e.outsideGwinnett) continue;
    const end = localClock(e.endsAt || e.startsAt).slice(0, 10);
    const first = e.day < friday ? friday : e.day;
    const last = end > sunday ? sunday : end;
    const when = end === e.day ? dayLabel(first) + " · " + clock.format(new Date(e.startsAt))
      : dayLabel(first) + (last !== first ? " to " + dayLabel(last) : "") + " · See event for hours";
    const free = e.cost === "free" || (e.cost !== "paid" && (e.price === 0 || /^(free|\$0(?:\.00)?)$/i.test(e.priceLabel?.trim() || "")));
    const key = e.url && e.venue ? [e.url,e.venue,e.title].join("|") : e._id;
    const existing = rows.get(key);
    if (existing) {
      if (!existing.sessions.includes(when)) existing.sessions.push(when);
    } else rows.set(key, { title:e.title, href:occurrencePath(e), city:e.city || e.neighborhood || "", venue:e.venue || "",
      price:free ? "Free" : e.priceLabel || (typeof e.price === "number" ? "$" + e.price : e.cost === "paid" ? "Paid" : ""),
      free, family:(e.eventFormats || []).some(tag => /^(family(?:[ -]friendly)?|all[ -]ages|kids|children)$/i.test(tag)),
      sessions:[when], start:first + (e.day === first ? localClock(e.startsAt).slice(10) : "T00:00") });
  }
  const selected = library.status === "fulfilled" ? library.value.events.filter(e=>e.day>=friday && e.day<=sunday) : [];
  for (let i=0; i<selected.length; i+=10) {
    const batch = await Promise.all(selected.slice(i,i+10).map(enrich));
    for (const e of batch) {
      const city = cities.find(c => (e.address || e.branch).toLowerCase().includes(c.toLowerCase())) || "";
      rows.set("library-" + e.id, {title:e.title,href:libraryPath + "/" + e.id,city,venue:e.branch || "Gwinnett County Public Library",
        price:"",free:false,family:e.tags.some(t=>t==="Kids" || t==="All ages"),sessions:[dayLabel(e.day) + " · " + e.time],start:e.start});
    }
  }
  return {rows:Array.from(rows.values()).sort((a,b)=>a.start.localeCompare(b.start)||a.title.localeCompare(b.title)),
    incomplete:events.status==="rejected" || library.status==="rejected"};
}
