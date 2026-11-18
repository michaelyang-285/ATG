import { publication, type LocalEvent } from "./publication";
import { localClock, easternInstant, shift } from "./event-time";
export type EventRecord = LocalEvent & {
  street?: string;
  city?: string;
  cost?: string;
  price?: number;
  organizer?: string;
  weeklyUntil?: string;
  image?: any;
};
export const eventFields =
  '_id,title,"slug":coalesce(slug.current,_id),startsAt,endsAt,venue,neighborhood,summary,priceLabel,url,street,city,cost,price,organizer,weeklyUntil,image';
export function eventDates(e: EventRecord) {
  if (!e.startsAt || !Number.isFinite(Date.parse(e.startsAt))) return [];
  const start = localClock(e.startsAt),
    day = start.slice(0, 10);
  const dates = [{ ...e, day }];
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
    '*[_type=="event" && defined(startsAt) && startsAt < $end && (coalesce(endsAt,startsAt) >= $start || weeklyUntil >= $first)]{' +
      eventFields +
      "}",
    {
      start: shift(from, -1) + "T00:00:00Z",
      end: shift(to, 2) + "T00:00:00Z",
      first: from,
    },
    { next: { revalidate: 60 } },
  );
  return events
    .flatMap(eventDates)
    .filter(
      (e) =>
        e.day <= to && localClock(e.endsAt || e.startsAt).slice(0, 10) >= from,
    )
    .sort((a, b) => a.startsAt.localeCompare(b.startsAt));
}
