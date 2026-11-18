import { holidays } from "./holidays";
export const gcpsSource =
  "https://resources.finalsite.net/images/v1783711154/gcpsk12org/l6f0mqzdmbl1eegvsoqt/2026-27StudentCalendar_FINALeq.pdf";
const closed = "GCPS schools closed for students",
  dld = "GCPS DLD (Digital Learning Day) · Students learn from home";
type Entry = {
  day: string;
  end: string;
  title: string;
  kind: string;
  school?: boolean;
  overlaps?: ReturnType<typeof holidays>;
};
const dates: [string, string, string, string][] = [
  ["2026-08-05", "", "First day of school", "GCPS · All students"],
  ["2026-09-07", "", "Labor Day", closed],
  ["2026-09-18", "", "Digital Learning Day", dld],
  ["2026-10-12", "2026-10-16", "Fall break", closed],
  [
    "2026-10-28",
    "2026-10-29",
    "Parent-teacher conferences",
    "GCPS early release · Grades K–8",
  ],
  ["2026-11-03", "", "Election Day", dld],
  ["2026-11-23", "2026-11-27", "Thanksgiving break", closed],
  [
    "2026-12-16",
    "2026-12-18",
    "High school exams",
    "GCPS early release · Grades 9–12",
  ],
  ["2026-12-21", "2027-01-04", "Winter break", closed],
  ["2027-01-05", "", "Second semester begins", "GCPS · All students"],
  ["2027-01-18", "", "Martin Luther King Jr. Day", closed],
  ["2027-02-12", "2027-02-16", "February school holiday", closed],
  [
    "2027-03-03",
    "2027-03-04",
    "Parent-teacher conferences",
    "GCPS early release · Grades K–8",
  ],
  ["2027-03-19", "", "Digital Learning Day", dld],
  ["2027-04-05", "2027-04-09", "Spring break", closed],
  [
    "2027-05-24",
    "2027-05-26",
    "High school exams",
    "GCPS early release · Grades 9–12",
  ],
  ["2027-05-26", "", "Last day of school", "GCPS · All students"],
];
export function calendarNotices(from: string, to: string): Entry[] {
  const federalAndFaith = holidays(from, to);
  const school: Entry[] = dates
    .map(([day, end, title, kind]) => ({
      day,
      end: end || day,
      title,
      kind,
      school: true,
    }))
    .filter((e) => e.day <= to && e.end >= from);
  const remaining: Entry[] = [];
  for (const h of federalAndFaith) {
    const closure = school.find(
      (e) =>
        e.kind === closed &&
        h.kind.startsWith("U.S. federal holiday") &&
        e.day <= h.day &&
        e.end >= h.day,
    );
    if (!closure) {
      remaining.push({ ...h, end: h.day });
      continue;
    }
    (closure.overlaps ??= []).push(h);
  }
  return [...school, ...remaining];
}
