import { PortableText, toPlainText } from "@portabletext/react";
import type { Story } from "@/lib/publication";
import { formatDate, imageUrl, safeUrl } from "@/lib/publication";
import ChartControls from "./ChartControls";
import figures from "./figures.json";
import datasets from "./datasets.json";
import "./schools.css";

const layout: Record<string, {id?:string; figure?:string; markup?:string}> = figures;

export default function SchoolsFeature({story}: {story: Story}) {
  const blocks = story.body || [];
  const hero = imageUrl(story.image);
  const canonical = "https://allthingsgwinnett.com/stories/" + story.slug;
  const questions = blocks.flatMap((block, index) => block.style === "h3" && blocks[index+1] ? [{
    "@type": "Question", name: toPlainText(block), acceptedAnswer: {"@type":"Answer", text: toPlainText(blocks[index+1])}
  }] : []);
  const graph = {"@context":"https://schema.org","@graph":[
    {"@type":"Article","@id":canonical+"#article",headline:story.title,description:story.seo?.description || story.excerpt,
      author:{"@type":"Person",name:story.author?.name},publisher:{"@type":"Organization",name:"All Things Gwinnett"},datePublished:story.publishedAt,
      citation:blocks.filter(b=>layout[b._key]?.id?.startsWith("source-")).flatMap(b=>b.markDefs.map((m:{href:string})=>m.href)),hasPart:datasets.map(d=>({"@id":d["@id"]}))},
    ...datasets, {"@type":"FAQPage",mainEntity:questions}
  ]};
  const introIndex = blocks.findIndex(block => block._key === "gcps4");
  const summaryEnd = introIndex > 0 && toPlainText(blocks[0]).trim() === "TL;DR" ? introIndex : -1;
  function renderBlock(block: (typeof blocks)[number]) {
      const item=layout[block._key];
      const content=<PortableText value={[block]} components={{marks:{link:({value,children})=>{
        const href=safeUrl(value?.href);
        return href ? <a href={href} target={href.startsWith("https://allthingsgwinnett.com/")?undefined:"_blank"} rel="noopener">{children}</a> : <>{children}</>;
      }}}} />;
      if(item?.figure) return <figure key={block._key} id={item.figure} className={item.figure==="household-map"?undefined:"ex"}><figcaption>{toPlainText(block)}</figcaption><div dangerouslySetInnerHTML={{__html:item.markup || ""}} /></figure>;
      return <div key={block._key} id={item?.id}>{content}{item?.markup && <nav aria-label="In this article" className="contents" dangerouslySetInnerHTML={{__html:item.markup}} />}</div>;
  }
  return <div className="gcps-feature">
    <script type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify(graph).replace(/</g,"\\u003c")}} />
    <header><a href="/local-life">Local Life</a><h1>{story.title}</h1><div className="meta">Education · By {story.author?.name} · {story.publishedAt && formatDate(story.publishedAt)}</div>
    {hero && <img className="hero" src={hero} alt={story.image?.alt || ""} />}</header>
    <main id="main"><article>
      {summaryEnd >= 0 && <aside className="story-summary" aria-label="Article summary">
        {blocks.slice(0, summaryEnd).map(renderBlock)}
      </aside>}
      {blocks.slice(Math.max(0, summaryEnd)).map(renderBlock)}
    </article></main><ChartControls />
  </div>;
}
