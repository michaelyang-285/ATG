import { PortableText, type PortableTextComponents } from "@portabletext/react";
import type { PortableTextBlock, PortableTextSpan } from "@portabletext/types";
import { safeUrl } from "@/lib/publication";

type Paragraph = PortableTextBlock<Record<string, unknown> & { _type: string; _key: string }, PortableTextSpan>;
type Callout = { heading?: string; title?: string; style?: string; body?: Paragraph[] | string };

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
