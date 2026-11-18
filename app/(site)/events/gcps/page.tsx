import { localClock, shift } from "@/lib/event-time";
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

type SchoolDate = ReturnType<typeof calendarNotices>[number];

function DateRange({ event }: { event: SchoolDate }) {
  const format = (day: string) => formatter.format(new Date(day));
  return <>
    <time dateTime={event.day}>{format(event.day)}</time>
    {event.day.slice(0, 4) !== event.end.slice(0, 4) && ", " + event.day.slice(0, 4)}
    {event.end !== event.day && <> through <time dateTime={event.end}>{format(event.end)}</time></>}
    {", "}{event.end.slice(0, 4)}
  </>;
}

function details(event: SchoolDate) {
  if (event.kind.includes("DLD")) return event.title === "Digital Learning Day" ? "All grades" : "Digital Learning Day";
  if (event.kind.includes("closed")) return "No school for students.";
  return event.kind.replace("GCPS early release · Grades", "Early dismissal for grades").replace("GCPS · All students", "All grades");
}

export default function SchoolCalendar() {
  const dates = calendarNotices("2026-07-01", "2027-06-30").filter(event => event.school);
  const today = localClock(Date.now()).slice(0, 10);
  const saturday = shift(today, 6 - new Date(today).getUTCDay());
  const upcoming = dates.filter(event => event.end >= today);
  const afterWeek = upcoming.filter(event => event.day > saturday);
  const month = today.slice(0, 7);
  const groups = [
    { title: "This Week", dates: upcoming.filter(event => event.day <= saturday) },
    { title: "Later This Month", dates: afterWeek.filter(event => event.day.startsWith(month)) },
    { title: "Looking Ahead", dates: afterWeek.filter(event => !event.day.startsWith(month)) },
    { title: "Past school dates", dates: dates.filter(event => event.end < today).sort((a, b) => a.day.localeCompare(b.day)) },
  ].filter(group => group.title === "This Week" || group.dates.length);
  return (
    <main id="main" className="site-width page-content atg-desk">
      <header>
        <Link className="text-link" href="/events">← All Gwinnett events</Link>
        <h1>GCPS school calendar</h1>
        <p>Plan for the 2026–27 Gwinnett County Public Schools year. Find days off, Digital Learning Days, and early dismissal dates for your child’s grade.</p>
      </header>
      {groups.map(group => (
        <section key={group.title} style={{ display: "block" }}>
          <h2>{group.title}</h2>
            {group.dates.length === 0 ? <p>Nothing this week.</p> : (
            <ul style={{ marginTop: "0.5rem", paddingInlineStart: "1.25rem", listStyle: "disc" }}>
              {group.dates.map(event => (
                <li key={event.day + event.title}>
                  <DateRange event={event} /> · <strong>{event.title}</strong> · {details(event)}
                </li>
              ))}
            </ul>
          )}
        </section>
      ))}
    </main>
  );
}
