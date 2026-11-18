import { localClock } from "@/lib/event-time";
import Link from "next/link";
import { calendarNotices } from "@/lib/gcps-calendar";
import "@/components/community.css";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "GCPS School Calendar 2026–27 | Gwinnett County Public Schools",
  description: "Find GCPS school holidays, Digital Learning Days, early release dates by grade, and the first and last days of school.",
  alternates: { canonical: "/events/gcps" },
};

const formatter = new Intl.DateTimeFormat("en-US", {
  weekday: "short", month: "short", day: "numeric", timeZone: "UTC",
});

export default function SchoolCalendar() {
  const dates = calendarNotices("2026-07-01", "2027-06-30").filter(event => event.school);
  const today = localClock(Date.now()).slice(0, 10);
  const groups = [
    { title: "Upcoming school dates", events: dates.filter(event => event.end >= today) },
    { title: "Past school dates", events: dates.filter(event => event.end < today).reverse() },
  ];
  return (
    <main id="main" className="site-width page-content atg-desk">
      <header>
        <Link className="text-link" href="/events">← All Gwinnett events</Link>
        <h1>GCPS school calendar</h1>
        <p>Plan for the 2026–27 Gwinnett County Public Schools year. Find days off, Digital Learning Days, and early dismissal dates for your child’s grade.</p>
      </header>
      {groups.map(group => (
        <section key={group.title}>
          <h2>{group.title}</h2>
          {!group.events.length && <p>No {group.title.toLowerCase()} for this school year.</p>}
          {group.events.map(event => (
        <article className="event-day" key={event.day + event.title}>
          <p><time dateTime={event.day}>{formatter.format(new Date(event.day))}</time>
            {event.end !== event.day && <> through <time dateTime={event.end}>{formatter.format(new Date(event.end))}</time></>}
            {", "}{event.end.slice(0, 4) !== event.day.slice(0, 4) ? "2026–27" : event.day.slice(0, 4)}
          </p>
          <h3>{event.title}</h3>
          <p>{event.kind.includes("DLD") ? (event.title === "Digital Learning Day" ? "All grades" : "Digital Learning Day")
            : event.kind.includes("closed") ? "No school for students."
            : event.kind.replace("GCPS early release · Grades", "Early dismissal for grades").replace("GCPS · All students", "All grades")}</p>
        </article>
          ))}
        </section>
      ))}
    </main>
  );
}
