import Link from "next/link";
import { calendar, occurrencePath } from "@/lib/events";
import { localClock, shift } from "@/lib/event-time";
import { storyHref, formatDate, type Story } from "@/lib/publication";
import { facebookGroup } from "@/lib/gwinnett";
import audience from "@/lib/facebook-group.json";
import { StoryImage } from "./Publication";
import "./local-life.css";

export default async function LocalLife({ stories, filtered }: { stories: Story[]; filtered: boolean }) {
  const [lead, ...rest] = stories;
  const now = Date.now();
  const today = localClock(now).slice(0, 10);
  const seen = new Set<string>();
  const events = (await calendar(today, shift(today, 45))).filter(event => {
    if (event.outsideGwinnett || Date.parse(event.endsAt || event.startsAt) < now || seen.has(event._id)) return false;
    seen.add(event._id);
    return true;
  }).slice(0, 4);

  return <main id="main" className="site-width ll-desk">
    <div className="ll-heading"><h1>Local life</h1><p>Schools, neighborhoods, and everyday life in Gwinnett County.</p></div>
    {lead ? <article className={"ll-feature" + (lead.image ? "" : " ll-text-only")}>
      {lead.image && <Link className="ll-visual" href={storyHref(lead)} aria-label={lead.title}><StoryImage story={lead} priority /></Link>}
      <div className="ll-feature-copy">
        {lead.topic === "schools-development" && <p className="ll-kicker">Schools &amp; development</p>}
        <h2><Link href={storyHref(lead)}>{lead.title}</Link></h2>
        {lead.excerpt && <p>{lead.excerpt}</p>}
        {lead.publishedAt && <time dateTime={lead.publishedAt}>{formatDate(lead.publishedAt)}</time>}
        <Link href={storyHref(lead)} className="ll-read">Read the story <span aria-hidden="true">→</span></Link>
      </div></article> : <p>{filtered ? "No stories match this selection yet." : "Local life coverage is on its way."} {filtered && <Link href="/local-life">See all Local life stories</Link>}</p>}
    {rest.length > 0 && <section className="ll-more"><h2>More local stories</h2><div>{rest.map(s=><article key={s._id}><Link href={storyHref(s)}><StoryImage story={s}/><h3>{s.title}</h3></Link>{s.excerpt && <p>{s.excerpt}</p>}</article>)}</div></section>}
    <div className="ll-lower"><section className="ll-events"><div className="ll-section-head"><h2>Coming up in Gwinnett</h2><Link href="/events">Full calendar →</Link></div>
      {events.length ? <ul>{events.map(e=>{
        const date = new Date(e.startsAt);
        const where = [e.venue,e.city || e.neighborhood].filter(Boolean).join(" · ");
        return <li key={e._id}><Link href={occurrencePath(e)}><time dateTime={e.startsAt}><small>{date.toLocaleString("en-US",{month:"short",timeZone:"America/New_York"})}</small><strong>{Number(e.day.slice(-2))}</strong></time><div><h3>{e.title}</h3>{where && <p>{where}</p>}{e.day < today && <small>Ongoing</small>}</div><span aria-hidden="true">→</span></Link></li>;
      })}</ul> : <p>Explore the <Link href="/events/gcps">GCPS school calendar</Link> for upcoming school dates.</p>}
    </section><aside className="ll-group"><span className="ll-kicker">All Things Gwinnett on Facebook</span><h2>Ask your neighbors.</h2><p>Join <strong>{audience.memberCountDisplay} members</strong> sharing local recommendations, answering questions, and talking about what’s happening around Gwinnett.</p><a href={facebookGroup} target="_blank" rel="noopener noreferrer">Join the Facebook group <span aria-hidden="true">↗</span></a></aside></div>
  </main>;
}
