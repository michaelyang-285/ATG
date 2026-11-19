import { eventPageMetadata } from "@/lib/event-metadata";
import { calendarNotices } from "@/lib/gcps-calendar";
import Link from "next/link";
import CalendarGrid from "@/components/CalendarGrid";
import OngoingEvents from "@/components/OngoingEvents";
import { arrangeCalendar } from "@/lib/calendar-runs";
import { calendar, occurrencePath } from "@/lib/events";
import { localClock, shift, validDay, zone } from "@/lib/event-time";
import { facebookGroup } from "@/lib/gwinnett";
import "@/components/community.css";
export const metadata = eventPageMetadata(
  "Gwinnett County Events Calendar",
  "Explore local Gwinnett events by week, month, or year and submit an event for review.",
  "/events",
);
function label(day: string, options: Intl.DateTimeFormatOptions) {
  return new Intl.DateTimeFormat("en-US", {
    ...options,
    timeZone: "UTC",
  }).format(new Date(day));
}
export default async function Page({
  searchParams: q,
}: {
  searchParams: { view?: string; date?: string; section?: string };
}) {
  const view = ["year", "month"].includes(q.view || "") ? q.view : "week";
  const showOngoing = q.section === "ongoing";
  const sectionQuery = showOngoing ? "&section=ongoing" : "";
  const day =
    q.date &&
    validDay(q.date) &&
    +q.date.slice(0, 4) >= 1900 &&
    +q.date.slice(0, 4) <= 2100
      ? q.date
      : localClock(Date.now()).slice(0, 10);
  let from = day,
    to = day,
    prev = day,
    next = day;
  if (view === "week") {
    from = shift(day, -new Date(day).getUTCDay());
    to = shift(from, 6);
    prev = shift(from, -7);
    next = shift(from, 7);
  } else if (view === "month") {
    from = day.slice(0, 7) + "-01";
    prev = shift(from, -1);
    next = shift(from, 32).slice(0, 7) + "-01";
    to = shift(next, -1);
  } else {
    from = day.slice(0, 4) + "-01-01";
    to = day.slice(0, 4) + "-12-31";
    prev = shift(from, -1);
    next = shift(to, 1);
  }
  // Include nearby dates so the first or last weekend of a run is recognized in week view.
  const occurrences = await calendar(shift(from, -28), shift(to, 28));
  const { daily: items, ongoing } = arrangeCalendar(occurrences, from, to);
  const observances = calendarNotices(from, to);
  const period =
    view === "year"
      ? from.slice(0, 4)
      : view === "month"
        ? label(from, { month: "long", year: "numeric" })
        : label(from, { month: "short", day: "numeric" }) +
          " – " +
          label(to, { month: "short", day: "numeric", year: "numeric" });
  return (
    <main id="main" className="site-width page-content atg-desk">
      <header>
        <h1>Gwinnett events</h1>
        <p>
          Make a plan close to home. Browse community events or share one you’re
          organizing.
        </p>
        <Link className="button button-orange" href="/events/submit">
          Submit an event
        </Link>
        <p><Link className="text-link" href="/events/gcps">View the GCPS school calendar →</Link></p>
      </header>
      <nav aria-label="Calendar view" className="event-controls">
        {["week", "month", "year"].map((v, i) => (
          <Link
            key={v}
            aria-current={view === v ? "page" : undefined}
            href={`/events?view=${v}&date=${day}${sectionQuery}`}
          >
            {["Week", "Month", "Year list"][i]}
          </Link>
        ))}
      </nav>
      <h2>{period}</h2>
      <nav className="event-controls" aria-label="Calendar period">
        <Link href={`?view=${view}&date=${prev}${sectionQuery}`}>← Previous {view}</Link>
        <Link href={`?view=${view}${sectionQuery}`}>Today</Link>
        <Link href={`?view=${view}&date=${next}${sectionQuery}`}>Next {view} →</Link>
      </nav>
      <nav className="calendar-tabs" aria-label="Event lists">
        <Link id="dated-events-tab" href={`/events?view=${view}&date=${day}`}
          aria-current={!showOngoing ? "page" : undefined} scroll={false}>
          Events by date
        </Link>
        <Link id="ongoing-events-tab" href={`/events?view=${view}&date=${day}&section=ongoing`}
          aria-current={showOngoing ? "page" : undefined} scroll={false}>
          Ongoing events ({ongoing.length})
        </Link>
      </nav>
      {showOngoing ? (
        <section className="calendar-event-list" id="ongoing-events" aria-labelledby="ongoing-events-tab">
          {ongoing.length ? <OngoingEvents runs={ongoing} view={view} /> : <p>No ongoing events for this {view}.</p>}
        </section>
      ) : (
        <section className="calendar-event-list" id="dated-events" aria-labelledby="dated-events-tab">
          {view !== "year" && (
            <CalendarGrid from={from} to={to} period={period} limit={view === "month" ? 2 : 3}
              events={items} notices={observances} />
          )}
          {items.length || observances.length ? (
            [
              ...items.map((e) => ({
                day: e.day,
                element: (
                  <article className="event-day calendar-list-row" key={e._id + e.day}>
                    <time className="calendar-list-date" dateTime={e.startsAt}>
                      {new Date(e.startsAt).toLocaleString("en-US", {
                        timeZone: zone,
                        weekday: "short",
                        month: "short",
                        day: "numeric",
                        hour: "numeric",
                        minute: "2-digit",
                      })}
                    </time>
                    <h3 className="calendar-list-title">
                      <Link href={occurrencePath(e)}>{e.title}</Link>
                    </h3>
                    <p className="calendar-list-meta">
                      {[e.venue, e.city || e.neighborhood, e.priceLabel]
                        .filter(Boolean)
                        .join(" · ")}
                    </p>
                  </article>
                ),
              })),
              ...observances.map((h, index) => ({
                day: h.day,
                element: (
                  <article className="event-day calendar-list-row" id={"calendar-notice-" + index} key={h.day + h.title}>
                    <p className="calendar-list-date">
                      <time dateTime={h.day}>{label(h.day, { weekday: "short", month: "short", day: "numeric" })}</time>
                      {h.end !== h.day && (
                        <> – <time dateTime={h.end}>{label(h.end, { weekday: "short", month: "short", day: "numeric" })}</time></>
                      )}
                    </p>
                    <h3 className="calendar-list-title">{h.title}</h3>
                    <p className="calendar-list-meta">
                      {h.kind === "GCPS schools closed for students" ? "GCPS students have no school" : h.kind}
                    </p>
                    {h.overlaps?.map((o) => (
                      <p className="calendar-list-meta" key={o.day + o.title}>
                        {o.title} is {o.kind === "U.S. federal holiday" ? "a U.S. federal holiday " : ""}
                        on {label(o.day, { weekday: "long", month: "short", day: "numeric" })}.
                      </p>
                    ))}
                  </article>
                ),
              })),
            ]
              .sort((a, b) => a.day.localeCompare(b.day))
              .map((row) => row.element)
          ) : (
            <p>No dated events for this {view}.</p>
          )}
        </section>
      )}
      <p className="event-day">
        <a className="text-link" href={facebookGroup}>
          Ask neighbors about upcoming events in the ATG Facebook group ↗
        </a>
      </p>
    </main>
  );
}
