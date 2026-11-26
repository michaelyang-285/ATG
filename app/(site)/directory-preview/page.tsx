import type {Metadata} from "next";
import {notFound} from "next/navigation";
import examples from "@/lib/directory/share-pilot.json";
import {pilotCard, pilotEnabled} from "@/lib/directory/share-pilot-metadata";
import "./preview.css";

export const metadata: Metadata = {
  title: {absolute: "Directory previews | All Things Gwinnett"},
  robots: {index: false, follow: false},
};

export default function DirectoryPreview() {
  if (!pilotEnabled) notFound();
  return <main id="main" className="preview-sheet">
    <h1>Directory previews</h1>
    {examples.map(entry => <section key={entry.slug} aria-labelledby={entry.slug}>
      <h2 id={entry.slug}>{entry.name}</h2>
      <div className="preview-pair">
        <div>
          <h3>Social preview</h3>
          <figure><a href={pilotCard(entry.slug)} aria-label={`Open the full-size card for ${entry.name}`}>
            <img src={pilotCard(entry.slug)} width="1200" height="630" alt={`${entry.name}, ${entry.specialty}, ${entry.location}. ${entry.artDescription}`}/>
          </a><figcaption><small>All Things Gwinnett</small><strong>{entry.ogTitle}</strong><p>{entry.ogDescription}</p></figcaption></figure>
        </div>
        <div>
          <h3>Search preview</h3>
          <div className="preview-search"><small>allthingsgwinnett.com › directory</small>
            <a href={`/directory/${entry.slug}`}>{entry.seoTitle}</a><p>{entry.seoDescription}</p>
          </div>
          <a className="preview-link" href={`/directory/${entry.slug}`}>View listing</a>
        </div>
      </div>
    </section>)}
  </main>;
}
