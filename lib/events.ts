import { publication, type LocalEvent } from "./publication";
import { localClock, easternInstant, shift } from "./event-time";
export type EventRecord = LocalEvent & {
  eventFormats?: string[];
  gameTopics?: string[];
  cancelled?: boolean;
  outsideGwinnett?: boolean;
  street?: string;
  city?: string;
  postalCode?: string;
  ticketUrl?: string;
  cost?: string;
  price?: number;
  organizer?: string;
  additionalSessions?: {startsAt:string; endsAt?:string}[];
  pricingDetails?: string;
  registrationRequired?: boolean;
  weeklyUntil?: string;
  image?: any;
};
export const eventFields =
  '_id,title,"slug":coalesce(slug.current,_id),startsAt,endsAt,venue,neighborhood,summary,priceLabel,url,ticketUrl,street,city,postalCode,cost,price,organizer,weeklyUntil,additionalSessions,pricingDetails,registrationRequired,image,eventFormats,gameTopics,cancelled,outsideGwinnett';
export function eventDates(e: EventRecord) {
  if (!e.startsAt || !Number.isFinite(Date.parse(e.startsAt))) return [];
  const start = localClock(e.startsAt),
    day = start.slice(0, 10);
  const dates = [{ ...e, day }];
  for (const session of e.additionalSessions || []) {
    dates.push({...e, startsAt:session.startsAt, endsAt:session.endsAt, day:localClock(session.startsAt).slice(0,10)});
  }
  const duration = e.endsAt ? Date.parse(e.endsAt) - Date.parse(e.startsAt) : 0;
  for (let i = 1; i <= 53 && e.weeklyUntil; i++) {
    const next = shift(day, i * 7);
    if (next > e.weeklyUntil) break;
    const instant = easternInstant(next + start.slice(10));
    if (!instant) continue;
    dates.push({
      ...e,
      day: next,
      startsAt: instant,
      endsAt: duration
        ? new Date(Date.parse(instant) + duration).toISOString()
        : undefined,
    });
  }
  return dates;
}
export function occurrencePath(e: { slug: string; day: string }) {
  return "/events/" + encodeURIComponent(e.slug) + "?date=" + e.day;
}
export async function calendar(from: string, to: string) {
  const events = await publication.fetch<EventRecord[]>(
    '*[_type=="event" && cancelled != true && defined(startsAt) && startsAt < $end && (coalesce(endsAt,startsAt) >= $start || weeklyUntil >= $first || count(additionalSessions[coalesce(endsAt,startsAt) >= $start]) > 0)]{' +
      eventFields +
      "}",
    {
      start: shift(from, -1) + "T00:00:00Z",
      end: shift(to, 2) + "T00:00:00Z",
      first: from,
    },
    { next: { revalidate: 60 } },
  );
  return orderedOccurrences(events, e =>
    e.day <= to && localClock(e.endsAt || e.startsAt).slice(0, 10) >= from
  );
}

export async function upcomingGameEvents(topics: string[], now = Date.now()) {
  if (!topics.length) return [];
  const today = localClock(now).slice(0, 10);
  const events = await publication.fetch<EventRecord[]>(
    '*[_type=="event" && defined(startsAt) && cancelled != true && outsideGwinnett != true && count(gameTopics[@ in $topics]) > 0 && (coalesce(endsAt,startsAt) >= $since || weeklyUntil >= $today || count(additionalSessions[coalesce(endsAt,startsAt) >= $since]) > 0)]{' + eventFields + '}',
    { topics, today, since: shift(today, -1) + "T00:00:00Z" },
    { next: { revalidate: 60 } },
  );
  return orderedOccurrences(events, e => Date.parse(e.endsAt || e.startsAt) >= now);
}

export type EventOccurrence = ReturnType<typeof eventDates>[number];

function orderedOccurrences(events: EventRecord[], include: (e: EventOccurrence) => boolean) {
  const seen = new Set<string>();
  return events.flatMap(eventDates).filter(include)
    .sort(
      (a, b) =>
        Date.parse(a.startsAt) - Date.parse(b.startsAt) ||
        a._id.localeCompare(b._id),
    )
    .filter((e) => {
      if (!e.title || !(e.venue || e.street || e.url)) return true;
      const key = JSON.stringify(
        [
          e.title,
          e.venue,
          e.street,
          e.city || e.neighborhood,
          e.organizer,
          e.url,
        ]
          .map((v) => v?.trim().replace(/\s+/g, " ").toLowerCase() || "")
          .concat(
            String(Date.parse(e.startsAt)),
            e.endsAt ? String(Date.parse(e.endsAt)) : "",
          ),
      );
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
}

export async function upcomingListingEvents(id:string) {
  const events=await publication.fetch<EventRecord[]>('*[_type=="event" && directoryEntry==$id && cancelled!=true]{'+eventFields+'}',{id},{next:{revalidate:60}});
  return orderedOccurrences(events,e=>Date.parse(e.endsAt || e.startsAt)>=Date.now()).slice(0,6);
}
