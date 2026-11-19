import { Fragment } from "react";
import { dayLabel, isWeek, type DayHours } from "@/lib/directory/hours";

export default function OperatingHours({ week, legacy }: { week?: DayHours[] | null; legacy?: string }) {
  if (!isWeek(week)) return legacy ? <section><h3>Operating hours</h3><p>{legacy}</p></section> : null;
  return <section className="listing-hours">
    <h3>Operating hours</h3>
    <dl>
      {week.map(row => <Fragment key={row.day}>
        <dt>{row.day}</dt>
        <dd>{dayLabel(row).replace(/ (?=[AP]M)/g, "\u00a0")}</dd>
      </Fragment>)}
    </dl>
  </section>;
}
