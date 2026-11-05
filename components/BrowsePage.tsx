import { DirectionIcon } from "@/components/DirectionIcon";
import Link from "next/link";
import {
  getPublication,
  sections,
  sectionOf,
  isGuide,
  safeUrl,
  formatDate,
} from "@/lib/publication";
import { EmptyState, StoryPreview } from "./Publication";
export const TITLES: Record<string, string> = {
  "food-drink": "Food & drink",
  "things-to-do": "Things to do",
  "local-life": "Local life",
  guides: "Guides to Gwinnett",
  directory: "Independent businesses",
  events: "Upcoming events",
  areas: "Explore by area",
  search: "Search Gwinnett",
};
const DESCRIPTIONS: Record<string, string> = {
  "food-drink":
    "Good food, honest opinions, and a little help deciding what to order.",
  "things-to-do": "Find a reason to get out, meet up, and make a local plan.",
  "local-life": "The people, decisions, and everyday changes shaping Gwinnett.",
  guides: "Useful local knowledge, all in one place.",
  directory:
    "Discover independent businesses around Gwinnett. Owner-submitted listings are not editorial endorsements.",
  events: "Local plans, with the practical details up front.",
  areas: "Find stories and businesses close to you.",
  search:
    "Look through our stories, guides, upcoming events, and independent businesses.",
};
export type Filters = {
  q?: string;
  format?: string;
  topic?: string;
  category?: string;
  area?: string;
};
export default async function BrowsePage({
  kind,
  filters = {},
}: {
  kind: string;
  filters?: Filters;
}) {
  const data = await getPublication(),
    query = (filters.q || "").trim().slice(0, 100);
  let stories = data.stories;
  if (sections.some((x) => x.slug === kind))
    stories = stories.filter((s) => sectionOf(s) === kind);
  if (kind === "guides" || filters.format === "guide")
    stories = stories.filter(isGuide);
  else if (filters.format)
    stories = stories.filter((s) => s.format === filters.format);
  if (filters.topic) stories = stories.filter((s) => s.topic === filters.topic);
  if (filters.area)
    stories = stories.filter((s) => s.location === filters.area);
  let businesses = data.businesses
    .filter((b) => !filters.category || b.category === filters.category)
    .filter((b) => !filters.area || b.neighborhood === filters.area);
  let events = data.events;
  if (kind === "search") {
    const term = query.toLocaleLowerCase();
    stories = query
      ? stories.filter((s) =>
          [
            s.title,
            s.excerpt,
            s.location,
            ...(s.categories || []).map((c) => c.title),
          ]
            .join(" ")
            .toLowerCase()
            .includes(term),
        )
      : [];
    businesses = query
      ? businesses.filter((b) =>
          [b.name, b.summary, b.neighborhood, b.category]
            .join(" ")
            .toLowerCase()
            .includes(term),
        )
      : [];
    events = query
      ? events.filter((e) =>
          [e.title, e.summary, e.venue, e.neighborhood]
            .join(" ")
            .toLowerCase()
            .includes(term),
        )
      : [];
  }
  const areas = Array.from(
    new Set(
      [
        ...data.stories.map((s) => s.location),
        ...data.businesses.map((b) => b.neighborhood),
      ].filter((s): s is string => !!s),
    ),
  ).sort();
  return (
    <main id="main" className="site-width page-content">
      <h1>{TITLES[kind]}</h1>
      <p className="page-deck">{DESCRIPTIONS[kind]}</p>
      {kind === "search" && (
        <form action="/search" className="search-form" role="search">
          <label htmlFor="query" className="sr-only">
            Search term
          </label>
          <input
            autoFocus
            id="query"
            name="q"
            defaultValue={query}
            type="search"
            placeholder="A dish, a place, a local story…"
            maxLength={100}
          />
          <button className="button button-orange">Search</button>
        </form>
      )}
      {kind === "areas" && (
        <>
          {areas.length ? (
            <nav className="filter-links" aria-label="Areas">
              {areas.map((area) => (
                <Link
                  key={area}
                  href={`/areas?area=${encodeURIComponent(area)}`}
                  aria-current={filters.area === area ? "page" : undefined}
                >
                  {area}
                </Link>
              ))}
            </nav>
          ) : (
            <EmptyState title="Neighborhood guides are on the way.">
              As we publish local coverage, you’ll be able to explore it here by
              area.
            </EmptyState>
          )}
        </>
      )}
      {kind === "directory" && (
        <>
          <nav className="filter-links" aria-label="Business categories">
            <Link
              href="/directory"
              aria-current={!filters.category ? "page" : undefined}
            >
              All businesses
            </Link>
            {Array.from(
              new Set(data.businesses.map((b) => b.category).filter(Boolean)),
            ).map((c) => (
              <Link
                key={c}
                href={`/directory?category=${encodeURIComponent(c!)}`}
                aria-current={filters.category === c ? "page" : undefined}
              >
                {c}
              </Link>
            ))}
            <Link href="/directory/submit">List your business</Link>
          </nav>
          {!businesses.length && (
            <EmptyState title="Our local directory is taking shape.">
              Independent restaurants, beauty professionals, and local services
              will be listed here.{" "}
              <Link href="/directory/submit">
                Learn about listing your business.
              </Link>
            </EmptyState>
          )}
        </>
      )}
      {(kind === "directory" || kind === "search" || kind === "areas") &&
        businesses.length > 0 && (
          <section className="business-list" aria-label="Businesses">
            {businesses.map((b) => (
              <article key={b._id}>
                <p className="story-label">
                  {b.category || "Independent business"}
                </p>
                <h2>
                  <Link href={`/directory/${encodeURIComponent(b.slug)}`}>
                    {b.name}
                  </Link>
                </h2>
                <p>{b.summary}</p>
                {b.neighborhood && <p className="quiet">{b.neighborhood}</p>}
              </article>
            ))}
          </section>
        )}
      {(kind === "events" || kind === "search") && (
        <>
          {events.length ? (
            <section className="results" aria-label="Events">
              {events.map((e) => (
                <article key={e._id} className="story-preview">
                  <p className="story-label">
                    <time dateTime={e.startsAt}>{formatDate(e.startsAt)}</time>
                    {e.priceLabel ? ` · ${e.priceLabel}` : ""}
                  </p>
                  <h2>
                    {safeUrl(e.url) ? (
                      <a href={safeUrl(e.url)!}>
                        {e.title} <DirectionIcon external />
                      </a>
                    ) : (
                      e.title
                    )}
                  </h2>
                  <p>{[e.venue, e.neighborhood].filter(Boolean).join(" · ")}</p>
                  <p>{e.summary}</p>
                </article>
              ))}
            </section>
          ) : (
            kind === "events" && (
              <EmptyState title="No upcoming events listed yet.">
                We’re getting the calendar ready. Check back for local plans.
              </EmptyState>
            )
          )}
        </>
      )}
      {!["events", "directory"].includes(kind) && (
        <section className="results" aria-label="Stories">
          {stories.map((s) => (
            <StoryPreview key={s._id} story={s} />
          ))}
          {!stories.length && !["areas", "search"].includes(kind) && (
            <EmptyState title="The first stories are on the way.">
              We’re building this section with useful, locally grounded
              coverage. In the meantime,{" "}
              <a href="https://www.facebook.com/groups/allthingsgwinnett">
                join the conversation in our Facebook group.
              </a>
            </EmptyState>
          )}
        </section>
      )}
      {kind === "search" &&
        (!query ? (
          <p>Enter a search term to get started.</p>
        ) : !stories.length && !businesses.length && !events.length ? (
          <EmptyState title={`No results for “${query}”.`}>
            Try a different word, <Link href="/guides">browse our guides</Link>,
            or <Link href="/areas">explore by area</Link>.
          </EmptyState>
        ) : (
          <p className="quiet">
            {stories.length + businesses.length + events.length} results
          </p>
        ))}
    </main>
  );
}
