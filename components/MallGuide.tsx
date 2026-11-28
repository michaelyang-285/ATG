import Link from "next/link";
import {StoryCallout} from "./StoryCallout";
import "@/styles/mall-guide.css";

type Span = {text?:string};
type Block = { _key:string; _type?:string; style?:string; heading?:string; children?:Span[]; body?:Block[] };
export function guideText(row:Block) {
  return (row.children || []).map(s=>s.text || "").join("");
}
export function GuideMenu({blocks}:{blocks:Block[]}) {
  const headings = blocks.filter(b=>b.style==="h2");
  return <nav className="mall-menu" aria-label="Guide contents"><details open><summary>Jump to a section</summary><ol>
    {headings.map(b=><li key={b._key}><a href={"#"+b._key}>{guideText(b)}</a></li>)}
  </ol></details></nav>;
}
export function MallGuideFigure({value}:{value:Block}) {
  if(value._key==="newsletter-cta") return <aside className="mall-signup"><h2>{value.heading}</h2>
    {value.body?.map(row=><p key={row._key}>{guideText(row)}</p>)}<Link className="button button-orange" href="/newsletter#newsletter">Sign up for the newsletter</Link></aside>;
  if(!value._key.startsWith("chart-")) return <StoryCallout value={value as Parameters<typeof StoryCallout>[0]["value"]}/>;
  const [header,...rows]=(value.body??[]).map(r=>guideText(r).split("\n"));
  const amounts=rows.map(row=>Number(row[1].replace(/[^0-9.]/g,"")));
  const max=Math.max(...amounts,1);
  return <figure className="mall-chart" id={value._key}><figcaption>{value.heading}</figcaption>
   <p className="mall-unit">{header?.[1]}</p><ul>{rows.map(([name,display],i)=><li key={name}>
    <div><span>{name}</span><b>{display}</b></div><div className="mall-track" aria-hidden="true"><i style={{width:(amounts[i]/max*100)+"%"}} /></div>
   </li>)}</ul></figure>;
}
