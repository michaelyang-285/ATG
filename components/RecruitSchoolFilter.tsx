"use client";

import { useState, type ReactNode } from "react";

type Group = { id: string; title: string; athletes: { id: string; school: string; content: ReactNode }[] };

const pageSize = 10;

function RecruitGroup({ group, school }: { group: Group; school: string }) {
  const [page, setPage] = useState(0);
  const [showAll, setShowAll] = useState(false);
  const matches = group.athletes.filter(athlete => !school || athlete.school === school);
  const start = showAll ? 0 : page * pageSize;
  const end = showAll ? matches.length : Math.min(start + pageSize, matches.length);
  const heading = group.id + "-heading";

  return <section id={group.id} className="recruit-index" aria-labelledby={heading}>
    <h3 id={heading}>{group.title} ({matches.length})</h3>
    {matches.length > pageSize && <div className="recruit-paging" role="group" aria-label={group.title + " pagination"}>
      <span role="status">Showing {start + 1}–{end} of {matches.length}</span>
      {!showAll && <>
        <button type="button" disabled={page === 0} onClick={() => setPage(page - 1)}>Previous</button>
        <button type="button" disabled={end === matches.length} onClick={() => setPage(page + 1)}>Next</button>
      </>}
      <button type="button" onClick={() => { setPage(0); setShowAll(!showAll); }}>{showAll ? "Show 10 per page" : "Show all"}</button>
    </div>}
    {matches.length ? <ul>{matches.map((athlete, index) =>
      <li key={athlete.id} hidden={index < start || index >= end}>{athlete.content}</li>
    )}</ul> : <p>No {school} athletes listed in this group yet.</p>}
  </section>;
}

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
    {groups.map(group => <RecruitGroup key={group.id + ":" + school} group={group} school={school} />)}
    <noscript><style>{".recruit-index li[hidden]{display:grid}.recruit-paging,.recruit-school-filter{display:none}"}</style></noscript>
  </>;
}
