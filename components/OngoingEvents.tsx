import Link from "next/link";
import type { CalendarRun } from "@/lib/calendar-runs";
import { localClock, zone } from "@/lib/event-time";
import { occurrencePath } from "@/lib/events";

const dateFormat = new Intl.DateTimeFormat("en-US", {
  timeZone: zone, weekday: "short", month: "short", day: "numeric",
});
const rangeFormat = new Intl.DateTimeFormat("en-US", { timeZone: zone, month: "short", day: "numeric" });
const timeFormat = new Intl.DateTimeFormat("en-US", {
  timeZone: zone, hour: "numeric", minute: "2-digit",
});

export default function OngoingEvents({ runs, view }: { runs: CalendarRun[]; view: string }) {
  return runs.map(({ key, dates }) => {
    const first = dates[0];
    const lastTime = Math.max(...dates.map(e => Date.parse(e.endsAt || e.startsAt)));
    const firstLabel = rangeFormat.format(new Date(first.startsAt));
    const lastLabel = rangeFormat.format(lastTime);
    const range = localClock(lastTime).slice(0, 10) === first.day ? firstLabel : firstLabel + " – " + lastLabel;
    const location = [first.venue, first.city || first.neighborhood].filter(Boolean).join(" · ");
    return <details className="calendar-run" key={key}>
      <summary className="calendar-list-row">
        <span className="calendar-run-info">
          <span className="calendar-list-date">{dates.length > 1 && "Select dates · "}{range}</span>
          <strong className="calendar-list-title">{first.title}</strong>
          {location && <span className="calendar-list-meta">{location}</span>}
        </span>
        <span className="run-control"><span className="run-closed">View dates</span><span className="run-open">Hide dates</span></span>
      </summary>
      <ul aria-label={first.title + " dates this " + view}>
        {dates.map(event => {
          const start = new Date(event.startsAt);
          const end = event.endsAt ? new Date(event.endsAt) : null;
          const spansDays = end && localClock(event.endsAt!).slice(0, 10) !== event.day;
          return <li key={event._id + event.day}>
            <Link href={occurrencePath(event)} prefetch={false}>
              <time dateTime={event.startsAt}>{dateFormat.format(start)} · {timeFormat.format(start)}</time>
              {end && <> – <time dateTime={event.endsAt}>{spansDays && dateFormat.format(end) + " · "}{timeFormat.format(end)}</time></>}
              <span className="sr-only"> · {event.title} event details</span>
            </Link>
          </li>;
        })}
      </ul>
    </details>;
  });
}
