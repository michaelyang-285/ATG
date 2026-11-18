import { shift } from "./event-time";

type Holiday = { day: string; title: string; kind: string };
const federal = "U.S. federal holiday";
const hebrew = new Intl.DateTimeFormat("en-US-u-ca-hebrew", {
  timeZone: "UTC",
  month: "long",
  day: "numeric",
});
const islamic = new Intl.DateTimeFormat("en-US-u-ca-islamic-umalqura", {
  timeZone: "UTC",
  month: "numeric",
  day: "numeric",
});
function monthDay(format: Intl.DateTimeFormat, time: Date) {
  const parts = format.formatToParts(time);
  return (
    parts.find((p) => p.type === "month")?.value +
    "/" +
    parts.find((p) => p.type === "day")?.value
  );
}
// Gregorian computus for Western Easter.
function easter(y: number) {
  const a = y % 19,
    b = Math.floor(y / 100),
    c = y % 100;
  const h =
    (19 * a +
      b -
      Math.floor(b / 4) -
      Math.floor((b - Math.floor((b + 8) / 25) + 1) / 3) +
      15) %
    30;
  const l = (32 + 2 * (b % 4) + 2 * Math.floor(c / 4) - h - (c % 4)) % 7;
  const n = h + l - 7 * Math.floor((a + 11 * h + 22 * l) / 451) + 114;
  return new Date(Date.UTC(y, Math.floor(n / 31) - 1, (n % 31) + 1))
    .toISOString()
    .slice(0, 10);
}
// Regional dates: Drik Panchang (Atlanta), UN and Delaware interfaith calendar.
const festivals: Record<string, [string, string]> = {
  "2026-05-01": ["Vesak", "Buddhist · date varies by tradition"],
  "2027-05-20": ["Vesak", "Buddhist · date varies by tradition"],
  "2026-11-08": ["Diwali", "Hindu observance"],
  "2027-10-29": ["Diwali", "Hindu observance"],
  "2028-10-17": ["Diwali", "Hindu observance"],
  "2029-11-05": ["Diwali", "Hindu observance"],
  "2030-10-25": ["Diwali", "Hindu observance"],
};
export function holidays(from: string, to: string) {
  const rows: Holiday[] = [];
  function add(day: string, title: string, kind: string) {
    if (day >= from && day <= to) rows.push({ day, title, kind });
  }
  for (let y = Number(from.slice(0, 4)); y <= Number(to.slice(0, 4)) + 1; y++) {
    const fixed = function(md: string, title: string, kind = federal) {
      const day = y + "-" + md;
      add(day, title, kind);
      const weekday = new Date(day).getUTCDay();
      if (weekday === 6 || weekday === 0)
        add(shift(day, weekday === 6 ? -1 : 1), title + " (observed)", federal);
    }
    const weekday = function(month: number, w: number, n: number, title: string) {
      const anchor = new Date(Date.UTC(y, month - 1, 1));
      const offset = ((w - anchor.getUTCDay() + 7) % 7) + 7 * (n - 1);
      add(shift(anchor.toISOString().slice(0, 10), offset), title, federal);
    }
    fixed("01-01", "New Year’s Day");
    if (y >= 1986) weekday(1, 1, 3, "Martin Luther King Jr. Day");
    weekday(2, 1, 3, "Washington’s Birthday");
    const may31 = y + "-05-31";
    add(
      shift(may31, -((new Date(may31).getUTCDay() + 6) % 7)),
      "Memorial Day",
      federal,
    );
    if (y >= 2021) fixed("06-19", "Juneteenth");
    fixed("07-04", "Independence Day");
    weekday(9, 1, 1, "Labor Day");
    weekday(10, 1, 2, "Columbus Day");
    fixed("11-11", "Veterans Day");
    weekday(11, 4, 4, "Thanksgiving Day");
    fixed("12-25", "Christmas Day", federal + " · Christian");
    const sunday = easter(y);
    add(sunday, "Easter Sunday", "Western Christian");
    add(shift(sunday, -2), "Good Friday", "Western Christian");
    add(y + "-04-14", "Vaisakhi", "Sikh observance");
  }
  const jewish: Record<string, string> = {
    "Tishri/1": "Rosh Hashanah",
    "Tishri/10": "Yom Kippur",
    "Kislev/25": "Hanukkah begins",
    "Nisan/15": "Passover begins",
  };
  const muslim: Record<string, string> = {
    "9/1": "Ramadan begins",
    "10/1": "Eid al-Fitr",
    "12/10": "Eid al-Adha",
  };
  for (let day = from; day <= to; day = shift(day, 1)) {
    const date = new Date(day);
    const j = jewish[monthDay(hebrew, date)],
      m = muslim[monthDay(islamic, date)];
    if (j) add(day, j, "Jewish · begins at sundown the evening before");
    if (m) add(day, m, "Muslim · anticipated date, subject to moon sighting");
    if (festivals[day]) add(day, ...festivals[day]);
  }
  return rows.sort((a, b) => a.day.localeCompare(b.day));
}
