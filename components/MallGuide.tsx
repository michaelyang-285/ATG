import Link from "next/link";
import { safeUrl } from "@/lib/publication";
import { StoryCallout } from "./StoryCallout";
import "@/styles/mall-guide.css";

type Span = { _key?: string; text?: string; marks?: string[] };
type Block = { _key: string; _type?: string; style?: string; heading?: string; children?: Span[]; body?: Block[]; markDefs?: { _key: string; href?: string }[] };
type Reference = { href: string; text: string };

export function guideText(row: Block) {
  return (row.children || []).map(span => span.text || "").join("");
}

export function GuideMenu({ blocks }: { blocks: Block[] }) {
  const headings = blocks.filter(block => block.style === "h2");
  return <nav className="mall-menu" aria-label="Guide contents"><details open>
    <summary>Jump to a section</summary>
    <ol>{headings.map(block => <li key={block._key}><a href={"#" + block._key}>{guideText(block)}</a></li>)}</ol>
  </details></nav>;
}

// Only detach a run of citations following a complete sentence. Links within prose keep their place.
export function formatGuideParagraph(block: Block) {
  if (/^source-\d+$/.test(block._key)) return { ...block, listItem: "number", level: 1 };
  const spans = block.children || [];
  const references: Reference[] = [];
  let start = spans.length;
  for (let i = spans.length - 1; i > 0; i -= 2) {
    const span = spans[i];
    const mark = block.markDefs?.find(def => span.marks?.includes(def._key));
    const href = mark?.href || "";
    if (!span.text || !(safeUrl(href) || /^\/(?![\/\\])/.test(href))) break;
    references.unshift({ href, text: span.text });
    start = i;
    if (spans[i - 1].text?.trim() !== "·") break;
  }
  if (!references.length || !/[.!?]\s*$/.test(spans[start - 1]?.text || "")) return block;
  return { ...block, children: [...spans.slice(0, start), { _type: "mallCitations", _key: "citations-" + block._key, references }] };
}

export function GuideCitations({ references }: { references: Reference[] }) {
  return <span className="mall-citations">
    {references.map(({ href, text }, i) => <span key={href + text}>
      {i > 0 && <span aria-hidden="true" className="mall-separator"> · </span>}
      <a href={href}>{text}</a>
    </span>)}
  </span>;
}

export function GuideImageCaption({ caption, sourceHref, fullSizeHref }: { caption?: string; sourceHref?: string; fullSizeHref?: string }) {
  if (!caption) return null;
  const [description, credit] = caption.split(/\s+Source:\s+/, 2);
  const page = credit?.match(/PDF p\. (\d+)/i)?.[1];
  const source = safeUrl(sourceHref);
  const href = source && page ? source.split("#")[0] + "#page=" + page : source;
  return <figcaption className="mall-image-caption">
    {description}{fullSizeHref && <> <a className="mall-image-zoom" href={fullSizeHref}>Open full-size timeline</a></>}
    {credit && <span className="mall-credit">Source: {href ? <a href={href}>{credit}</a> : credit}</span>}
  </figcaption>;
}

export function MallGuideFigure({ value, noteId }: { value: Block; noteId?: string }) {
  if (value._key === "newsletter-cta") return <aside className="mall-signup"><h2>{value.heading}</h2>
    {value.body?.map(row => <p key={row._key}>{guideText(row)}</p>)}<Link className="button button-orange" href="/newsletter#newsletter">Sign up for the newsletter</Link></aside>;

  if (!value._key.startsWith("chart-")) return <div className="mall-table" id={value._key} role="group" aria-label={value.heading} aria-describedby={noteId}>
    <StoryCallout value={value as Parameters<typeof StoryCallout>[0]["value"]} />
  </div>;

  const [header, ...rows] = (value.body ?? []).map(row => guideText(row).split("\n"));
  const amounts = rows.map(row => Number(row[1].replace(/[^0-9.]/g, "")));
  const max = Math.max(...amounts, 1);
  return <figure className="mall-chart" id={value._key} aria-describedby={noteId}>
    <figcaption>{value.heading}</figcaption>
    <p className="mall-unit">{header?.[1]}</p>
    <ul>{rows.map(([name, display], i) => <li key={name}>
      <div><span>{name}</span><b>{display}</b></div>
      <div className="mall-track" aria-hidden="true"><i style={{ width: (amounts[i] / max * 100) + "%" }} /></div>
    </li>)}</ul>
  </figure>;
}
