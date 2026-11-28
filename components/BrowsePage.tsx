import ListingLogo from "@/components/ListingLogo";
import DirectoryHub from "./DirectoryHub";
import {branchName, resolveBranch} from "@/lib/directory/branch";
import {getBranchIndex} from "@/lib/directory/branch-records";
import AtgVerified from "./AtgVerified";
import IndependentProBadge from "@/components/IndependentProBadge";
import SectionFront from "./SectionFront";
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
  group?: string;
  all?: string;
  city?: string;
  format?: string;
  topic?: string;
  category?: string;
  service?: string;
  provider?: string;
  area?: string;
};
async function labelBranches(businesses: Awaited<ReturnType<typeof getPublication>>["businesses"]) {
  if (!businesses.length) return businesses;
  const index = await getBranchIndex();
  return businesses.map(b => ({...b, branch: resolveBranch(b, index).branch}));
}

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
  if (kind === "food-drink" || kind === "local-life" || kind === "things-to-do") {
    return <SectionFront section={kind} stories={stories} businesses={kind === "food-drink" ? await labelBranches(data.businesses) : data.businesses}
      filtered={Boolean(filters.format || filters.topic || filters.area)} />;
  }
  const directoryBusinesses = ["search","areas"].includes(kind) ? [...data.businesses,...await directoryPublic()].sort((a,b)=>Number(!!b.premium)-Number(!!a.premium) || a.name.localeCompare(b.name)) : data.businesses;
  const rawArea = kind !== "directory" && typeof filters.area === "string" ? filters.area : "";
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
  if (["directory", "search", "areas"].includes(kind)) businesses = await labelBranches(businesses);
  if (kind === "directory") return <DirectoryHub businesses={businesses} filters={{...filters,q:query}} unsupported={unsupportedLocation}/>;
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
          [branchName(b), b.name, b.branch?.label, b.address, b.summary, b.neighborhood, b.category,...(b.categories||[]),...(b.services||[])]
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
      {(kind === "search" || kind === "areas") &&
        businesses.length > 0 && (
          <section className="business-list" aria-label="Businesses">
            {businesses.map((b) => (
              <article key={b._id}>
                <div className="business-card-heading">
                  <ListingLogo src={b.logo} size={56} />
                  <div>
                    <p className="story-label">{b.category || "Community directory"}</p>{b.providerType === "independent" && <IndependentProBadge />} {b.premium && <AtgVerified/>}
                    <h2><Link href={`/directory/${encodeURIComponent(b.slug)}`} aria-label={b.branch ? branchName(b) : undefined}>
                      {branchName(b)}
                    </Link></h2>
                  </div>
                </div>
                {b.summary && <p className="business-excerpt">{b.summary}</p>}
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
