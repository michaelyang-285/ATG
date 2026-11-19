import { defaultWeek, type DayHours } from "@/lib/directory/hours";

type Props = { week: DayHours[] | null; legacy: string; onChange: (week: DayHours[]) => void };

export default function OperatingHoursFields({ week, legacy, onChange }: Props) {
  function update(index: number, values: Partial<DayHours>) {
    if (week) onChange(week.map((row, i) => i === index ? { ...row, ...values } : row));
  }

  return <fieldset className="hours-editor">
    <legend>Operating hours</legend>
    {week === null ? <>
      <p>{legacy}</p>
      <button type="button" onClick={() => onChange(defaultWeek())}>Set weekly hours</button>
    </> : <>
      <div className="hours-columns" aria-hidden="true"><span>Day</span><span>Opens</span><span>Closes</span></div>
      {week.map((row, index) => <div className="hours-row" key={row.day}>
        <label className="hours-day">
          <input type="checkbox" checked={row.open} onChange={e => update(index, {open: e.target.checked})} />
          {row.day}
        </label>
        {row.open ? <>
          <label className="hours-time"><span>Opens</span>
            <input type="time" aria-label={row.day + " opening time"} required value={row.opens}
              onChange={e => update(index, {opens: e.target.value})} />
          </label>
          <label className="hours-time"><span>Closes</span>
            <input type="time" aria-label={row.day + " closing time"} required value={row.closes}
              onChange={e => update(index, {closes: e.target.value})} />
          </label>
          {row.closes && row.opens && row.closes < row.opens && <small className="hours-overnight">Closes the next day</small>}
        </> : <span className="hours-closed">Closed</span>}
      </div>)}
    </>}
  </fieldset>;
}
