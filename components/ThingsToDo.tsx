import groupAudience from "@/lib/facebook-group.json";
import Link from "next/link";
import { DirectionIcon } from "./DirectionIcon";
import { StoryImage, StoryPreview } from "./Publication";
import { calendar, occurrencePath, type EventOccurrence } from "@/lib/events";
import { localClock, shift, zone } from "@/lib/event-time";
import { facebookGroup } from "@/lib/gwinnett";
import { isGuide, storyHref, type Story } from "@/lib/publication";

const outings = [
  {
    city: "Lawrenceville",
    name: "Tribble Mill Park",
    description: "Bring a bike for the 3.4-mile paved trail or a fishing rod for the lake. The playground and picnic pavilions are at the Tribble Mill Parkway entrance.",
    action: "Park entrances and trails",
    href: "https://www.gwinnettcounty.com/government/departments/parks-recreation/parks/tribble-mill",
  },
  {
    city: "Duluth",
    name: "Southeastern Railway Museum",
    description: "See full-size locomotives and passenger cars on Buford Highway. If a train ride is the draw for your kids, check the departure times before you go.",
    action: "Museum hours and train rides",
    href: "https://www.train-museum.org/",
  },
  {
    city: "Sugar Hill",
    name: "The Eagle Theatre",
    description: "Pick a concert or a play on West Broad Street, then walk to dinner in downtown Sugar Hill. The box office lists showtimes and tickets by performance.",
    action: "Shows and tickets",
    href: "https://www.eagleatsugarhill.com/events-tickets/",
  },
];

const dateFormat = new Intl.DateTimeFormat("en-US", {
  timeZone: zone, weekday: "short", month: "short", day: "numeric",
});
const timeFormat = new Intl.DateTimeFormat("en-US", {
  timeZone: zone, hour: "numeric", minute: "2-digit",
});

async function upcomingEvents() {
  const now = Date.now();
  const today = localClock(now).slice(0, 10);
  const events = await calendar(today, shift(today, 13));
  const seen = new Set<string>();
  const picks: EventOccurrence[] = [];
  for (const event of events) {
    if (event.outsideGwinnett || Date.parse(event.startsAt) < now) continue;
    const key = JSON.stringify([event.title, event.venue || event.street, event.city || event.neighborhood]).toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    picks.push(event);
    if (picks.length === 4) break;
  }
  return picks;
}

export default async function ThingsToDo({ stories, filtered }: { stories: Story[]; filtered: boolean }) {
  const [lead, ...more] = stories;
  const events = await upcomingEvents();
  return (
    <main id="main" className="site-width page-content things-page">
      <header className="things-intro">
        <h1>Things to do in Gwinnett</h1>
        <p>Walk a trail in Lawrenceville, catch a show in Sugar Hill, or find a meetup close to home.</p>
        <div className="things-actions">
          <Link className="button button-orange" href="/events">Browse the events calendar</Link>
          <a className="text-link" href="#places-to-go">Places to go</a>
        </div>
      </header>

      <div className={lead || filtered ? "things-lead-layout" : "things-events-only"}>
        {lead ? (
          <article className="things-feature">
            <Link href={storyHref(lead)} aria-labelledby="things-feature-title">
              <StoryImage story={lead} priority />
              <p className="story-label">{isGuide(lead) ? "Featured guide" : "Featured story"}</p>
              <h2 id="things-feature-title">{lead.title}</h2>
              {lead.excerpt && <p className="things-feature-deck">{lead.excerpt}</p>}
              <span className="text-link">{isGuide(lead) ? "Read the guide" : "Read the story"} <DirectionIcon /></span>
            </Link>
          </article>
        ) : filtered && (
          <section className="things-filter-empty">
            <h2>No stories match these filters</h2>
            <Link className="text-link" href="/things-to-do">Clear story filters</Link>
          </section>
        )}

        <section className="things-events" aria-labelledby="things-events-title">
          <h2 id="things-events-title">Coming up in Gwinnett</h2>
          {events.length > 0 ? (
            <ul>
              {events.map(event => (
                <li key={occurrencePath(event)}>
                  <time dateTime={event.startsAt}>{dateFormat.format(new Date(event.startsAt))} · {timeFormat.format(new Date(event.startsAt))}</time>
                  <h3><Link href={occurrencePath(event)}>{event.title}</Link></h3>
                  <p>{[event.venue, event.city || event.neighborhood].filter(Boolean).join(" · ")}</p>
                </li>
              ))}
            </ul>
          ) : <p>No upcoming dates listed for the next two weeks. <Link href="/events?view=month">See the monthly calendar.</Link></p>}
          <Link className="text-link" href="/events/submit">Submit an event</Link>
        </section>
      </div>

      <section id="places-to-go" className="things-places" aria-labelledby="things-places-title">
        <h2 id="things-places-title">Places to go in Gwinnett</h2>
        <div className="things-places-grid">
          {outings.map(place => (
            <article key={place.href}>
              <p className="story-label">{place.city}</p>
              <h3>{place.name}</h3>
              <p>{place.description}</p>
              <a className="text-link" href={place.href}>{place.action} <DirectionIcon external /></a>
            </article>
          ))}
        </div>
      </section>

      {more.length > 0 && (
        <section className="things-more" aria-labelledby="things-more-title">
          <h2 id="things-more-title">More from Things to do</h2>
          {more.map(story => (
            <div className="things-story-row" key={story._id}>
              {story.image?.asset && <StoryImage story={story} />}
              <StoryPreview story={story} />
            </div>
          ))}
        </section>
      )}

      <aside className="things-community" aria-labelledby="things-community-title">
        <h2 id="things-community-title">Ask your Gwinnett neighbors</h2>
        <p>Need a rainy-day outing for a four-year-old or a date night near Buford? Ask the <strong>{groupAudience.memberCountDisplay} members</strong> of the All Things Gwinnett Facebook group. Mention your city and who’s coming along.</p>
        <a className="button button-ink" href={facebookGroup}>Join the Facebook group</a>
      </aside>
    </main>
  );
}
