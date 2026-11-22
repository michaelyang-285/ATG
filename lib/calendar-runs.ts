import { localClock, shift } from "./event-time";
import type { calendar } from "./events";

type Occurrence = Awaited<ReturnType<typeof calendar>>[number];
export type CalendarRun = { key: string; dates: Occurrence[] };

const endDay = (e: Occurrence) => localClock(e.endsAt || e.startsAt).slice(0, 10);
const normalize = (value?: string) => (value || "").trim().replace(/\s+/g, " ").toLowerCase();

function identity(e: Occurrence) {
  // Separate listings can share a title. Only combine them when their source and venue agree.
  if (e.additionalSessions?.length) return e._id;
  if (!e.title || !(e.venue || e.street) || !(e.url || e.organizer)) return e._id;
  return JSON.stringify([e.title, e.venue, e.street, e.city || e.neighborhood, e.organizer, e.url].map(normalize));
}

function isLongRun(dates: Occurrence[]) {
  if (dates.some(e => endDay(e) >= shift(e.day, 6))) return true;
  const days = Array.from(new Set(dates.map(e => e.day)));
  if (days.length < 4 || days[days.length - 1] < shift(days[0], 7)) return false;
  // A regular weekly meetup stays in the grid. A run needs at least four operating days in two weeks.
  return days.some((day, i) => i >= 3 && day <= shift(days[i - 3], 13));
}

export function arrangeCalendar(occurrences: Occurrence[], from: string, to: string) {
  const inView = (e: Occurrence) => e.day <= to && endDay(e) >= from;
  const bySeries = new Map<string, Occurrence[]>();
  for (const event of occurrences) {
    const key = identity(event);
    const group = bySeries.get(key);
    if (group) group.push(event);
    else bySeries.set(key, [event]);
  }
  const ongoing: CalendarRun[] = [];
  const grouped = new Set<Occurrence>();
  bySeries.forEach((dates, key) => {
    if (dates[0].additionalSessions?.length) {
      const visible = dates.filter(inView);
      if (visible.length) ongoing.push({key, dates:visible});
      visible.forEach(e => grouped.add(e));
      return;
    }
    let run: Occurrence[] = [];
    let lastDay = "";
    const finishRun = () => {
      const visible = run.filter(inView);
      if (visible.length && isLongRun(run)) {
        ongoing.push({ key: key + run[0].day, dates: visible });
        visible.forEach(e => grouped.add(e));
      }
    };
    // calendar() supplies chronological occurrences. A gap of more than a week starts a new run.
    for (const event of dates) {
      if (lastDay && event.day > shift(lastDay, 7)) {
        finishRun();
        run = [];
        lastDay = "";
      }
      run.push(event);
      const end = endDay(event);
      if (end > lastDay) lastDay = end;
    }
    finishRun();
  });
  ongoing.sort((a, b) => a.dates[0].title.localeCompare(b.dates[0].title));
  return { daily: occurrences.filter(e => inView(e) && !grouped.has(e)), ongoing };
}
