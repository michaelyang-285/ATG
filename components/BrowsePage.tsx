import IndependentProBadge from "@/components/IndependentProBadge";
import LocalLife from "./LocalLife";
import ThingsToDo from "./ThingsToDo";
import { places, resolveArea, zipAreas } from "@/lib/directory/locations";
import {directoryPublic, searchDirectory} from "@/lib/directory/public";
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
  directory: "Gwinnett directory",
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
    "Find local businesses, independent pros, and community organizations across Gwinnett County.",
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
  service?: string;
  provider?: string;
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
    query = (typeof filters.q === "string" ? filters.q : "").trim().slice(0, 100);
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
  if (kind === "local-life") {
    return <LocalLife stories={stories} filtered={Boolean(filters.format || filters.topic || filters.area)} />;
  }
  if (kind === "things-to-do") {
    return <ThingsToDo stories={stories} filtered={Boolean(filters.format || filters.topic || filters.area)} />;
  }
  const directoryBusinesses = ["search","areas"].includes(kind) ? [...data.businesses,...await directoryPublic()].sort((a,b)=>a.name.localeCompare(b.name)) : data.businesses;
  const rawArea = kind !== "directory" && typeof filters.area === "string" ? filters.area : "";
  const countyLink = {pathname: "/directory", query: {provider: filters.provider, q: query || undefined, category: filters.category, service: filters.service}};
  let businesses = directoryBusinesses
    .filter((b) => !filters.category || b.category === filters.category || b.categories?.includes(filters.category))
    .filter(b => !filters.service || b.services?.includes(filters.service))
    .filter(b => !rawArea || b.neighborhood?.split(",").some(city => city.trim().toLowerCase() === rawArea.toLowerCase()));
  let unsupportedLocation = "";
  if (kind === "directory") {
    let terms = query;
    let searchAreas: string[] | null = null;
    const location = terms.match(/(?:^|\s)(?:in|near|around)\s+(.+)$/i);
    if (location) {
      const inferred = resolveArea(location[1]);
      if (inferred?.length === 0) unsupportedLocation = location[1];
      searchAreas = inferred;
      terms = terms.slice(0, location.index).trim();
    } else {
      const suffix = [...places, ...Object.keys(zipAreas)].find(place => terms.toLowerCase().endsWith(" " + place.toLowerCase()) || terms.toLowerCase() === place.toLowerCase());
      if (suffix) {
        searchAreas = resolveArea(suffix);
        terms = terms.slice(0, -suffix.length).trim();
      }
    }
    const mobile = /\bmobile\b/i.test(terms);
    if (mobile) terms = terms.replace(/\bmobile\b/gi, " ").trim();
    businesses = await searchDirectory(terms, searchAreas, filters.category || "", mobile ? "Mobile" : filters.service || "", data.businesses);
    if (filters.provider === "independent") businesses = businesses.filter(b => b.providerType === "independent");
  }
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
          [b.name, b.summary, b.neighborhood, b.category,...(b.categories||[]),...(b.services||[])]
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
          <section className="directory-tools" aria-label="Find a listing"><form className="directory-find" role="search" aria-label="Search directory listings" action="/directory">
            <label>What are you looking for?<input type="search" name="q" defaultValue={query} maxLength={100} placeholder="Mobile barber, math tutor, or coffee shop"/></label>
            <button className="button button-orange">Search directory</button></form>
            {(filters.provider === "independent" || filters.category || filters.service) && <p className="directory-context">Showing {([filters.provider === "independent" && "independent pros", filters.service, filters.category].filter(Boolean).join(" · "))}. <Link href="/directory">Browse all listings</Link></p>}
          </section>
          {unsupportedLocation ? (
            <EmptyState title="We only cover Gwinnett County right now.">We couldn’t match “{unsupportedLocation}” to a local city or ZIP. <Link href={{...countyLink, query: {...countyLink.query, q: query.replace(/(?:^|\s)(?:in|near|around)\s+(.+)$/i, "").trim()}}}>Search all of Gwinnett</Link></EmptyState>
          ) : (query || filters.category || filters.service || filters.provider==="independent") && !businesses.length ? (
            <EmptyState title="No listings found."><Link href="/directory">Browse all listings</Link></EmptyState>
          ) : !businesses.length && (
            <EmptyState title="Our local directory is taking shape.">
              Independent restaurants, beauty professionals, and local services
              will be listed here.
            </EmptyState>
          )}
        </>
      )}
      {(kind === "directory" || kind === "search" || kind === "areas") &&
        businesses.length > 0 && (
          <section className="business-list" aria-label="Businesses">
            {businesses.map((b) => (
              <article key={b._id}>
                <div className="business-card-heading">
                  <img
                    src={b.logo || "/brand/atg-avatar.png"}
                    alt=""
                    width="56"
                    height="56"
                    style={{objectFit:"contain", ...(b.logo ? {} : {filter:"grayscale(1)", opacity:0.5})}}
                  />
                  <div>
                    <p className="story-label">{b.category || "Community directory"}</p>{b.providerType === "independent" && <IndependentProBadge />}
                    <h2><Link href={`/directory/${encodeURIComponent(b.slug)}`}>{b.name}</Link></h2>
                  </div>
                </div>
                {b.summary && <p className="business-excerpt">{b.summary}</p>}
                {kind === "directory" && (
                  <Link className="business-card-cta button button-orange" href={`/directory/${encodeURIComponent(b.slug)}`}
                    aria-label={`View profile for ${b.name}`}>View profile</Link>
                )}
              </article>
            ))}
          </section>
        )}
      {kind === "directory" && (
        <aside className="directory-owner-tools" aria-labelledby="business-owners">
          <h2 id="business-owners">For businesses and independent providers</h2>
          <div><Link href="/directory/submit">Add your listing</Link><Link href="/account?mode=signin">Manage my listings</Link></div>
        </aside>
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
