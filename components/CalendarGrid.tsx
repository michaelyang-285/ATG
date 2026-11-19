import Link from "next/link";
import { calendarNotices } from "@/lib/gcps-calendar";
import { calendar, occurrencePath } from "@/lib/events";
import { localClock, shift, zone } from "@/lib/event-time";

type Props = {
  from: string;
  to: string;
  period: string;
  limit: number;
  events: Awaited<ReturnType<typeof calendar>>;
  notices: ReturnType<typeof calendarNotices>;
};

type Entry = {
  start: string;
  end: string;
  title: string;
  caption: string;
  kind: "event" | "school" | "observance";
  href: string;
};

const timeFormat = new Intl.DateTimeFormat("en-US", {
  timeZone: zone, hour: "numeric", minute: "2-digit",
});
const dateFormat = new Intl.DateTimeFormat("en-US", {
  timeZone: "UTC", weekday: "long", month: "short", day: "numeric",
});

function EntryList({ entries, date }: { entries: Entry[]; date: string }) {
  return <ul className="calendar-entries">
    {entries.map(entry => (
      <li key={entry.href + entry.title}>
        <Link className="calendar-entry" data-kind={entry.kind} href={entry.href} title={entry.title} prefetch={false}>
          <span className="calendar-caption">
            {entry.kind === "event" && entry.start < date ? "Continues" : entry.caption}
          </span>
          <span className="calendar-title">{entry.title}</span>
        </Link>
      </li>
    ))}
  </ul>;
}

export default function CalendarGrid({ from, to, period, limit, events, notices }: Props) {
  const entries: Entry[] = [];
  notices.forEach((notice, index) => {
    const href = "#calendar-notice-" + index;
    entries.push({
      start: notice.day, end: notice.end, href, title: notice.title,
      kind: notice.school ? "school" : "observance",
      caption: notice.school ? "GCPS" : "Observance",
    });
    for (const overlap of notice.overlaps || []) {
      if (overlap.title !== notice.title) entries.push({
        start: overlap.day, end: overlap.day, href, title: overlap.title,
        kind: "observance", caption: "Observance",
      });
    }
  });
  for (const event of events) {
    entries.push({
      start: event.day, end: localClock(event.endsAt || event.startsAt).slice(0, 10),
      title: event.title, href: occurrencePath(event), kind: "event",
      caption: timeFormat.format(new Date(event.startsAt)),
    });
  }

  return <div className="calendar-grid" role="region" aria-label={period + " calendar"}>
    {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(day =>
      <span className="calendar-weekday" key={day} aria-hidden="true">{day}</span>
    )}
    {Array.from({ length: new Date(from).getUTCDay() }, (_, i) =>
      <div className="calendar-blank" key={"blank-" + i} aria-hidden="true" />
    )}
    {Array.from({ length: 1 + (Date.parse(to) - Date.parse(from)) / 86400000 }, (_, i) => {
      const date = shift(from, i);
      const dayLabel = dateFormat.format(new Date(date));
      const matches = entries.filter(entry => entry.start <= date && date <= entry.end);
      const extra = matches.length - limit;
      return <div className="calendar-day" key={date} data-occupied={matches.length > 0}>
        <h3 className="calendar-date"><time dateTime={date}>
          <span className="calendar-date-number" aria-hidden="true">{Number(date.slice(8))}</span>
          <span className="calendar-date-full">{dayLabel}</span>
        </time></h3>
        {matches.length > 0 && <EntryList entries={matches.slice(0, limit)} date={date} />}
        {extra > 0 && <details className="calendar-more">
          <summary>
            <span className="calendar-more-closed">View {extra} more</span>
            <span className="calendar-more-open">Show fewer</span>
            <span className="sr-only"> for {dayLabel}</span>
          </summary>
          <EntryList entries={matches.slice(limit)} date={date} />
        </details>}
      </div>;
    })}
    {Array.from({ length: 6 - new Date(to).getUTCDay() }, (_, i) =>
      <div className="calendar-blank" key={"trailing-" + i} aria-hidden="true" />
    )}
  </div>;
}
