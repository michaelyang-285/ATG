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
      <section className="home-welcome">
        <div><h1>What’s happening in Gwinnett?</h1>
        <p>Find a weekend plan, a new place to eat, or a local business your neighbors recommend.</p>
        <div className="home-actions"><Link className="button button-orange" href="/events">Explore events</Link>
        <Link className="text-link" href="/directory">Find a local business <DirectionIcon /></Link></div></div>
        <aside className="home-community"><h2>Ask your Gwinnett neighbors</h2>
        <p>Join <strong>39k+ members</strong> in the All Things Gwinnett Facebook group. Ask who cuts great locs, where to grab lunch in Duluth, or what’s open nearby.</p>
        <a className="text-link" href={facebookGroup}>Join the Facebook group <DirectionIcon /></a></aside>
      </section>
      <Newsletter url={settings.newsletterUrl} />
      <div className="lead-layout">
        <section className="lead-story" aria-label="Featured story">
          {featured ? (
            <>
              <Link href={storyHref(featured)} tabIndex={-1} aria-hidden="true">
                <StoryImage story={featured} priority />
              </Link>
              <h2><Link href={storyHref(featured)}>{featured.title}</Link></h2>
              <p className="story-label">
                {storyLabel(featured)}
                {isGuide(featured) ? " · Guide" : ""}
              </p>
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
              <h2>Good stories start close to home.</h2>
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
