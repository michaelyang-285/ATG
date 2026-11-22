import { localClock, shift } from "@/lib/event-time";
import Link from "next/link";
import { calendarNotices } from "@/lib/gcps-calendar";
import "@/components/community.css";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "GCPS School Calendar 2026–27 | Gwinnett County Public Schools",
  description: "See 2026–27 Gwinnett County school breaks, student return dates, Digital Learning Days and early release dates by grade. Spring break is April 5–9, 2027.",
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

function DateList({ dates }: { dates: SchoolDate[] }) {
  return (
    <ul style={{ marginTop: "0.5rem", paddingInlineStart: "1.25rem", listStyle: "disc" }}>
              {dates.map(event => (
                <li key={event.day + event.title}>
                  <DateRange event={event} /> · <strong>{event.title}</strong> · {details(event)}
                </li>
              ))}
            </ul>
  );
}

const breaks = [
  ["Fall break", "October 12–16, 2026", "Monday, October 19"],
  ["Thanksgiving break", "November 23–27, 2026", "Monday, November 30"],
  ["Winter break and January planning day", "December 21, 2026 through January 4, 2027", "Tuesday, January 5"],
  ["February break", "February 12–16, 2027", "Wednesday, February 17"],
  ["Spring break", "April 5–9, 2027", "Monday, April 12"],
];

const faq = [
  ["When is Gwinnett County spring break in 2027?", "GCPS spring break runs Monday, April 5 through Friday, April 9, 2027. Students return Monday, April 12."],
  ["When is fall break for Gwinnett County schools in 2026?", "GCPS students have October 12–16, 2026 off and return Monday, October 19."],
  ["Do Gwinnett students go back on January 4?", "Students return Tuesday, January 5, 2027. Monday, January 4 is a teacher planning day, so families have one more weekday without classes after winter break."],
  ["Do students have class on Digital Learning Days?", "Yes. GCPS students learn from home on September 18 and November 3, 2026, and March 19, 2027."],
  ["Which grades have early release?", "Grades K–8 dismiss early for conferences on October 28–29, 2026 and March 3–4, 2027. High school exam dismissals are December 16–18, 2026 and May 24–26, 2027."],
  ["When is the last day of school for GCPS?", "Wednesday, May 26, 2027 is the last day for students. It is also an early release day for high school exams."],
];

export default function SchoolCalendar() {
  const dates = calendarNotices("2026-07-01", "2027-06-30").filter(event => event.school);
  const today = localClock(Date.now()).slice(0, 10);
  const saturday = shift(today, 6 - new Date(today).getUTCDay());
  const upcoming = dates.filter(event => event.end >= today);
  const afterWeek = upcoming.filter(event => event.day > saturday);
  const month = today.slice(0, 7);
  const months: string[] = [];
  const cursor = new Date(today.slice(0, 7) + "-01T00:00:00Z");
  cursor.setUTCMonth(cursor.getUTCMonth() + 1);
  while (cursor.toISOString().slice(0, 7) <= "2027-06") {
    months.push(cursor.toISOString().slice(0, 7));
    cursor.setUTCMonth(cursor.getUTCMonth() + 1);
  }
  const groups = [
    { title: "This Week", dates: upcoming.filter(event => event.day <= saturday) },
    { title: "Later This Month", dates: afterWeek.filter(event => event.day.startsWith(month)) },
    { title: "Looking Ahead", dates: afterWeek.filter(event => !event.day.startsWith(month)) },
    { title: "Past school dates", dates: dates.filter(event => event.end < today).sort((a, b) => a.day.localeCompare(b.day)) },
  ].filter(group => group.title === "This Week" || (group.title === "Looking Ahead" && months.length > 0) || group.dates.length);
  return (
    <main id="main" className="site-width page-content atg-desk">
      <header>
        <Link className="text-link" href="/events">← All Gwinnett events</Link>
        <h1>Gwinnett County Public Schools (GCPS) Calendar 2026–27</h1>
        <p>The school year runs from Wednesday, August 5, 2026 through Wednesday, May 26, 2027. Check when your child has time off, learns from home or comes home early.</p>
        <p>Dates checked November 22, 2026 against the <a className="text-link" href="https://www.gcpsk12.org/about-us/calendar" target="_blank" rel="noopener noreferrer">official GCPS calendar</a>.</p>
      </header>
      <section style={{ display: "block" }} aria-labelledby="school-breaks">
        <h2 id="school-breaks">Major GCPS school breaks and return dates</h2>
        <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
          <thead><tr><th scope="col">Break</th><th scope="col">Days off for students</th><th scope="col">Back in class</th></tr></thead>
          <tbody>{breaks.map(([name, days, back]) => (
            <tr key={name} style={{ borderTop: "1px solid #ccc" }}>
              <th scope="row" style={{ paddingBlock: ".6rem", paddingRight: ".5rem" }}>{name}</th><td>{days}</td><td>{back}</td>
            </tr>
          ))}</tbody>
        </table>
        <a className="text-link" href="#calendar-faq">School calendar FAQ</a>
      </section>
      {groups.map(group => (
        <section key={group.title} style={{ display: "block" }}>
          <h2>{group.title}</h2>
          {group.title === "Looking Ahead" ? months.map(key => {
            const entries = group.dates.filter(event => event.day.startsWith(key));
            const heading = new Date(key + "-01T00:00:00Z").toLocaleDateString("en-US", {
              month: "long", year: "numeric", timeZone: "UTC",
            });
            return (
              <div key={key} style={{ marginTop: "1rem" }}>
                <h3>{heading}</h3>
                {entries.length ? <DateList dates={entries} /> : <p>Nothing happening with GCPS this month.</p>}
              </div>
            );
          }) : group.dates.length ? <DateList dates={group.dates} /> : <p>Nothing this week.</p>}
        </section>
      ))}
      <section style={{ display: "block" }} aria-labelledby="calendar-faq">
        <h2 id="calendar-faq">GCPS calendar FAQ</h2>
          <div className="border-2 border-ink bg-paper shadow-brutalist-sm divide-y-2 divide-ink">
            {faq.map(([question, answer]) => (
              <details key={question} className="group">
                <summary className="list-none px-5 py-4 cursor-pointer font-archivo text-[15px] uppercase tracking-wide text-ink hover:bg-card [&::-webkit-details-marker]:hidden">
                  {question}
                </summary>
                <div className="px-5 pb-5 font-georgia text-[16px] leading-[1.7] text-ink/85 border-t-2 border-ink/10 pt-4">
                  <p>{answer}</p>
                </div>
              </details>
            ))}
          </div>
      </section>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        "@context": "https://schema.org", "@type": "FAQPage",
        mainEntity: faq.map(([name, text]) => ({ "@type": "Question", name, acceptedAnswer: { "@type": "Answer", text } })),
      }) }} />
    </main>
  );
}
