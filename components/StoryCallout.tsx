import { PortableText, type PortableTextComponents } from "@portabletext/react";
import type { PortableTextBlock, PortableTextSpan } from "@portabletext/types";
import { RecruitSchoolFilter } from "./RecruitSchoolFilter";
import { safeUrl } from "@/lib/publication";

type Paragraph = PortableTextBlock<Record<string, unknown> & { _type: string; _key: string }, PortableTextSpan>;
type Callout = { _key?: string; heading?: string; title?: string; style?: string; body?: Paragraph[] | string };

const profileMarks: PortableTextComponents = {
  marks: {
    link: ({ value, children }) => {
      const href = safeUrl(value?.href);
      return href ? <a href={href}>{children}</a> : <>{children}</>;
    },
  },
};

// A paragraph is a table row. Shift+Enter separates its cells in Studio.
function tableCells(row: Paragraph) {
  const cells: PortableTextSpan[][] = [[]];
  for (const span of row.children) {
    if (typeof span.text !== "string") continue;
    span.text.split("\n").forEach((text, i) => {
      if (i) cells.push([]);
      if (text) cells[cells.length - 1].push({ ...span, text });
    });
  }
  return cells.map((children, i) => (
    <PortableText
      key={i}
      value={{ ...row, children }}
      components={{ ...profileMarks, block: { normal: ({ children }) => <>{children}</> } }}
    />
  ));
}

function recruitSchool(row: Paragraph, younger: boolean) {
  return row.children.map(span => span.text).join("").split("\n")[younger ? 2 : 1]?.trim() || "";
}

export function RecruitSchoolTotals({ tables, title }: { tables: Callout[]; title: string }) {
  const counts = new Map<string, { seniors: number; younger: number }>();
  let seniors = 0;
  let younger = 0;
  for (const table of tables) {
    const isYounger = table._key === "recruit-table-1";
    for (const row of Array.isArray(table.body) ? table.body.slice(1) : []) {
      const school = recruitSchool(row, isYounger);
      if (!school) continue;
      const count = counts.get(school) || { seniors: 0, younger: 0 };
      if (isYounger) { count.younger++; younger++; }
      else { count.seniors++; seniors++; }
      counts.set(school, count);
    }
  }
  const schools = Array.from(counts).sort(([a, x], [b, y]) =>
    (y.seniors + y.younger) - (x.seniors + x.younger) || a.localeCompare(b));
  return <table className="story-table recruit-totals">
    <caption>{title}</caption>
    <thead><tr>{["High school", "2027", "2028–30", "Total"].map(label => <th key={label} scope="col">{label}</th>)}</tr></thead>
    <tbody>{schools.map(([school, count]) => <tr key={school}><th scope="row">{school}</th><td>{count.seniors}</td><td>{count.younger}</td><td>{count.seniors + count.younger}</td></tr>)}</tbody>
    <tfoot><tr><th scope="row">All schools</th><td>{seniors}</td><td>{younger}</td><td>{seniors + younger}</td></tr></tfoot>
  </table>;
}

export function RecruitDirectory({ tables, transition }: { tables: Callout[]; transition?: Paragraph }) {
  const groups = tables.map(table => {
    const younger = table._key === "recruit-table-1";
    const rows = Array.isArray(table.body) ? table.body.slice(1) : [];
    const athletes = rows.map(row => {
      const [name, ...fields] = tableCells(row);
      const [school, sport, status, college, rating, state, national] = fields.slice(younger ? 1 : 0);
      const schoolName = recruitSchool(row, younger);
      return { id: row._key, school: schoolName, content: <>
                <div><strong>{name}</strong><div>{school}{younger && <> · {fields[0]}</>}</div><div>{sport}</div></div>
                <div><strong>{status}</strong><div>{college}</div></div>
                <div><div>Rating: {rating}</div><div>Georgia: {state}</div><div>National: {national}</div></div>
              </> };
    });
    return { id: table._key!, title: table.heading || table.title || "Recruits", athletes };
  });
  return <RecruitSchoolFilter groups={groups} transition={transition && <PortableText value={transition} components={profileMarks} />} />;
}

export function StoryCallout({ value }: { value: Callout }) {
  const title = value.heading || value.title;
  const rows = Array.isArray(value.body) ? value.body : [];
  if (value.style === "table" && rows.length) {
    const [head, ...records] = rows;
    return (
      <div className="story-table-wrap" role="region" aria-label={title || "Guide table"} tabIndex={0}>
        <table className="story-table">
          <caption>{title}</caption>
          <thead><tr>{tableCells(head).map((cell, i) => <th key={i} scope="col">{cell}</th>)}</tr></thead>
          <tbody>{records.map(row => <tr key={row._key}>{tableCells(row).map((cell, i) =>
            i === 0 ? <th key={i} scope="row">{cell}</th> : <td key={i}>{cell}</td>
          )}</tr>)}</tbody>
        </table>
      </div>
    );
  }
  if (value.style === "profile" || value.style === "action") {
    return (
      <aside className={value.style === "profile" ? "story-profile" : "story-action"} aria-label={title}>
        {title && <h3>{title}</h3>}
        <PortableText value={rows} components={profileMarks} />
      </aside>
    );
  }
  return <aside><h2>{title}</h2>{Array.isArray(value.body) ? <PortableText value={value.body} /> : <p>{value.body}</p>}</aside>;
}
