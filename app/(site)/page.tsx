import {publisher,website,siteUrl} from "@/lib/publisher";
import WeekendPreview from "@/components/WeekendPreview";
import CalendarHighlights from "@/components/CalendarHighlights";
import groupAudience from "@/lib/facebook-group.json";
import { DirectionIcon } from "@/components/DirectionIcon";
import "./home.css";
import { facebookGroup } from "@/lib/gwinnett";
import Link from "next/link";
import {
  getPublication,
  isGuide,
  storyHref,
  storyLabel,
} from "@/lib/publication";
import { StoryImage, StoryPreview, Newsletter } from "@/components/Publication";
export const revalidate = 60;
export default async function HomePage() {
  const { stories, settings } = await getPublication();
  const featured = settings.featuredPost || stories.find(isGuide) || stories[0];
  const sidebar = (
    settings.sidebarPosts?.length ? settings.sidebarPosts : stories
  )
    .filter((s) => s._id !== featured?._id)
    .slice(0, 3);
  const guides = (
    settings.featuredGuides?.length
      ? settings.featuredGuides
      : stories.filter(isGuide)
  )
    .filter((s) => s._id !== featured?._id)
    .slice(0, 2);
  return (
    <main id="main" className="site-width homepage">
      <script type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify({"@context":"https://schema.org","@type":"WebPage","@id":siteUrl+"/#homepage",url:siteUrl+"/",name:publisher.name,isPartOf:{"@id":website["@id"]},about:{"@id":publisher["@id"]}})}}/>
      <a className="text-link" style={{ display: "flex", alignItems: "center", gap: ".45rem", paddingBlock: ".8rem", borderBottom: "1px solid currentColor" }} href={facebookGroup} target="_blank" rel="noopener noreferrer">
        <strong>{groupAudience.memberCountDisplay} members</strong> in our Facebook group <DirectionIcon />
      </a>
      <div className="lead-layout" style={{ marginTop: "1.25rem" }}>
        <section className="lead-story" aria-label="Featured story">
          {featured ? (
            <>
              <p className="story-label">{storyLabel(featured)}</p>
              <h1 className="featured-headline">
                <Link href={storyHref(featured)}>{featured.title}</Link>
              </h1>
              <Link href={storyHref(featured)} tabIndex={-1} aria-hidden="true">
                <StoryImage story={featured} priority />
              </Link>
              {featured.excerpt && (
                <p className="lead-deck">{featured.excerpt}</p>
              )}
              <Link className="text-link" href={storyHref(featured)}>
                {isGuide(featured) ? "Read the guide" : "Read the story"}{" "}
                <DirectionIcon />
              </Link>
            </>
          ) : (
            <>
              <div className="launch-art" aria-hidden="true">
                <img src="/brand/logo.svg" alt="" width="360" height="120" />
              </div>
              <h1>Good stories start close to home.</h1>
              <p className="lead-deck">
                We’re getting our first local stories and guides ready. Until
                then, the conversation is happening in our Facebook group.
              </p>
              <a
                className="text-link"
                href="https://www.facebook.com/groups/allthingsgwinnett"
              >
                Join the conversation <DirectionIcon />
              </a>
            </>
          )}
        </section>
        <aside className="latest-stories">
          <h2>Around Gwinnett</h2>
          {sidebar.length ? (
            sidebar.map((s) => <StoryPreview key={s._id} story={s} />)
          ) : (
            <>
              {[
                ["Food & drink", "Places worth a closer look.", "/food-drink"],
                [
                  "Things to do",
                  "More reasons to get out locally.",
                  "/things-to-do",
                ],
                [
                  "Local life",
                  "The changes and people shaping home.",
                  "/local-life",
                ],
              ].map(([title, body, href]) => (
                <div className="topic-preview" key={href}>
                  <h3>
                    <Link href={href}>{title}</Link>
                  </h3>
                  <p>{body}</p>
                  <span className="quiet">Stories coming soon</span>
                </div>
              ))}
            </>
          )}
        </aside>
      </div>
      <WeekendPreview />
      <CalendarHighlights />
      <Newsletter url={settings.newsletterUrl} />
      <section className="guides-section">
        <div className="section-heading">
          <h2>More useful guides</h2>
          <Link href="/guides" className="text-link">
            Browse all guides <DirectionIcon />
          </Link>
        </div>
        <div className="guide-grid">
          {guides.length ? (
            guides.map((s) => <StoryPreview key={s._id} story={s} />)
          ) : (
            <>
              <div>
                <h3>Find your next local favorite.</h3>
                <p>Our food guides are on the way.</p>
              </div>
              <div>
                <h3>Get to know your neighborhood.</h3>
                <p>Practical local guides are coming soon.</p>
              </div>
            </>
          )}
        </div>
      </section>
      <section className="home-business"><div><h2>Reach Gwinnett locals</h2>
        <p>Put your business in the directory or introduce it to the ATG community through a sponsorship.</p></div>
        <div className="home-actions"><Link className="button button-ink" href="/advertise">Advertise with ATG</Link>
        <Link className="text-link" href="/directory/submit">List your business <DirectionIcon /></Link></div>
      </section>
    </main>
  );
}
