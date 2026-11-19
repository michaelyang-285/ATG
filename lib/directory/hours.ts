export const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"] as const;

export type DayHours = {
  day: typeof days[number];
  open: boolean;
  opens: string;
  closes: string;
};

export function defaultWeek(): DayHours[] {
  return days.map((day, i) => ({ day, open: i > 0 && i < 6, opens: "09:00", closes: "17:00" }));
}

export function isWeek(value: unknown): value is DayHours[] {
  return Array.isArray(value) && value.length === days.length &&
    days.every((day, i) => {
      const row = value[i];
      return row?.day === day && typeof row.open === "boolean" &&
        typeof row.opens === "string" && row.opens.length <= 5 &&
        typeof row.closes === "string" && row.closes.length <= 5;
    });
}

const clock = /^(?:[01]\d|2[0-3]):[0-5]\d$/;
export const validTime = (value: string) => clock.test(value);

export function hoursError(value: unknown): string | null {
  if (!isWeek(value)) return "Check the operating hours for each day of the week.";
  for (const row of value) {
    if (!row.open) continue;
    if (!validTime(row.opens) || !validTime(row.closes))
      return "Enter opening and closing times for " + row.day + ".";
    if (row.opens === row.closes) return "Choose different opening and closing times for " + row.day + ".";
  }
  return null;
}

function displayTime(time: string) {
  const [hour, minute] = time.split(":").map(Number);
  return (hour % 12 || 12) + (minute ? ":" + String(minute).padStart(2, "0") : "") + (hour < 12 ? " AM" : " PM");
}

export function dayLabel(row: DayHours) {
  if (!row.open) return "Closed";
  return displayTime(row.opens) + "–" + displayTime(row.closes) + (row.closes < row.opens ? " (next day)" : "");
}
