import { eventPageMetadata } from "@/lib/event-metadata";
import { calendarNotices } from "@/lib/gcps-calendar";
import Link from "next/link";
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
  searchParams: { view?: string; date?: string };
}) {
  const view = ["year", "month"].includes(q.view || "") ? q.view : "week";
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
  const items = await calendar(from, to);
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
            href={`/events?view=${v}&date=${day}`}
          >
            {["Week", "Month", "Year list"][i]}
          </Link>
        ))}
      </nav>
      <h2>{period}</h2>
      <nav className="event-controls" aria-label="Calendar period">
        <Link href={`?view=${view}&date=${prev}`}>← Previous {view}</Link>
        <Link href={`?view=${view}`}>Today</Link>
        <Link href={`?view=${view}&date=${next}`}>Next {view} →</Link>
      </nav>
      {view !== "year" && (
        <div className="calendar-grid" aria-label={period}>
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
            <strong key={d}>{d}</strong>
          ))}
          {Array.from({ length: new Date(from).getUTCDay() }, (_, i) => (
            <div aria-hidden="true" key={"blank" + i} />
          ))}
          {Array.from(
            {
              length:
                1 + Math.round((Date.parse(to) - Date.parse(from)) / 86400000),
            },
            (_, i) => {
              const date = shift(from, i),
                matches = items.filter(
                  (e) =>
                    e.day <= date &&
                    localClock(e.endsAt || e.startsAt).slice(0, 10) >= date,
                );
              return (
                <div key={date}>
                  <time dateTime={date}>{Number(date.slice(8))}</time>
                  {observances
                    .filter((h) => h.day <= date && h.end >= date)
                    .map((h) => (
                      <small
                        key={h.title}
                        style={{ display: "block", overflowWrap: "anywhere" }}
                      >
                        {h.title}
                        {h.school && <> · {h.kind}</>}
                        {h.overlaps
                          ?.filter((o) => o.day === date && o.title !== h.title)
                          .map((o) => (
                            <span key={o.title}> · {o.title}</span>
                          ))}
                      </small>
                    ))}
                  {matches.map((e) => (
                    <Link key={e._id + e.day} href={occurrencePath(e)}>
                      {e.title}
                    </Link>
                  ))}
                </div>
              );
            },
          )}
        </div>
      )}
      {items.length || observances.length ? (
        [
          ...items.map((e) => ({
            day: e.day,
            element: (
              <article className="event-day" key={e._id + e.day}>
                <p>
                  {new Date(e.startsAt).toLocaleString("en-US", {
                    timeZone: zone,
                    weekday: "short",
                    month: "short",
                    day: "numeric",
                    hour: "numeric",
                    minute: "2-digit",
                  })}
                </p>
                <h3>
                  <Link href={occurrencePath(e)}>{e.title}</Link>
                </h3>
                <p>
                  {[e.venue, e.city || e.neighborhood, e.priceLabel]
                    .filter(Boolean)
                    .join(" · ")}
                </p>
              </article>
            ),
          })),
          ...observances.map((h) => ({
            day: h.day,
            element: (
              <article className="event-day" key={h.day + h.title}>
                <h3>{h.title}</h3>
                <p>
                  {h.kind === "GCPS schools closed for students"
                    ? "GCPS students have no school"
                    : h.kind}
                  {h.end === h.day ? " on " : " from "}
                  {label(h.day, { weekday: "long", month: "short", day: "numeric" })}
                  {h.end !== h.day && (
                    <> through {label(h.end, { weekday: "long", month: "short", day: "numeric" })}</>
                  )}.
                </p>
                {h.overlaps?.map((o) => (
                  <p key={o.day + o.title}>
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
        <p>No published events for this {view} yet.</p>
      )}
      <p className="event-day">
        <a className="text-link" href={facebookGroup}>
          Ask neighbors about upcoming events in the ATG Facebook group ↗
        </a>
      </p>
    </main>
  );
}
