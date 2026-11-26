import Link from "next/link";
import { facebookGroup } from "@/lib/gwinnett";
import group from "@/lib/facebook-group.json";
import { formatDate, isGuide, storyHref, type Business, type Story } from "@/lib/publication";
import { DirectionIcon } from "./DirectionIcon";
import { StoryImage } from "./Publication";
import CalendarHighlights from "./CalendarHighlights";
import SectionAgenda from "./SectionAgenda";
import PlacesToGo from "./PlacesToGo";
import "./section-front.css";

const sections = {
  "food-drink": {
    title: "Food & drink",
    deck: "Where to eat, what to order, and where to shop for dinner in Gwinnett.",
    explore: "Find your next stop",
    links: [["Local food directory", "/directory?category=Food"], ["Markets & grocers", "/directory?q=market"], ["Send a food tip", "/contact"]],
    more: "More food stories",
    community: "Where should we eat next?",
    prompt: "Tell your neighbors about a dish worth crossing the county for. Give the restaurant, the city, and your order.",
  },
  "things-to-do": {
    title: "Things to do",
    deck: "Make a plan in Gwinnett, from a morning on the trails to a show in downtown Sugar Hill.",
    explore: "Plan an outing",
    links: [["Events calendar", "/events"], ["Parks, museums & shows", "#places-to-go"], ["Submit an event", "/events/submit"]],
    more: "More outings & guides",
    community: "What’s happening near you?",
    prompt: "Ask for a rainy-day outing, a date-night idea, or somewhere to take the kids. Mention your city so neighbors know where to start.",
  },
  "local-life": {
    title: "Local life",
    deck: "Schools, neighborhoods, and the numbers behind the changes you see across Gwinnett.",
    explore: "Around the county",
    links: [["GCPS school dates", "/events/gcps"], ["Library programs", "/events/gwinnett-libraries"], ["Explore by area", "/areas"]],
    more: "More local stories",
    community: "What’s changing in your neighborhood?",
    prompt: "Bring your school questions, share what you’ve noticed on your street, or ask someone who’s lived here a little longer.",
  },
};
type Section = keyof typeof sections;

function Feature({ story }: { story: Story }) {
  const href = storyHref(story);
  return <article className={story.image?.asset ? "sf-feature" : "sf-feature sf-feature-text"}>
    {story.image?.asset && <div className="sf-picture"><StoryImage story={story} priority /></div>}
    <div className="sf-feature-copy">
      <h2><Link href={href} className="sf-feature-link">{story.title}</Link></h2>
      <p className="sf-byline">
        {story.author?.name && <span>By {story.author.name}</span>}
        {story.publishedAt && <time dateTime={story.publishedAt}>{formatDate(story.publishedAt)}</time>}
      </p>
      {story.excerpt && <p className="sf-excerpt">{story.excerpt}</p>}
      <span className="sf-read" aria-hidden="true">{isGuide(story) ? "Read the guide" : "Read the story"} <DirectionIcon /></span>
    </div>
  </article>;
}

function MoreStories({ stories, heading }: { stories: Story[]; heading: string }) {
  if (!stories.length) return null;
  return <section><h2>{heading}</h2><ul className="sf-stories">
    {stories.map(story => <li key={story._id}>
      {story.image?.asset && <div className="sf-thumb"><StoryImage story={story} /></div>}
      <div><h3><Link href={storyHref(story)}>{story.title}</Link></h3>
        {story.publishedAt && <time dateTime={story.publishedAt}>{formatDate(story.publishedAt)}</time>}
        {story.excerpt && <p>{story.excerpt}</p>}</div>
    </li>)}
  </ul></section>;
}

function FoodListings({ businesses }: { businesses: Business[] }) {
  const seen = new Set<string>();
  const food = businesses.filter(b => {
    if (b.category !== "Food" || seen.has(b.name)) return false;
    seen.add(b.name);
    return true;
  });
  const market = food.find(b => /market|grocer/i.test(b.name));
  const picks = market ? [market, ...food.filter(b => b !== market)].slice(0, 4) : food.slice(0, 4);
  if (!picks.length) return null;
  return <section><h2>Restaurants &amp; markets</h2>
    <ul className="sf-listings">{picks.map(b => <li key={b._id}>
      <Link href={'/directory/' + encodeURIComponent(b.slug)}>
        {b.logo && <img src={b.logo} alt="" width="54" height="54" loading="lazy" />}
        <span><strong>{b.name}</strong>{b.neighborhood && <small>{b.neighborhood}</small>}</span><DirectionIcon />
      </Link></li>)}</ul></section>;
}

export default function SectionFront({ section, stories, businesses, filtered }: {
  section: Section; stories: Story[]; businesses: Business[]; filtered: boolean;
}) {
  const desk = sections[section];
  const [lead, ...more] = stories;
  return <main id="main" className="site-width section-front" data-section={section}>
    <header className="sf-mast"><h1>{desk.title}</h1><p>{desk.deck}</p></header>
    {lead ? <Feature story={lead} /> : <div className="sf-empty">
      <h2>{filtered ? "No stories match this selection." : "The first stories are on their way."}</h2>
      {filtered && <Link className="sf-action" href={'/' + section}>Clear story filters <DirectionIcon /></Link>}
    </div>}
    <div className="sf-columns">
      <div className="sf-feed">
        <MoreStories stories={more} heading={desk.more} />
        {section === "food-drink" ? <FoodListings businesses={businesses} /> : <SectionAgenda section={section} />}
        {section === "things-to-do" && <PlacesToGo />}
      </div>
      <nav className="sf-links" aria-label={desk.explore}><h2>{desk.explore}</h2>
        <ul>{desk.links.map(([label, href]) => <li key={href}><Link href={href}>{label}<DirectionIcon /></Link></li>)}</ul>
      </nav>
    </div>
    {section === "things-to-do" && <CalendarHighlights sectionFront />}
    <aside className="sf-community"><div><h2>{desk.community}</h2><p>{desk.prompt}</p></div>
      <a href={facebookGroup} target="_blank" rel="noopener noreferrer">Join {group.memberCountDisplay} neighbors <DirectionIcon external /></a>
    </aside>
  </main>;
}
