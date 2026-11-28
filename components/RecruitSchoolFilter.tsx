"use client";

import { useState, type ReactNode } from "react";

type Group = { id: string; title: string; athletes: { id: string; school: string; content: ReactNode }[] };

export function RecruitSchoolFilter({ groups }: { groups: Group[] }) {
  const [school, setSchool] = useState("");
  const schools = Array.from(new Set(groups.flatMap(group => group.athletes.map(athlete => athlete.school)).filter(Boolean))).sort((a, b) => a.localeCompare(b));
  return <>
    <label className="recruit-school-filter">Filter by high school
      <select value={school} onChange={event => setSchool(event.target.value)}>
        <option value="">All schools</option>
        {schools.map(name => <option key={name}>{name}</option>)}
      </select>
    </label>
    {groups.map(group => {
      const visible = school ? group.athletes.filter(athlete => athlete.school === school) : group.athletes;
      return <section key={group.id} id={group.id} className="recruit-index" aria-labelledby={group.id + "-heading"}>
        <h3 id={group.id + "-heading"} aria-live="polite">{group.title} ({visible.length})</h3>
        {visible.length ? <ul>{visible.map(athlete => <li key={athlete.id}>{athlete.content}</li>)}</ul>
          : <p>No {school} athletes listed in this group yet.</p>}
      </section>;
    })}
  </>;
}
